/**
 * Shared Google sign-in state for the curriculum site.
 *
 * Visitors can sign in with any Google account (Google Identity Services,
 * same OAuth client as the review tool). The ID token is kept in
 * localStorage until it expires (about an hour) and is sent as a Bearer
 * token to the advisor backend, which verifies it server-side.
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
    if (!user.credential || !user.exp || user.exp * 1000 <= Date.now()) {
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
  };
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
  return user?.hd === MANAGER_DOMAIN;
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
