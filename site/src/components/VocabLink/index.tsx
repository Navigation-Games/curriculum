import React, {useState, useRef, useCallback} from 'react';
import {lookupTerm} from './glossaryData';
import PopoverPortal from '@site/src/components/PopoverPortal';
import styles from './styles.module.css';

interface VocabLinkProps {
  term: string;
  children?: React.ReactNode;
}

export default function VocabLink({term, children}: VocabLinkProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const entry = lookupTerm(term);

  const close = useCallback(() => setOpen(false), []);

  if (!entry) {
    return <span>{children || term}</span>;
  }

  return (
    <span className={styles.vocabLink} ref={triggerRef}>
      <span onClick={() => setOpen(!open)}>{children || term}</span>
      {open && (
        <PopoverPortal anchorRef={triggerRef} onClose={close} width={280}>
          <div className={styles.popoverTerm}>{entry.term}</div>
          <div className={styles.popoverDef}>{entry.definition}</div>
          <a className={styles.popoverLink} href="/curriculum/reference/glossary">
            View full glossary
          </a>
        </PopoverPortal>
      )}
    </span>
  );
}
