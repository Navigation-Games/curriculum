import React from 'react';
import styles from './styles.module.css';

interface DescriptionProps {
  children: React.ReactNode;
}

export default function Description({children}: DescriptionProps): React.ReactElement {
  return (
    <div className={styles.description}>
      {children}
    </div>
  );
}
