import React from 'react';
import styles from './styles.module.css';

// Numbered instructions with pictures to the right of the words, like a
// printed tutorial. On phones the pictures drop below the words.
//
// <Steps>
// <Step n="4" title="Check the COM port" img="/img/x.png" alt="...">
//
// Markdown text here.
//
// </Step>
// </Steps>
//
// img2 shows a second picture after an arrow (before -> after).
// imgWidth sets the largest width of each picture, in pixels (default 160).
// The advisor guide generator (scripts/build-content.js) turns <Step> tags
// back into plain numbered text, so keep the attributes on one line.

export function Steps({children}: {children: React.ReactNode}): React.ReactElement {
  return <div className={styles.steps}>{children}</div>;
}

interface StepProps {
  n?: string | number;
  title: string;
  img?: string;
  alt?: string;
  img2?: string;
  alt2?: string;
  imgWidth?: number;
  children?: React.ReactNode;
}

export function Step({n, title, img, alt = '', img2, alt2 = '', imgWidth = 160, children}: StepProps): React.ReactElement {
  const imgStyle = {maxWidth: `min(${imgWidth}px, 100%)`};
  return (
    <div className={styles.step}>
      <div className={styles.num}>{n}</div>
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        {children}
      </div>
      {img && (
        <div className={styles.media}>
          <img src={img} alt={alt} style={imgStyle} loading="lazy" />
          {img2 && (
            <>
              <span className={styles.arrow} aria-hidden="true">→</span>
              <img src={img2} alt={alt2} style={imgStyle} loading="lazy" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
