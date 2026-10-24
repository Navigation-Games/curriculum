/**
 * The course tutor chat on each unit page of the teacher course
 * (/training/unit-N/). Pages are generated from content/training/ by
 * scripts/build-training.js, which passes in the unit and its opening message.
 *
 * Teachers sign in first, with Google or an emailed link. Then:
 * - Each unit's conversation is saved in this browser (localStorage), and on
 *   the server through the conversation log, so a teacher can stop and pick
 *   up later on any device (GET /tutor/progress).
 * - When the tutor writes a ```profile block (Unit 0), it is saved as the
 *   teacher's learner profile and sent with every later unit's messages.
 * - When the tutor writes a ```deliverable block, it is saved for that unit.
 *
 * Messages go to the advisor backend's /tutor endpoint, which logs them for
 * Navigation Games review like the lesson plan advisor's.
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import GoogleSignInButton from '@site/src/components/GoogleSignInButton';
import EmailSignInForm from '@site/src/components/EmailSignInForm';
import {useGoogleUser, signOut} from '@site/src/lib/googleAuth';
import formatMessage from '@site/src/components/AdvisorChat/formatMessage';
import chatStyles from '@site/src/components/AdvisorChat/styles.module.css';
import styles from './styles.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  unit: string;
  opening: string;
}

const PROFILE_KEY = 'ng-course-profile';
const conversationKey = (unit: string) => `ng-course-${unit}-conversation`;
const deliverableKey = (unit: string) => `ng-course-${unit}-deliverable`;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable; the chat still works, it just won't be saved
  }
}

function newConversationId(unit: string): string {
  const random = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
  return `tutor-${unit}-${random}`;
}

// Splits a tutor message into plain text and saved blocks (```profile, ```deliverable).
type Part = {kind: 'text' | 'profile' | 'deliverable'; text: string};

function splitBlocks(message: string): Part[] {
  const parts: Part[] = [];
  const pattern = /```(profile|deliverable)\n([\s\S]*?)```/g;
  let last = 0;
  for (const match of message.matchAll(pattern)) {
    if (match.index! > last) parts.push({kind: 'text', text: message.slice(last, match.index)});
    parts.push({kind: match[1] as Part['kind'], text: match[2].trim()});
    last = match.index! + match[0].length;
  }
  if (last < message.length) parts.push({kind: 'text', text: message.slice(last)});
  return parts;
}

function SavedBlock({kind, text}: {kind: 'profile' | 'deliverable'; text: string}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => setCopied(true));
  };
  return (
    <div className={styles.savedBlock}>
      <div className={styles.savedHeading}>
        {kind === 'profile' ? 'Your learner profile (saved)' : 'Your deliverable (saved)'}
        <button className={styles.copyButton} onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={styles.savedText}>{text}</pre>
    </div>
  );
}

function TutorMessage({content}: {content: string}) {
  return (
    <>
      {splitBlocks(content).map((part, i) =>
        part.kind === 'text'
          ? <React.Fragment key={i}>{formatMessage(part.text.trim())}</React.Fragment>
          : <SavedBlock key={i} kind={part.kind} text={part.text} />,
      )}
    </>
  );
}

export default function TrainingTutor({unit, opening}: Props): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const apiUrl = (siteConfig.customFields?.advisorApiUrl as string) || 'http://localhost:8080';
  const googleUser = useGoogleUser();

  const [conversationId, setConversationId] = useState(() => newConversationId(unit));
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesBoxRef = useRef<HTMLDivElement>(null);

  // Restore this unit's conversation (localStorage only exists in the browser)
  useEffect(() => {
    const stored = load<{id: string; messages: Message[]} | null>(conversationKey(unit), null);
    if (stored?.messages?.length) {
      setConversationId(stored.id);
      setMessages(stored.messages);
    }
  }, [unit]);

  // Once signed in, pick up saved progress from the server (any device).
  // The server copy wins unless this browser has more of the conversation.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  useEffect(() => {
    if (!googleUser) return;
    fetch(`${apiUrl}/tutor/progress`, {headers: {Authorization: `Bearer ${googleUser.credential}`}})
      .then(response => (response.ok ? response.json() : null))
      .then(progress => {
        if (!progress) return;
        if (progress.profile) save(PROFILE_KEY, progress.profile);
        const saved = progress.units?.[unit];
        if (saved?.messages?.length && saved.messages.length >= messagesRef.current.length) {
          setConversationId(saved.conversation_id);
          setMessages(saved.messages);
        }
      })
      .catch(() => {
        // Offline or an older backend: keep what this browser has
      });
  }, [googleUser?.credential, unit, apiUrl]);

  useEffect(() => {
    if (messages.length) save(conversationKey(unit), {id: conversationId, messages});
  }, [messages, conversationId, unit]);

  // Keep the newest message in view, but only after the teacher sends or a
  // reply arrives, never on page load or when saved progress is restored.
  // Scrolling the messages box itself (not scrollIntoView) keeps the page still.
  const followNewMessages = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const box = messagesBoxRef.current;
    if (followNewMessages.current && box) box.scrollTop = box.scrollHeight;
    // When a reply has arrived, put the cursor back in the answer box
    if (followNewMessages.current && !isLoading) inputRef.current?.focus({preventScroll: true});
  }, [messages, isLoading]);

  const keepSavedBlocks = (reply: string) => {
    for (const part of splitBlocks(reply)) {
      if (part.kind === 'profile') save(PROFILE_KEY, part.text);
      if (part.kind === 'deliverable') save(deliverableKey(unit), part.text);
    }
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || !googleUser) return;
    setError(null);
    setInput('');
    const updated: Message[] = [...messages, {role: 'user', content: text}];
    followNewMessages.current = true;
    setMessages(updated);
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${googleUser.credential}`,
        },
        body: JSON.stringify({
          unit,
          conversation_id: conversationId,
          messages: updated,
          profile: load<string>(PROFILE_KEY, ''),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) signOut();
        setError(data.error || 'The tutor is not available right now. Please try again later.');
        setMessages(messages); // put the unsent message back in the box
        setInput(text);
        return;
      }

      keepSavedBlocks(data.response);
      setConversationId(data.conversation_id);
      setMessages([...updated, {role: 'assistant', content: data.response}]);
    } catch {
      setError('The tutor is not available right now. Please try again later.');
      setMessages(messages);
      setInput(text);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, apiUrl, googleUser, unit, conversationId]);

  const startOver = () => {
    if (!window.confirm('Start this unit\'s conversation over? Your saved profile and deliverables stay.')) return;
    localStorage.removeItem(conversationKey(unit));
    setMessages([]);
    setConversationId(newConversationId(unit));
    setError(null);
  };

  return (
    <div className={`${chatStyles.chat} ${styles.tutor}`}>
      <div className={chatStyles.chatHeader}>
        {googleUser && (
          <span className={chatStyles.userName}>
            {googleUser.name || googleUser.email}{' '}
            <button className={chatStyles.signOutButton} onClick={signOut}>Sign out</button>
          </span>
        )}
        {googleUser && messages.length > 0 && (
          <button className={chatStyles.newChatButton} onClick={startOver}>Start over</button>
        )}
      </div>

      <div className={chatStyles.messages} ref={messagesBoxRef}>
        <div className={`${chatStyles.message} ${chatStyles.assistant}`}>
          <div className={chatStyles.bubble}>{formatMessage(opening)}</div>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`${chatStyles.message} ${chatStyles[msg.role]}`}>
            <div className={chatStyles.bubble}>
              {msg.role === 'assistant' ? <TutorMessage content={msg.content} /> : <p>{msg.content}</p>}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className={`${chatStyles.message} ${chatStyles.assistant}`}>
            <div className={`${chatStyles.bubble} ${chatStyles.loading}`}>
              <span className={chatStyles.dot} />
              <span className={chatStyles.dot} />
              <span className={chatStyles.dot} />
            </div>
          </div>
        )}

        {error && <div className={chatStyles.error}><p>{error}</p></div>}
      </div>

      {!googleUser ? (
        <div className={styles.signIn}>
          <p className={styles.signInHeading}>Sign in to start</p>
          <p>
            Your conversations are saved to your account, so you can stop and pick up
            again later, on any computer.
          </p>
          <GoogleSignInButton size="medium" />
          <p className={styles.signInOr}>
            No Google account? You can also use any email address:
          </p>
          <EmailSignInForm />
        </div>
      ) : (
      <div className={chatStyles.inputArea}>
        <textarea
          ref={inputRef}
          className={chatStyles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type your answer..."
          rows={2}
          disabled={isLoading}
        />
        <button className={chatStyles.sendButton} onClick={send} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </div>
      )}

      <p className={styles.disclosure}>
        The tutor is an AI assistant. Your conversations are saved with your sign-in
        and recorded for Navigation Games staff, who review them and reply.
      </p>
    </div>
  );
}
