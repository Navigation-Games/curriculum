import React, {useState, useRef, useEffect, useCallback} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import GoogleSignInButton from '@site/src/components/GoogleSignInButton';
import {useGoogleUser, signOut} from '@site/src/lib/googleAuth';
import formatMessage from './formatMessage';
import styles from './styles.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserInfo {
  name: string;
  email: string;
  organization: string;
}

const STORAGE_KEY = 'ng-advisor-session';

interface StoredSession {
  conversationId: string;
  messages: Message[];
  userInfo: UserInfo;
}

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.conversationId && Array.isArray(parsed.messages)) {
      return parsed;
    }
  } catch {
    // Corrupted data, ignore
  }
  return null;
}

function saveSession(session: StoredSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage full or unavailable, ignore
  }
}

function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

function generateId(): string {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AdvisorChat(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const apiUrl = (siteConfig.customFields?.advisorApiUrl as string) || 'http://localhost:8080';

  // Try to restore a previous session
  const restored = loadSession();

  const [messages, setMessages] = useState<Message[]>(restored?.messages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(
    restored?.conversationId || generateId()
  );
  const [userInfo, setUserInfo] = useState<UserInfo>(
    restored?.userInfo || {name: '', email: '', organization: ''}
  );
  const [showIntro, setShowIntro] = useState(!restored);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Optional Google sign-in: raises the daily message limit. The token is
  // verified server-side; here it just fills the intro form and the header.
  const googleUser = useGoogleUser();
  useEffect(() => {
    if (googleUser) {
      setUserInfo(prev => ({
        ...prev,
        name: prev.name || googleUser.name,
        email: prev.email || googleUser.email,
      }));
    }
  }, [googleUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages, isLoading]);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (!showIntro && messages.length > 0) {
      saveSession({conversationId, messages, userInfo});
    }
  }, [messages, conversationId, userInfo, showIntro]);

  // Auto-resize textarea
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      // Reset height to auto to get correct scrollHeight
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
    },
    [],
  );

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setError(null);
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    const userMessage: Message = {role: 'user', content: text};
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(googleUser ? {Authorization: `Bearer ${googleUser.credential}`} : {}),
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          messages: updatedMessages,
          user_info: userInfo,
        }),
      });

      if (response.status === 401) {
        // Google sign-in expired; drop it so the header offers sign-in again
        signOut();
        setError('Your sign-in expired. Sign in again above, then resend your message.');
        setMessages(messages); // put the unsent message back in the box
        setInput(text);
        return;
      }
      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Daily message limit reached.');
        setMessages(messages);
        setInput(text);
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      const data = await response.json();
      setConversationId(data.conversation_id);
      const newMessages: Message[] = [
        ...updatedMessages,
        {role: 'assistant', content: data.response},
      ];
      setMessages(newMessages);
    } catch (err) {
      setError('fallback');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages, conversationId, userInfo, googleUser]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const handleStartChat = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setShowIntro(false);
  }, []);

  const handleNewConversation = useCallback(() => {
    clearSession();
    setMessages([]);
    setConversationId(generateId());
    setError(null);
    // Keep userInfo so they don't have to re-enter it
    setShowIntro(true);
  }, []);

  // Intro screen with optional user info
  if (showIntro) {
    return (
      <div className={styles.chat}>
        <div className={styles.intro}>
          <h3>Navigation Games Lesson Plan Advisor</h3>
          <p>
            I can help you put together an orienteering unit that fits your
            grade level, schedule, and space.
          </p>
          <p className={styles.introSubtext}>
            Your name helps us follow up on your questions. Email and
            organization are optional but help us improve our curriculum.
          </p>
          {!googleUser && (
            <div className={styles.introSignIn}>
              <GoogleSignInButton size="medium" />
              <span className={styles.introSignInHint}>
                Optional: sign in for a higher daily message limit
              </span>
            </div>
          )}
          <form onSubmit={handleStartChat} className={styles.introForm}>
            <label className={styles.introLabel}>
              Name
              <input
                type="text"
                value={userInfo.name}
                onChange={e => setUserInfo({...userInfo, name: e.target.value})}
                required
                className={styles.introInput}
              />
            </label>
            <label className={styles.introLabel}>
              Email
              <input
                type="email"
                value={userInfo.email}
                onChange={e => setUserInfo({...userInfo, email: e.target.value})}
                placeholder="Optional"
                className={styles.introInput}
              />
            </label>
            <label className={styles.introLabel}>
              School or organization
              <input
                type="text"
                value={userInfo.organization}
                onChange={e => setUserInfo({...userInfo, organization: e.target.value})}
                placeholder="Optional"
                className={styles.introInput}
              />
            </label>
            <button type="submit" className={styles.startButton}>
              Start chatting
            </button>
          </form>
          <p className={styles.introDisclosure}>
            Conversations are recorded and reviewed by Navigation Games staff
            to improve the curriculum.
          </p>
        </div>
      </div>
    );
  }

  const greeting = messages.length === 0;

  return (
    <div className={styles.chat}>
      <div className={styles.chatHeader}>
        {googleUser ? (
          <span className={styles.userName}>
            {googleUser.name || googleUser.email}{' '}
            <button className={styles.signOutButton} onClick={signOut}>
              Sign out
            </button>
          </span>
        ) : (
          userInfo.name && <span className={styles.userName}>{userInfo.name}</span>
        )}
        <button
          className={styles.newChatButton}
          onClick={handleNewConversation}
          title="Start a new conversation"
        >
          New conversation
        </button>
      </div>
      <div className={styles.messages}>
        {greeting && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.bubble}>
              <p>
                Hi{userInfo.name ? ` ${userInfo.name}` : ''}! I'm the Navigation Games lesson plan advisor. I can help you
                put together an orienteering unit that fits your grade level,
                schedule, and space.
              </p>
              <p>Tell me about your situation and I'll suggest a lesson sequence.</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.message} ${styles[msg.role]}`}
          >
            <div className={styles.bubble}>
              {msg.role === 'assistant'
                ? formatMessage(msg.content)
                : <p>{msg.content}</p>}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={`${styles.bubble} ${styles.loading}`}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          </div>
        )}

        {error === 'fallback' && (
          <div className={styles.error}>
            <p>
              The lesson plan advisor isn't available right now. For help planning
              your orienteering lessons, contact Navigation Games
              at{' '}
              <a href="mailto:admin@navigationgames.org">admin@navigationgames.org</a>.
            </p>
          </div>
        )}
        {error && error !== 'fallback' && (
          <div className={styles.error}>
            <p>{error}</p>
            {!googleUser && (
              <div className={styles.errorSignIn}>
                <GoogleSignInButton size="medium" />
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe your teaching situation..."
          rows={1}
          disabled={isLoading}
        />
        <button
          className={styles.sendButton}
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
}
