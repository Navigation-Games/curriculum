import React, {useState, useRef, useCallback} from 'react';
import {lookupMaterial} from './materialsData';
import PopoverPortal from '@site/src/components/PopoverPortal';
import styles from './styles.module.css';

interface MaterialLinkProps {
  name: string;
  children?: React.ReactNode;
}

export default function MaterialLink({name, children}: MaterialLinkProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const info = lookupMaterial(name);

  const close = useCallback(() => setOpen(false), []);

  if (!info) {
    return <span>{children || name}</span>;
  }

  return (
    <span className={styles.materialLink} ref={triggerRef}>
      <span onClick={() => setOpen(!open)}>{children || name}</span>
      {open && (
        <PopoverPortal anchorRef={triggerRef} onClose={close}>
          <div className={styles.popoverTitle}>
            {info.name}
            {info.kit && <span className={styles.kitBadge}>In NG Kit</span>}
          </div>
          <div className={styles.popoverDesc}>{info.description}</div>
          <div className={styles.popoverDetail}>
            <strong>Where to get:</strong> {info.whereToGet}
          </div>
          <div className={styles.popoverDetail}>
            <strong>Alternatives:</strong> {info.alternatives}
          </div>
          <div className={styles.popoverDetail}>
            <strong>Used in:</strong> {info.usedIn}
          </div>
          <div className={styles.popoverDetail}>
            <strong>Learning connection:</strong> {info.learningConnection}
          </div>
          <a className={styles.popoverLink} href="/curriculum/reference/materials">
            View full materials index
          </a>
        </PopoverPortal>
      )}
    </span>
  );
}
