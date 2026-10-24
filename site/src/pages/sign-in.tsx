/**
 * Landing page for emailed sign-in links (/sign-in/?token=...&next=/training/unit-0/).
 *
 * Exchanges the link's token for a 30-day session (POST
 * /auth/email-link/verify), stores it in the shared auth store, and goes on
 * to the page the visitor started from.
 */

import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {setEmailSession} from '@site/src/lib/googleAuth';

// Only follow paths on this site, never another site
function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/training/';
}

export default function SignIn(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const apiUrl = (siteConfig.customFields?.advisorApiUrl as string) || 'http://localhost:8080';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const next = safeNext(params.get('next'));
    if (!token) {
      setError('This sign-in link is missing its code. Please ask for a new one.');
      return;
    }
    fetch(`${apiUrl}/auth/email-link/verify`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({token}),
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setError(data.error || "This sign-in link didn't work. Please ask for a new one.");
          return;
        }
        setEmailSession(data.session_token, data.email, data.exp);
        window.location.replace(next);
      })
      .catch(() => setError("We couldn't reach the sign-in service. Please try the link again in a few minutes."));
  }, [apiUrl]);

  return (
    <Layout title="Signing in" noFooter>
      <main className="container margin-vert--xl">
        {error ? (
          <>
            <h1>That didn't work</h1>
            <p>{error}</p>
            <p><a href="/training/">Back to the course</a></p>
          </>
        ) : (
          <p>Signing you in...</p>
        )}
      </main>
    </Layout>
  );
}
