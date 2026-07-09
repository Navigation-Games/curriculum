import React, {useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import GoogleSignInButton from '@site/src/components/GoogleSignInButton';
import {useGoogleUser, signOut} from '@site/src/lib/googleAuth';
import styles from './styles.module.css';

interface Props {
  /** The page's URL path, e.g. /curriculum/activities/core/animal-o/ */
  page: string;
  /** The page title, for easier reading in the feedback sheet */
  title: string;
}

type Rating = 'up' | 'down' | null;
type Phase = 'idle' | 'open' | 'submitting' | 'done';

export default function PageFeedback({page, title}: Props): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const apiUrl = (siteConfig.customFields?.advisorApiUrl as string) || 'http://localhost:8080';

  const [phase, setPhase] = useState<Phase>('idle');
  const [rating, setRating] = useState<Rating>(null);
  const [comment, setComment] = useState('');
  const [submitter, setSubmitter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);

  // Signed-in submissions skip the rate limit and are tagged with the
  // verified identity server-side, so the name field is hidden.
  const user = useGoogleUser();

  const pickRating = (value: 'up' | 'down') => {
    setRating(prev => (prev === value ? null : value));
    setPhase('open');
    setError(null);
  };

  const startOver = () => {
    setPhase('open');
    setRating(null);
    setComment('');
    setError(null);
  };

  const submit = async () => {
    if (phase === 'submitting') return;
    if (rating === null && !comment.trim()) return;
    setPhase('submitting');
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/page-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? {Authorization: `Bearer ${user.credential}`} : {}),
        },
        body: JSON.stringify({
          page,
          title,
          rating,
          comment: comment.trim(),
          submitter: submitter.trim(),
        }),
      });
      if (!response.ok) {
        setPhase('open');
        if (response.status === 401) {
          signOut();
          setError('Your sign-in expired. Please sign in again or submit anonymously.');
        } else if (response.status === 429) {
          setError('Feedback limit reached for today.');
        } else {
          setError('Could not send feedback right now. Please try again later.');
        }
        return;
      }
      setPhase('done');
    } catch {
      setPhase('open');
      setError('Could not send feedback right now. Please try again later.');
    }
  };

  if (phase === 'done') {
    return (
      <div className={`${styles.feedback} page-feedback-widget`}>
        <p className={styles.thanks}>
          Thanks for your feedback!{' '}
          <button type="button" className={styles.commentLink} onClick={startOver}>
            Send more feedback
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.feedback} page-feedback-widget`}>
      <div className={styles.promptRow}>
        <span className={styles.prompt}>Was this page helpful?</span>
        <button
          type="button"
          className={`${styles.thumb} ${rating === 'up' ? styles.thumbSelected : ''}`}
          onClick={() => pickRating('up')}
          aria-label="Yes, this page was helpful"
          aria-pressed={rating === 'up'}
        >
          👍
        </button>
        <button
          type="button"
          className={`${styles.thumb} ${rating === 'down' ? styles.thumbSelected : ''}`}
          onClick={() => pickRating('down')}
          aria-label="No, this page was not helpful"
          aria-pressed={rating === 'down'}
        >
          👎
        </button>
        {phase === 'idle' && (
          <button
            type="button"
            className={styles.commentLink}
            onClick={() => setPhase('open')}
          >
            Give feedback on this page
          </button>
        )}
      </div>

      {phase !== 'idle' && (
        <div className={styles.form}>
          <textarea
            className={styles.commentInput}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="What worked or what was confusing? (optional)"
            rows={3}
            disabled={phase === 'submitting'}
          />
          {user ? (
            <p className={styles.signedInNote}>
              Submitting as {user.name || user.email}{' '}
              <button type="button" className={styles.commentLink} onClick={signOut}>
                Sign out
              </button>
            </p>
          ) : (
            <>
              <input
                type="text"
                className={styles.submitterInput}
                value={submitter}
                onChange={e => setSubmitter(e.target.value)}
                placeholder="Your name or email (optional)"
                disabled={phase === 'submitting'}
              />
              {showSignIn ? (
                <div className={styles.signInButton}>
                  <GoogleSignInButton size="small" />
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.commentLink}
                  onClick={() => setShowSignIn(true)}
                >
                  Give feedback often? Sign in with Google
                </button>
              )}
            </>
          )}
          {error && <p className={styles.error}>{error}</p>}
          <button
            type="button"
            className={styles.submitButton}
            onClick={submit}
            disabled={phase === 'submitting' || (rating === null && !comment.trim())}
          >
            {phase === 'submitting' ? 'Sending…' : 'Send feedback'}
          </button>
        </div>
      )}
    </div>
  );
}
