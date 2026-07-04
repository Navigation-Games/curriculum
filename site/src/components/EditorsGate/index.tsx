import React from 'react';
import Link from '@docusaurus/Link';
import GoogleSignInButton from '@site/src/components/GoogleSignInButton';
import {useGoogleUser, signOut} from '@site/src/lib/googleAuth';
import styles from './styles.module.css';

/**
 * Sign-in prompt shown in place of For Editors pages for visitors who are
 * not signed in with a navigationgames.org account.
 *
 * This is a soft gate: the site is static, so the content is still in the
 * deployed files for anyone determined to find it. Its job is to keep
 * editor-facing material out of the way of teachers, not to protect
 * secrets. Anything sensitive must not be published on this site at all.
 */
export default function EditorsGate(): React.ReactElement {
  const user = useGoogleUser();

  return (
    <div className={styles.gate}>
      <h1>For Editors</h1>
      <p>
        This section contains working material for the Navigation Games
        curriculum team: editing guides, roadmaps, and draft scripts. Sign in
        with your navigationgames.org Google account to view it.
      </p>
      {user ? (
        <p className={styles.wrongAccount}>
          You are signed in as <strong>{user.email}</strong>, which is not a
          Navigation Games staff account.{' '}
          <button type="button" className={styles.signOutLink} onClick={signOut}>
            Sign in with a different account
          </button>
        </p>
      ) : (
        <div className={styles.button}>
          <GoogleSignInButton size="large" />
        </div>
      )}
      <p className={styles.note}>
        Looking for the curriculum? Head to the{' '}
        <Link to="/">home page</Link> or <Link to="/quick-start">Quick Start</Link>.
      </p>
    </div>
  );
}
