import React, {useRef, useEffect, useState, useCallback} from 'react';
import {createPortal} from 'react-dom';
import styles from './styles.module.css';

interface Position {
  top: number;
  left: number;
  arrowLeft: number;
  showAbove: boolean;
}

interface PopoverPortalProps {
  anchorRef: React.RefObject<HTMLSpanElement | null>;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export default function PopoverPortal({
  anchorRef,
  onClose,
  children,
  width = 320,
}: PopoverPortalProps): React.ReactElement | null {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    if (!anchorRef.current || !popoverRef.current) return;
    const triggerRect = anchorRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const gap = 8;

    const showAbove = triggerRect.top > popoverRect.height + gap;
    const top = showAbove
      ? triggerRect.top + window.scrollY - popoverRect.height - gap
      : triggerRect.bottom + window.scrollY + gap;

    let left = triggerRect.left + triggerRect.width / 2 - width / 2;
    const margin = 8;
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

    const arrowLeft = triggerRect.left + triggerRect.width / 2 - left;

    setPosition({top, left, arrowLeft, showAbove});
  }, [anchorRef, width]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onCloseRef.current();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [anchorRef]);

  if (typeof document === 'undefined') return null;

  const style: React.CSSProperties = position
    ? {top: position.top, left: position.left, width}
    : {visibility: 'hidden' as const, width};

  return createPortal(
    <div
      ref={popoverRef}
      className={`${styles.popover} ${position?.showAbove ? styles.popoverAbove : styles.popoverBelow}`}
      style={style}
    >
      {position && (
        <div className={styles.popoverArrow} style={{left: position.arrowLeft}} />
      )}
      {children}
    </div>,
    document.body,
  );
}
