import React, {useState, useRef, useEffect, useCallback} from 'react';
import {lookupMaterial} from './materialsData';
import styles from './styles.module.css';

interface MaterialLinkProps {
  name: string;
  children?: React.ReactNode;
}

export default function MaterialLink({name, children}: MaterialLinkProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(true);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const info = lookupMaterial(name);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setAbove(rect.top > 280);
    }
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  if (!info) {
    return <span>{children || name}</span>;
  }

  return (
    <span className={styles.materialLink} ref={wrapperRef}>
      <span onClick={() => setOpen(!open)}>{children || name}</span>
      {open && (
        <div
          className={styles.popover}
          style={above ? {} : {bottom: 'auto', top: 'calc(100% + 8px)'}}
        >
          <div className={styles.popoverTitle}>{info.name}</div>
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
        </div>
      )}
    </span>
  );
}
