/**
 * Wraps a unit page of the teacher course (/training/unit-N/). The unit's text
 * and the tutor show only to someone who is signed in, is enrolled in the
 * course, and is looking at a unit that is open. Navigation Games staff
 * (a navigationgames.org Google sign-in) see every unit, with a note on the
 * ones that aren't open to teachers yet.
 *
 * Sign-in is the site's shared sign-in, so signing in here also signs in the
 * tutor further down the page. The real checks are on the backend
 * (/training/access, and the tutor endpoints refuse the same people). The
 * page text itself is in the static site, so this gate keeps it out of the
 * way, it doesn't lock it.
 */

import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import GoogleSignInButton from '@site/src/components/GoogleSignInButton';
import EmailSignInForm from '@site/src/components/EmailSignInForm';
import {useGoogleUser, signOut, bearerToken} from '@site/src/lib/googleAuth';
import styles from './styles.module.css';

interface Props {
  unit: string; // "unit-3"
  children: React.ReactNode;
}

interface Access {
  enrolled: boolean;
  is_staff?: boolean;
  units_open?: number | null; // null: every unit is open to this person
  teachers_units_open?: number | null; // staff only: how far the course is open to teachers
}

type State =
  | {status: 'checking'}
  | {status: 'error'; message: string}
  | {status: 'ready'; access: Access};

function unitNumber(slug: string): number {
  const match = slug.match(/^unit-(\d+)$/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export default function TrainingGate({unit, children}: Props): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const apiUrl = (siteConfig.customFields?.advisorApiUrl as string) || 'http://localhost:8080';
  const user = useGoogleUser();

  // useGoogleUser is null until the browser has read the saved sign-in; wait for
  // that so a signed-in teacher doesn't see the sign-in box flash by
  const [browserReady, setBrowserReady] = useState(false);
  useEffect(() => setBrowserReady(true), []);

  const [state, setState] = useState<State>({status: 'checking'});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setState({status: 'checking'});
    fetch(`${apiUrl}/training/access`, {headers: {Authorization: `Bearer ${bearerToken(user)}`}})
      .then(async response => {
        if (response.status === 401) {
          signOut(); // the saved sign-in has expired; show the sign-in box again
          return;
        }
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "We couldn't check your access.");
        if (!cancelled) setState({status: 'ready', access: data});
      })
      .catch(error => {
        if (!cancelled) setState({status: 'error', message: error.message || "We couldn't check your access."});
      });
    return () => {
      cancelled = true;
    };
  }, [apiUrl, user?.email, user?.credential, user?.session, attempt]);

  if (!browserReady) return <div className={styles.gate}>Loading...</div>;

  if (!user) {
    return (
      <div className={styles.gate}>
        <p className={styles.heading}>Sign in to start this unit</p>
        <p>
          This course is for teachers and school leaders taking part in Kickstart Orienteering. Sign in with
          the email address we have for you. Your conversations are saved to your account, so you can stop and
          pick up again later, on any computer.
        </p>
        <GoogleSignInButton size="medium" />
        <p className={styles.or}>No Google account? You can also use any email address:</p>
        <EmailSignInForm />
        <p className={styles.note}>
          Not enrolled yet? Write to <a href="mailto:admin@navigationgames.org">admin@navigationgames.org</a>.
          You can read about the course on the <Link to="/training/">course home page</Link>.
        </p>
      </div>
    );
  }

  const signedInAs = (
    <p className={styles.note}>
      Signed in as <strong>{user.email}</strong>.{' '}
      <button type="button" className={styles.linkButton} onClick={signOut}>
        Sign in with a different address
      </button>
    </p>
  );

  // A Google sign-in lasts about an hour. After that the 30-day session takes
  // over, and it never carries staff status, so staff see the teacher's view
  // (often "not enrolled" or "not open yet") while still showing as signed in.
  const staffSignInExpired =
    user.method !== 'email' && user.hd === 'navigationgames.org' && user.exp * 1000 <= Date.now() + 60_000;
  const staffNote = staffSignInExpired ? (
    <div className={styles.staffNote}>
      <p>
        <strong>Navigation Games staff:</strong> your Google sign-in lasts about an hour, and after that the
        course treats you like a teacher, even though it still shows you as signed in. If you can't see
        something, sign in with Google again.
      </p>
      <GoogleSignInButton size="medium" />
    </div>
  ) : null;

  if (state.status === 'checking') return <div className={styles.gate}>Checking your access...</div>;

  if (state.status === 'error') {
    return (
      <div className={styles.gate}>
        <p className={styles.heading}>We couldn't check your access</p>
        <p>{state.message}</p>
        <button type="button" className="button button--primary" onClick={() => setAttempt(n => n + 1)}>
          Try again
        </button>
        {signedInAs}
        {staffNote}
      </div>
    );
  }

  const {access} = state;

  if (!access.enrolled) {
    return (
      <div className={styles.gate}>
        <p className={styles.heading}>This address isn't enrolled in the course yet</p>
        <p>
          The course is for teachers taking part in Kickstart Orienteering. If you were expecting access,
          sign in with the address we have for you, or write to{' '}
          <a href="mailto:admin@navigationgames.org">admin@navigationgames.org</a> and we'll sort it out.
        </p>
        {signedInAs}
        {staffNote}
      </div>
    );
  }

  const number = unitNumber(unit);
  if (access.units_open != null && number > access.units_open) {
    return (
      <div className={styles.gate}>
        <p className={styles.heading}>Unit {number} isn't open yet</p>
        <p>
          This unit will be available soon. Meanwhile, the units before it are open on
          the <Link to="/training/">course home page</Link>.
        </p>
        {signedInAs}
        {staffNote}
      </div>
    );
  }

  const previewOnly =
    access.is_staff && access.teachers_units_open != null && number > access.teachers_units_open;

  return (
    <>
      <p className={styles.signedIn}>
        Signed in as <strong>{user.email}</strong>.{' '}
        <button type="button" className={styles.linkButton} onClick={signOut}>
          Sign out
        </button>
      </p>
      {previewOnly && (
        <div className={styles.preview}>
          Staff preview: Unit {number} isn't open to teachers yet. Only people signed in with a
          navigationgames.org Google account can see it.
        </div>
      )}
      {children}
    </>
  );
}
