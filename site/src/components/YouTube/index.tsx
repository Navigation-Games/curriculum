import React from 'react';
import styles from './styles.module.css';

interface YouTubeProps {
  id: string;
  title?: string;
}

export default function YouTube({id, title = 'Video'}: YouTubeProps): React.ReactElement {
  if (!id || id === 'TODO') {
    return (
      <div className={styles.placeholder}>
        <span>Video coming soon</span>
      </div>
    );
  }
  return (
    <div className={styles.wrapper}>
      <iframe
        className={styles.iframe}
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
