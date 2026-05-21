import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

interface ActivityCardProps {
  title: string;
  description: string;
  link?: string;
  image?: string;
  tag?: 'core' | 'readiness' | 'variation' | 'extension';
}

export default function ActivityCard({
  title,
  description,
  link,
  image,
  tag,
}: ActivityCardProps): React.ReactElement {
  const content = (
    <div className={styles.card}>
      {image && (
        <div className={styles.imageWrapper}>
          <img src={image} alt={title} className={styles.image} />
        </div>
      )}
      <div className={styles.body}>
        {tag && <span className={`${styles.tag} ${styles[`tag-${tag}`]}`}>{tag}</span>}
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link} className={styles.link}>{content}</Link>;
  }
  return content;
}
