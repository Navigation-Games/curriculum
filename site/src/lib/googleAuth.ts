/**
 * Shared sign-in state for the curriculum site.
 *
 * Visitors can sign in with any Google account (Google Identity Services,
 * same OAuth client as the review tool), or with an emailed sign-in link
 * (see pages/sign-in.tsx). Either way the token is kept in localStorage
 * until it expires (about an hour for Google, 30 days for an email link)
 * and is sent as a Bearer token to the advisor backend, which verifies it
 * server-side. Email-link users are always viewers, never managers.
 *
 * What signing in gives you:
 * - any Google account ("viewer"): higher advisor daily limit, unlimited
 *   page feedback, feedback tagged with your verified identity
 * - navigationgames.org accounts ("manager"): also unhides the For Editors
 *   section. That check is client-side only (a soft gate on a static site);
 *   anything genuinely sensitive must be enforced by the backend, which
 *   independently verifies the hd claim.
 */

import {useEffect, useState} from 'react';

export interface AuthUser {
  credential: string;
  email: string;
  name: string;
  picture: string;
  /** Google Workspace domain (hd claim), absent for consumer accounts */
  hd?: string;
  /** Token expiry, unix seconds */
  exp: number;
  /** How they signed in; absent on sessions stored before email links existed */
  method?: 'google' | 'email';
  /**
   * For Google sign-ins: a 30-day session token from the backend
   * (/auth/google-session), so the course tutor keeps working after the
   * one-hour Google token expires. Staff features still use `credential`.
   */
  session?: string;
  sessionExp?: number;
}

const STORAGE_KEY = 'ng-google-auth';
const AUTH_EVENT = 'ng-auth-change';
const GSI_SCRIPT_ID = 'google-gsi-client';
const MANAGER_DOMAIN = 'navigationgames.org';

/** Display-only decode of the ID token payload. Authorization happens server-side. */
function decodePayload(credential: string): Record<string, unknown> | null {
  try {
    return JSON.parse(
      atob(credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    );
  } catch {
    return null;
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user: AuthUser = JSON.parse(raw);
    const sessionValid = !!user.session && (user.sessionExp || 0) * 1000 > Date.now();
    if (!user.credential || ((!user.exp || user.exp * 1000 <= Date.now()) && !sessionValid)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

function notify(): void {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

export function setCredential(credential: string): void {
  const payload = decodePayload(credential);
  if (!payload) return;
  const user: AuthUser = {
    credential,
    email: (payload.email as string) || '',
    name: (payload.name as string) || '',
    picture: (payload.picture as string) || '',
    hd: payload.hd as string | undefined,
    exp: (payload.exp as number) || 0,
    method: 'google',
  };
  storeUser(user);
}

/** Attach a long-lived backend session to the current Google sign-in. */
export function setGoogleSession(sessionToken: string, sessionExp: number): void {
  const user = getUser();
  if (!user || user.method === 'email') return;
  storeUser({...user, session: sessionToken, sessionExp});
}

/**
 * The token to send to the backend: the Google token while it's still good
 * (it carries staff status), then the long session once it has expired.
 */
export function bearerToken(user: AuthUser): string {
  const googleValid = user.method !== 'email' && user.exp * 1000 > Date.now() + 60_000;
  if (googleValid || !user.session) return user.credential;
  return user.session;
}

/** Store the session from an emailed sign-in link (verified by the backend). */
export function setEmailSession(sessionToken: string, email: string, exp: number): void {
  storeUser({credential: sessionToken, email, name: '', picture: '', exp, method: 'email'});
}

function storeUser(user: AuthUser): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Storage unavailable; sign-in just won't persist across pages
  }
  notify();
}

export function signOut(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  notify();
}

export function isManager(user: AuthUser | null): boolean {
  // Only a Google token carries hd; email-link sessions never do
  return user?.method !== 'email' && user?.hd === MANAGER_DOMAIN;
}

/** Subscribe to sign-in/sign-out changes (this tab and others). */
export function onAuthChange(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener(AUTH_EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(AUTH_EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * React hook: the signed-in user, or null.
 *
 * Always null on the first render (including SSR) so server and client
 * markup match; the real value arrives in an effect.
 */
export function useGoogleUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    setUser(getUser());
    return onAuthChange(() => setUser(getUser()));
  }, []);
  return user;
}

function loadGsiScript(onReady: () => void): void {
  const existing = document.getElementById(GSI_SCRIPT_ID);
  if (existing) {
    if ((window as any).google?.accounts?.id) {
      onReady();
    } else {
      existing.addEventListener('load', onReady);
    }
    return;
  }
  const script = document.createElement('script');
  script.id = GSI_SCRIPT_ID;
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.onload = onReady;
  document.head.appendChild(script);
}

/**
 * Render a Google sign-in button into `container`. On success the credential
 * is stored via setCredential and all useGoogleUser hooks update.
 *
 * initialize() is called before every render because other pages (the
 * review tool) install their own GIS callback; last initialize wins.
 */
export function renderSignInButton(
  container: HTMLElement,
  clientId: string,
  options: {size?: 'small' | 'medium' | 'large'} = {},
): void {
  if (!clientId) return;
  loadGsiScript(() => {
    const google = (window as any).google;
    if (!google?.accounts?.id || !container.isConnected) return;
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: {credential: string}) => setCredential(response.credential),
    });
    google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: options.size || 'medium',
      text: 'signin_with',
    });
  });
}
