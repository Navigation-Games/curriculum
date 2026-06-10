import React, {useState, useRef, useEffect, useCallback} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import formatMessage from '../AdvisorChat/formatMessage';
import styles from './styles.module.css';

interface ConversationSummary {
  conversation_id: string;
  started_at: string;
  user_name: string;
  user_org: string;
  first_user_message: string;
  message_count: number;
  comment_count: number;
  my_status: 'commented' | 'dismissed' | null;
}

interface ThreadMessage {
  msg_number: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface FeedbackEntry {
  timestamp: string;
  reviewer_email: string;
  status: 'commented' | 'dismissed';
  feedback: string;
}

interface Thread {
  conversation_id: string;
  started_at: string;
  user_name: string;
  user_org: string;
  messages: ThreadMessage[];
  feedback: FeedbackEntry[];
  my_status: 'commented' | 'dismissed' | null;
}

const GSI_SCRIPT_ID = 'google-gsi-client';

/** Display-only decode of the ID token payload. Authorization happens server-side. */
function emailFromIdToken(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.email || '';
  } catch {
    return '';
  }
}

export default function ReviewConversations(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const apiUrl = (siteConfig.customFields?.advisorApiUrl as string) || 'http://localhost:8080';
  const clientId = (siteConfig.customFields?.reviewOauthClientId as string) || '';

  // Token lives in memory only; reviewers re-auth (one click) after ~1 hour.
  const [token, setToken] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [thread, setThread] = useState<Thread | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const signInButtonRef = useRef<HTMLDivElement>(null);
  const reviewerEmail = token ? emailFromIdToken(token) : '';

  // Load the Google Identity Services script and render the sign-in button
  useEffect(() => {
    if (token || !clientId) return;

    function initGsi() {
      const google = (window as any).google;
      if (!google?.accounts?.id || !signInButtonRef.current) return;
      google.accounts.id.initialize({
        client_id: clientId,
        // hd narrows the account picker; real enforcement is server-side
        hd: 'navigationgames.org',
        auto_select: true,
        callback: (response: {credential: string}) => {
          setToken(response.credential);
          setSessionExpired(false);
          setError(null);
        },
      });
      google.accounts.id.renderButton(signInButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
      });
    }

    const existing = document.getElementById(GSI_SCRIPT_ID);
    if (existing) {
      initGsi();
      return;
    }
    const script = document.createElement('script');
    script.id = GSI_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = initGsi;
    document.head.appendChild(script);
  }, [token, clientId]);

  const apiFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const response = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          ...(options.body ? {'Content-Type': 'application/json'} : {}),
        },
      });
      if (response.status === 401) {
        setToken(null);
        setSessionExpired(true);
        throw new Error('Session expired');
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      return response.json();
    },
    [apiUrl, token],
  );

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/review/conversations?all=${showAll}`);
      setConversations(data.conversations);
    } catch (err) {
      if ((err as Error).message !== 'Session expired') {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFetch, showAll]);

  // Fetch the list when signed in or when the Show All toggle changes
  useEffect(() => {
    if (token && !thread) {
      loadList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, showAll]);

  const openThread = useCallback(
    async (conversationId: string) => {
      setLoading(true);
      setError(null);
      setCommentText('');
      try {
        const data = await apiFetch(`/review/conversations/${conversationId}`);
        setThread(data);
      } catch (err) {
        if ((err as Error).message !== 'Session expired') {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    },
    [apiFetch],
  );

  const backToList = useCallback(() => {
    setThread(null);
    setError(null);
    loadList();
  }, [loadList]);

  const submitComment = useCallback(async () => {
    if (!thread || !commentText.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/review/conversations/${thread.conversation_id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({feedback: commentText.trim()}),
      });
      setCommentText('');
      // Refetch so the new comment appears
      await openThread(thread.conversation_id);
    } catch (err) {
      if ((err as Error).message !== 'Session expired') {
        setError((err as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  }, [apiFetch, thread, commentText, submitting, openThread]);

  const dismissConversation = useCallback(async () => {
    if (!thread || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/review/conversations/${thread.conversation_id}/dismiss`, {
        method: 'POST',
      });
      backToList();
    } catch (err) {
      if ((err as Error).message !== 'Session expired') {
        setError((err as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  }, [apiFetch, thread, submitting, backToList]);

  // --- Sign-in gate ---
  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.signIn}>
          <p>
            This page is for Navigation Games staff to review advisor
            conversations and leave feedback. Sign in with your
            navigationgames.org Google account.
          </p>
          {sessionExpired && (
            <p className={styles.expired}>Your session expired. Please sign in again.</p>
          )}
          {!clientId && (
            <p className={styles.expired}>
              Sign-in is not configured yet (missing OAuth client ID).
            </p>
          )}
          <div ref={signInButtonRef} className={styles.signInButton} />
        </div>
      </div>
    );
  }

  // --- Thread view ---
  if (thread) {
    const comments = thread.feedback.filter(f => f.status === 'commented');
    const dismissals = thread.feedback.filter(f => f.status === 'dismissed');
    return (
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <button className={styles.linkButton} onClick={backToList}>
            &larr; Back to conversations
          </button>
          <span className={styles.reviewerEmail}>{reviewerEmail}</span>
        </div>

        <div className={styles.threadHeader}>
          <strong>{thread.user_name || 'Anonymous'}</strong>
          {thread.user_org && <span> &middot; {thread.user_org}</span>}
          <span className={styles.threadDate}> &middot; {thread.started_at}</span>
        </div>

        <div className={styles.messages}>
          {thread.messages.map(msg => (
            <div key={msg.msg_number} className={`${styles.message} ${styles[msg.role]}`}>
              <div className={styles.bubble}>
                {msg.role === 'assistant' ? formatMessage(msg.content) : <p>{msg.content}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.feedbackSection}>
          <h3>Feedback</h3>
          {comments.length === 0 && dismissals.length === 0 && (
            <p className={styles.noComments}>No feedback yet. You're the first reviewer.</p>
          )}
          {comments.map((c, i) => (
            <div key={i} className={styles.comment}>
              <div className={styles.commentMeta}>
                <strong>{c.reviewer_email}</strong> &middot; {c.timestamp}
              </div>
              <p>{c.feedback}</p>
            </div>
          ))}
          {dismissals.map((d, i) => (
            <p key={i} className={styles.dismissalNote}>
              {d.reviewer_email} dismissed this conversation
            </p>
          ))}

          {error && <p className={styles.error}>{error}</p>}

          <textarea
            className={styles.commentInput}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="What did the advisor do well or poorly here? What should change?"
            rows={4}
            disabled={submitting}
          />
          <div className={styles.commentActions}>
            <button
              className={styles.primaryButton}
              onClick={submitComment}
              disabled={submitting || !commentText.trim()}
            >
              Submit feedback
            </button>
            {thread.my_status === null && (
              <button
                className={styles.secondaryButton}
                onClick={dismissConversation}
                disabled={submitting}
              >
                Skip — nothing to add
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- List view ---
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <label className={styles.showAllToggle}>
          <input
            type="checkbox"
            checked={showAll}
            onChange={e => setShowAll(e.target.checked)}
          />{' '}
          Show all (including ones you've reviewed or dismissed)
        </label>
        <span className={styles.reviewerEmail}>{reviewerEmail}</span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.loadingNote}>Loading conversations…</p>}

      {conversations && !loading && (
        <>
          <p className={styles.listSummary}>
            {showAll
              ? `${conversations.length} conversation${conversations.length === 1 ? '' : 's'}`
              : `${conversations.length} conversation${conversations.length === 1 ? '' : 's'} needing your review`}
          </p>
          {conversations.length === 0 && !showAll && (
            <p className={styles.noComments}>
              All caught up! Check "Show all" to revisit conversations you've
              already reviewed.
            </p>
          )}
          <div className={styles.cardList}>
            {conversations.map(conv => (
              <button
                key={conv.conversation_id}
                className={styles.card}
                onClick={() => openThread(conv.conversation_id)}
              >
                <div className={styles.cardHeader}>
                  <strong>{conv.user_name || 'Anonymous'}</strong>
                  {conv.user_org && <span> &middot; {conv.user_org}</span>}
                  <span className={styles.cardDate}>{conv.started_at}</span>
                </div>
                <p className={styles.cardSnippet}>{conv.first_user_message}</p>
                <div className={styles.cardFooter}>
                  <span>{conv.message_count} messages</span>
                  {conv.comment_count > 0 && (
                    <span className={styles.commentBadge}>
                      {conv.comment_count} comment{conv.comment_count === 1 ? '' : 's'}
                    </span>
                  )}
                  {conv.my_status === 'commented' && (
                    <span className={styles.statusChip}>You commented</span>
                  )}
                  {conv.my_status === 'dismissed' && (
                    <span className={styles.statusChip}>You dismissed</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
