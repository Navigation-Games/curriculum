import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import AdvisorChat from '@site/src/components/AdvisorChat';

import styles from './plan-my-lessons.module.css';

export default function PlanMyLessons(): React.ReactElement {
  return (
    <Layout
      title="Plan My Lessons"
      description="Get personalized orienteering lesson recommendations from the Navigation Games AI advisor"
    >
      <header className={styles.header}>
        <div className="container">
          <Heading as="h1">Plan My Lessons</Heading>
          <p className={styles.subtitle}>
            Tell us about your teaching situation and we'll recommend a lesson
            sequence tailored to your grade level, schedule, and space.
          </p>
        </div>
      </header>
      <main className="container">
        <div className={styles.chatContainer}>
          <AdvisorChat />
        </div>
      </main>
    </Layout>
  );
}
