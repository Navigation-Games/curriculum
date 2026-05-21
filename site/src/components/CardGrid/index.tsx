import React from 'react';
import styles from './styles.module.css';

interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export default function CardGrid({children, columns = 3}: CardGridProps): React.ReactElement {
  return (
    <div className={styles.grid} data-columns={columns}>
      {children}
    </div>
  );
}
