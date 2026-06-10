import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ReviewConversations from '@site/src/components/ReviewConversations';

import styles from './review-conversations.module.css';

export default function ReviewConversationsPage(): React.ReactElement {
  return (
    <Layout
      title="Review Advisor Conversations"
      description="Navigation Games staff tool for reviewing AI advisor conversations"
    >
      <header className={styles.header}>
        <div className="container">
          <Heading as="h1">Review Advisor Conversations</Heading>
          <p className={styles.subtitle}>
            Read conversations people have had with the lesson plan advisor and
            leave feedback. Your comments guide improvements to the advisor.
          </p>
        </div>
      </header>
      <main className="container">
        <div className={styles.reviewContainer}>
          <ReviewConversations />
        </div>
      </main>
    </Layout>
  );
}
