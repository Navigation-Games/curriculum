import React, {useState, useRef, useCallback} from 'react';
import activitySummaries from './activitySummaries';
import PopoverPortal from '@site/src/components/PopoverPortal';
import styles from './styles.module.css';

interface ActivityLinkProps {
  slug: string;
  /**
   * The link's own display name (e.g. "Basketball-O"). When it names a
   * companion documented on the target slug's page rather than the page
   * itself (e.g. Basketball-O lives on the Geometric-O page), the popover
   * shows that companion's own summary instead of the parent activity's,
   * so the popup content matches what was clicked.
   */
  name?: string;
  children?: React.ReactNode;
}

/**
 * Activity reference in a lesson's Delivery section. Clicking opens a popover
 * summary of the activity (tagline, description, time, space) so the teacher
 * can stay on the lesson page; the popover links on to the full activity page.
 */
export default function ActivityLink({slug, name, children}: ActivityLinkProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const info = activitySummaries[slug];
  const close = useCallback(() => setOpen(false), []);
  const href = `/curriculum/activities/core/${slug}/`;

  if (!info) {
    return <a href={href}>{children || slug}</a>;
  }

  const companion = name ? info.companions?.[name.toLowerCase()] : undefined;
  const title = companion?.title ?? info.title;
  const tagline = companion ? undefined : info.tagline;
  const description = companion?.description ?? info.description;
  const time = companion?.time ?? info.time;
  const space = companion ? undefined : info.space;

  return (
    <span ref={triggerRef}>
      <a
        className={styles.activityLink}
        href={href}
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
      >
        {children || title}
      </a>
      {open && (
        <PopoverPortal anchorRef={triggerRef} onClose={close}>
          <div className={styles.popoverTitle}>{title}</div>
          {tagline && <div className={styles.popoverTagline}>{tagline}</div>}
          {description && <div className={styles.popoverDesc}>{description}</div>}
          {time && (
            <div className={styles.popoverDetail}>
              <strong>Time:</strong> {time}
            </div>
          )}
          {space && (
            <div className={styles.popoverDetail}>
              <strong>Space:</strong> {space}
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
