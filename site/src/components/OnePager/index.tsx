import React from 'react';
import styles from './styles.module.css';

interface OnePagerProps {
  title: string;
  tagline: string;
  variant?: 'activity' | 'lesson';
  epigraph?: string;
  description?: string;
  image?: string;
  time?: string;
  space?: string;
  materials?: string | string[];
  setup?: string;
  vocabulary?: string[];
  goals?: string[];
  steps?: string[];
  delivery?: React.ReactNode;
  reflection?: string[];
  extensions?: string[];
  adaptations?: string[];
}

export default function OnePager({
  title,
  tagline,
  variant = 'activity',
  epigraph,
  description,
  image,
  time,
  space,
  materials,
  setup,
  vocabulary,
  goals,
  steps,
  delivery,
  reflection,
  extensions,
  adaptations,
}: OnePagerProps): React.ReactElement {
  const materialsList = Array.isArray(materials) ? materials : materials ? [materials] : [];
  const variantClass = variant === 'lesson' ? styles.lesson : '';
  const orgLabel = variant === 'lesson' ? 'Navigation Games Lesson Plan' : 'Navigation Games Activity';

  return (
    <div className={styles.page}>
      <div className={`${styles.frame} ${variantClass}`}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <div className={styles.orgName}>{orgLabel}</div>
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

            {setup && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Set-up</h3>
                <p className={styles.sideText}>{setup}</p>
              </div>
            )}

            {steps && steps.length > 0 && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Steps</h3>
                <ol className={styles.list}>
                  {steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
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

        {(reflection || extensions || adaptations) && (
          <div className={styles.bottomRow}>
            {reflection && reflection.length > 0 && (
              <div className={styles.bottomSection}>
                <h3 className={styles.sectionTitle}>Reflection</h3>
                <ul className={styles.list}>
                  {reflection.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {adaptations && adaptations.length > 0 && (
              <div className={styles.bottomSection}>
                <h3 className={styles.sectionTitle}>Adaptations</h3>
                <ul className={styles.list}>
                  {adaptations.map((a, i) => <li key={i}>{a}</li>)}
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
