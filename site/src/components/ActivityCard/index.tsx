import React, {useRef, useState, useCallback} from 'react';
import Link from '@docusaurus/Link';
import PopoverPortal from '@site/src/components/PopoverPortal';
import activities from '@site/src/components/ActivitiesTable/activitiesData';
import styles from './styles.module.css';

interface ActivityCardProps {
  title: string;
  description: string;
  link?: string;
  image?: string;
  tag?: 'core' | 'readiness' | 'variation' | 'extension';
}

function ActivityPopover({
  title,
  link,
  onClose,
  anchorRef,
}: {
  title: string;
  link?: string;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const data = activities.find(
    (a) => a.name.toLowerCase() === title.toLowerCase(),
  );

  if (!data) return null;

  return (
    <PopoverPortal anchorRef={anchorRef as React.RefObject<HTMLSpanElement | null>} onClose={onClose} width={360}>
      <div className={styles.popoverContent}>
        {data.image && (
          <img src={data.image} alt={data.name} className={styles.popoverImage} />
        )}
        <p className={styles.popoverDesc}>{data.description}</p>
        {data.steps.length > 0 && (
          <ol className={styles.popoverSteps}>
            {data.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        {link && (
          <Link to={link} className={styles.popoverLink} onClick={onClose}>
            View full activity &rarr;
          </Link>
        )}
      </div>
    </PopoverPortal>
  );
}

export default function ActivityCard({
  title,
  description,
  link,
  image,
  tag,
}: ActivityCardProps): React.ReactElement {
  const [showPopover, setShowPopover] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const hasPopoverData = activities.some(
    (a) => a.name.toLowerCase() === title.toLowerCase(),
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPopover((v) => !v);
    },
    [],
  );

  const card = (
    <div className={`${styles.card} ${image ? styles.cardWithImage : ''}`}>
      <div className={styles.body}>
        {tag && <span className={`${styles.tag} ${styles[`tag-${tag}`]}`}>{tag}</span>}
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      {image && (
        <div className={styles.imageWrapper}>
          <img src={image} alt={title} className={styles.image} />
        </div>
      )}
    </div>
  );

  const cardElement = hasPopoverData ? (
    <div className={styles.link} onClick={handleClick} role="button" tabIndex={0}>
      {card}
    </div>
  ) : link ? (
    <Link to={link} className={styles.link}>{card}</Link>
  ) : (
    card
  );

  return (
    <div ref={cardRef} className={styles.cardWrapper}>
      {cardElement}
      {showPopover && hasPopoverData && (
        <ActivityPopover
          title={title}
          link={link}
          onClose={() => setShowPopover(false)}
          anchorRef={cardRef}
        />
      )}
    </div>
  );
}
