import React, {useState, useRef, useCallback} from 'react';
import {lookupTerm} from './glossaryData';
import PopoverPortal from '@site/src/components/PopoverPortal';
import styles from './styles.module.css';

interface VocabLinkProps {
  term: string;
  children?: React.ReactNode;
}

// Must match Docusaurus's auto-generated heading id for each term in
// site/docs/reference/glossary.md (e.g. "Clue sheet" -> "clue-sheet"), so a
// printed/PDF page still has a working link even though the popover itself
// only exists in the browser.
function vocabAnchor(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
    <span ref={triggerRef}>
      <a
        className={styles.vocabLink}
        href={`/curriculum/reference/glossary#${vocabAnchor(entry.term)}`}
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
      >
        {children || term}
      </a>
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
