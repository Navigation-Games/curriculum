import React, {useState, useRef, useEffect, useCallback} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Render markdown-like text with basic formatting:
 * - **bold**
 * - [link text](url)
 * - Newlines become <br>
 * - Lines starting with "- " become list items
 */
function formatMessage(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let key = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(<ul key={key++}>{listItems}</ul>);
      listItems = [];
    }
  }

  function formatInline(line: string): React.ReactNode {
    // Process bold and links
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let partKey = 0;

    while (remaining.length > 0) {
      // Check for bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Check for links
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

      // Find which comes first
      const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
      const linkIndex = linkMatch ? remaining.indexOf(linkMatch[0]) : Infinity;

      if (boldIndex === Infinity && linkIndex === Infinity) {
        parts.push(remaining);
        break;
      }

      if (boldIndex < linkIndex) {
        if (boldIndex > 0) parts.push(remaining.slice(0, boldIndex));
        parts.push(<strong key={partKey++}>{boldMatch![1]}</strong>);
        remaining = remaining.slice(boldIndex + boldMatch![0].length);
      } else {
        if (linkIndex > 0) parts.push(remaining.slice(0, linkIndex));
        const href = linkMatch![2].startsWith('/')
          ? linkMatch![2]
          : linkMatch![2];
        parts.push(
          <a key={partKey++} href={href} target={href.startsWith('/') ? undefined : '_blank'} rel="noopener noreferrer">
            {linkMatch![1]}
          </a>,
        );
        remaining = remaining.slice(linkIndex + linkMatch![0].length);
      }
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }

  for (const line of lines) {
    if (line.startsWith('- ')) {
      listItems.push(<li key={key++}>{formatInline(line.slice(2))}</li>);
    } else {
      flushList();
      if (line.trim() === '') {
        elements.push(<br key={key++} />);
      } else if (line.startsWith('### ')) {
        elements.push(<h4 key={key++}>{formatInline(line.slice(4))}</h4>);
      } else if (line.startsWith('## ')) {
        elements.push(<h3 key={key++}>{formatInline(line.slice(3))}</h3>);
      } else {
        elements.push(<p key={key++}>{formatInline(line)}</p>);
      }
    }
  }
  flushList();

  return <>{elements}</>;
}

export default function AdvisorChat(): React.ReactElement {
  const {siteConfig} = useDocusaurusContext();
  const apiUrl = (siteConfig.customFields?.advisorApiUrl as string) || 'http://localhost:8080';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages, isLoading]);

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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          conversation_id: conversationId,
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      const data = await response.json();
      setConversationId(data.conversation_id);
      setMessages([
        ...updatedMessages,
        {role: 'assistant', content: data.response},
      ]);
    } catch (err) {
      setError('fallback');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages, conversationId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const greeting = messages.length === 0;

  return (
    <div className={styles.chat}>
      <div className={styles.messages}>
        {greeting && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.bubble}>
              <p>
                Hi! I'm the Navigation Games lesson plan advisor. I can help you
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

        {error && (
          <div className={styles.error}>
            <p>
              The lesson plan advisor isn't available right now. For help planning
              your orienteering lessons, contact Navigation Games
              at{' '}
              <a href="mailto:admin@navigationgames.org">admin@navigationgames.org</a>.
            </p>
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
