import React from 'react';
import styles from './styles.module.css';

interface OnePagerProps {
  title: string;
  tagline: string;
  epigraph?: string;
  description?: string;
  image?: string;
  time?: string;
  space?: string;
  materials?: string | string[];
  setup?: string;
  vocabulary?: string[];
  goals?: string[];
  delivery?: React.ReactNode;
  reflection?: string[];
  extensions?: string[];
}

export default function OnePager({
  title,
  tagline,
  epigraph,
  description,
  image,
  time,
  space,
  materials,
  setup,
  vocabulary,
  goals,
  delivery,
  reflection,
  extensions,
}: OnePagerProps): React.ReactElement {
  const materialsList = Array.isArray(materials) ? materials : materials ? [materials] : [];

  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.orgName}>Navigation Games Activity</div>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.tagline}>{tagline}</p>
          </div>
          {image && (
            <div className={styles.headerImage}>
              <img src={image} alt={title} />
            </div>
          )}
        </div>

        {epigraph && (
          <p className={styles.epigraph}>"{epigraph}"</p>
        )}

        {description && (
          <p className={styles.descriptionText}>{description}</p>
        )}

        <div className={styles.body}>
          <div className={styles.mainCol}>
            {goals && goals.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Goals</h3>
                <ul className={styles.list}>
                  {goals.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            )}

            {delivery && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Delivery</h3>
                <div className={styles.deliveryContent}>{delivery}</div>
              </div>
            )}
          </div>

          <div className={styles.sideCol}>
            {(time || space) && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Time and Space</h3>
                <p className={styles.sideText}>{[time, space].filter(Boolean).join('; ')}</p>
              </div>
            )}

            {materialsList.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Materials</h3>
                <ul className={styles.list}>
                  {materialsList.map((m, i) => <li key={i}>{m}</li>)}
                </ul>
              </div>
            )}

            {setup && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Set-up</h3>
                <p className={styles.sideText}>{setup}</p>
              </div>
            )}

            {vocabulary && vocabulary.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Vocabulary</h3>
                <ul className={styles.list}>
                  {vocabulary.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>

        {(reflection || extensions) && (
          <div className={styles.bottomRow}>
            {reflection && reflection.length > 0 && (
              <div className={styles.bottomSection}>
                <h3 className={styles.sectionTitle}>Reflection</h3>
                <ul className={styles.list}>
                  {reflection.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {extensions && extensions.length > 0 && (
              <div className={styles.bottomSection}>
                <h3 className={styles.sectionTitle}>Extensions</h3>
                <ul className={styles.list}>
                  {extensions.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
