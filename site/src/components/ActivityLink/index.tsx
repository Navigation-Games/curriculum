import React, {useState, useRef, useCallback} from 'react';
import activitySummaries from './activitySummaries';
import PopoverPortal from '@site/src/components/PopoverPortal';
import styles from './styles.module.css';

interface ActivityLinkProps {
  slug: string;
  children?: React.ReactNode;
}

/**
 * Activity reference in a lesson's Delivery section. Clicking opens a popover
 * summary of the activity (tagline, description, time, space) so the teacher
 * can stay on the lesson page; the popover links on to the full activity page.
 */
export default function ActivityLink({slug, children}: ActivityLinkProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const info = activitySummaries[slug];
  const close = useCallback(() => setOpen(false), []);
  const href = `/curriculum/activities/core/${slug}/`;

  if (!info) {
    return <a href={href}>{children || slug}</a>;
  }

  return (
    <span className={styles.activityLink} ref={triggerRef}>
      <span onClick={() => setOpen(!open)}>{children || info.title}</span>
      {open && (
        <PopoverPortal anchorRef={triggerRef} onClose={close}>
          <div className={styles.popoverTitle}>{info.title}</div>
          {info.tagline && <div className={styles.popoverTagline}>{info.tagline}</div>}
          {info.description && <div className={styles.popoverDesc}>{info.description}</div>}
          {info.time && (
            <div className={styles.popoverDetail}>
              <strong>Time:</strong> {info.time}
            </div>
          )}
          {info.space && (
            <div className={styles.popoverDetail}>
              <strong>Space:</strong> {info.space}
            </div>
          )}
          <a className={styles.popoverLink} href={href}>
            View full activity page
          </a>
        </PopoverPortal>
      )}
    </span>
  );
}
