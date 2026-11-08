import React from 'react';
import styles from './styles.module.css';

// A picture shown no wider than `width` pixels (default 320), with an
// optional caption. Put several inside <PhotoRow> to show them side by side;
// the row wraps on narrow screens.
//
// The advisor guide generator (scripts/build-content.js) drops <Pic> lines,
// so keep each <Pic ... /> on one line.

interface PicProps {
  src: string;
  alt?: string;
  caption?: string;
  width?: number;
}

// Small pictures (120px or less, such as icons) put the caption to the
// right so it isn't squeezed into the picture's width.
export function Pic({src, alt = '', caption, width = 320}: PicProps): React.ReactElement {
  const side = Boolean(caption) && width <= 120;
  return (
    <figure className={`${styles.figure} ${side ? styles.side : ''}`}>
      <img src={src} alt={alt || caption || ''} loading="lazy" style={{maxWidth: `min(${width}px, 100%)`}} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function PhotoRow({children}: {children: React.ReactNode}): React.ReactElement {
  return <div className={styles.row}>{children}</div>;
}

export default Pic;
