import React, {useState} from 'react';
import styles from './styles.module.css';

interface YouTubeProps {
  id: string;
  title?: string;
  description?: string;
  start?: number;
  end?: number;
  // An image to show instead of YouTube's own preview frame. The video loads
  // (and starts) only when it's clicked.
  poster?: string;
  // Show the player smaller than the full column width, in pixels
  // (it still shrinks on phones, and full screen still works).
  maxWidth?: number;
}

export default function YouTube({id, title = 'Video', description, start, end, poster, maxWidth}: YouTubeProps): React.ReactElement {
  const [playing, setPlaying] = useState(false);
  const params = new URLSearchParams();
  if (start) params.set('start', String(start));
  if (end) params.set('end', String(end));
  const query = params.toString();
  const embedParams = new URLSearchParams(params);
  // Suggested videos at the end come only from the same channel (NG's).
  // YouTube has no option to allow other channels such as OUSA or IOF.
  embedParams.set('rel', '0');
  if (poster) embedParams.set('autoplay', '1');
  const embedQuery = embedParams.toString();
  const url = `https://www.youtube.com/watch?v=${id}${query ? `&${query}` : ''}`;

  if (!id || id === 'TODO') {
    return (
      <div className={styles.placeholder}>
        <span>Video coming soon</span>
      </div>
    );
  }
  return (
    <>
      <div style={maxWidth ? {maxWidth} : undefined}>
      <div className={styles.wrapper}>
        {poster && !playing ? (
          <button className={styles.poster} onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
            <img src={poster} alt="" />
            <span className={styles.playIcon} aria-hidden="true">&#9654;</span>
          </button>
        ) : (
        <iframe
          className={styles.iframe}
          src={`https://www.youtube.com/embed/${id}?${embedQuery}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        )}
      </div>
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
