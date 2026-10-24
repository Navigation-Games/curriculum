/**
 * "Email me a sign-in link", for people without a Google account.
 *
 * Asks the advisor backend to email a link (POST /auth/email-link). The link
 * opens /sign-in/, which finishes signing in and comes back to this page.
 */

import React, {useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

export default function EmailSignInForm(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const apiUrl = (siteConfig.customFields?.advisorApiUrl as string) || 'http://localhost:8080';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/auth/email-link`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: email.trim(),
          return_to: window.location.origin + window.location.pathname,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "We couldn't send the email. Please try again later.");
        setStatus('idle');
        return;
      }
      setStatus('sent');
    } catch {
      setError("We couldn't send the email. Please try again later.");
      setStatus('idle');
    }
  };

  if (status === 'sent') {
    return (
      <p className={styles.sent}>
        Check your email at <strong>{email.trim()}</strong> for a sign-in link. It works for
        15 minutes. If it doesn't arrive in a few minutes, look in your spam folder.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={send}>
      <input
        type="email"
        required
        className={styles.input}
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@school.org"
        aria-label="Email address"
      />
      <button type="submit" className={styles.button} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Email me a sign-in link'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </form>
  );
}
