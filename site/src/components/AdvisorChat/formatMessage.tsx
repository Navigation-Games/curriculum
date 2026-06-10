import React from 'react';

/**
 * Render markdown-like text with basic formatting:
 * - **bold**
 * - [link text](url)
 * - Newlines become <br>
 * - Lines starting with "- " become list items
 *
 * Shared by AdvisorChat (live chat) and ReviewConversations (staff review),
 * so advisor responses render identically in both places.
 */
export default function formatMessage(text: string): React.ReactNode {
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
