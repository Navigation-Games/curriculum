import React from 'react';
import {useLocation} from '@docusaurus/router';
import styles from './styles.module.css';

export function useIsCompact(): boolean {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get('view') === 'compact';
}

export function ViewToggle(): React.ReactElement {
  const compact = useIsCompact();
  const location = useLocation();

  function getToggleUrl(): string {
    const params = new URLSearchParams(location.search);
    if (compact) {
      params.delete('view');
    } else {
      params.set('view', 'compact');
    }
    const search = params.toString();
    return location.pathname + (search ? `?${search}` : '');
  }

  return (
    <div className={styles.toggleBar}>
      <a href={getToggleUrl()} className={styles.toggleButton}>
        {compact ? 'Full view' : 'One-pager'}
      </a>
      <button onClick={() => window.print()} className={styles.printButton}>
        Print
      </button>
    </div>
  );
}

export function FullOnly({children}: {children: React.ReactNode}): React.ReactElement | null {
  const compact = useIsCompact();
  if (compact) return null;
  return <>{children}</>;
}

export function CompactOnly({children}: {children: React.ReactNode}): React.ReactElement | null {
  const compact = useIsCompact();
  if (!compact) return null;
  return <>{children}</>;
}
