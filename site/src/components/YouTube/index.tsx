import React from 'react';
import styles from './styles.module.css';

interface YouTubeProps {
  id: string;
  title?: string;
  description?: string;
}

export default function YouTube({id, title = 'Video', description}: YouTubeProps): React.ReactElement {
  const url = `https://www.youtube.com/watch?v=${id}`;

  if (!id || id === 'TODO') {
    return (
      <div className={styles.placeholder}>
        <span>Video coming soon</span>
      </div>
    );
  }
  return (
    <>
      <div className={styles.wrapper}>
        <iframe
          className={styles.iframe}
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className={styles.printInfo}>
        <span className={styles.printIcon}>&#9654;</span>
        <span className={styles.printTitle}>{title}</span>
        {description && <span className={styles.printDesc}> — {description}</span>}
        <span className={styles.printUrl}>{url}</span>
      </div>
    </>
  );
}
