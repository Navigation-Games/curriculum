import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function PathCard({title, description, link, emoji}: {
  title: string;
  description: string;
  link: string;
  emoji: string;
}) {
  return (
    <Link to={link} className={styles.pathCard}>
      <div className={styles.pathEmoji}>{emoji}</div>
      <Heading as="h3" className={styles.pathTitle}>{title}</Heading>
      <p className={styles.pathDescription}>{description}</p>
    </Link>
  );
}

export default function Home(): React.ReactElement {
  return (
    <Layout title="Curricula" description="Orienteering curricula for schools and camps">
      <header className={styles.hero}>
        <div className="container">
          <Heading as="h1">Navigation Games</Heading>
          <p className={styles.subtitle}>Orienteering curricula for schools and camps</p>
        </div>
      </header>
      <main className="container">
        <div className={styles.paths}>
          <PathCard
            emoji="🚀"
            title="Quick Start"
            description="New to orienteering? Pick an activity and try it today."
            link="/quick-start"
          />
          <PathCard
            emoji="🏫"
            title="Teach at a School"
            description="Structured lesson progressions by grade band, aligned to PE standards."
            link="/lessons/school"
          />
          <PathCard
            emoji="⛺"
            title="Orienteering at Camp"
            description="Intro activities and multi-session skill development programs."
            link="/lessons/camp"
          />
        </div>
        <div className={styles.secondaryLinks}>
          <Link to="/plan-my-lessons" className={styles.secondaryLink}>
            <span className={styles.secondaryEmoji}>💬</span>
            <strong>Plan My Lessons</strong>
            <span className={styles.secondaryDesc}>Get personalized recommendations from our AI advisor</span>
          </Link>
          <Link to="/about/how-to-use-this-site" className={styles.secondaryLink}>
            <span className={styles.secondaryEmoji}>📖</span>
            <strong>How to Use This Site</strong>
            <span className={styles.secondaryDesc}>A guide to finding what you need</span>
          </Link>
        </div>
      </main>
    </Layout>
  );
}
