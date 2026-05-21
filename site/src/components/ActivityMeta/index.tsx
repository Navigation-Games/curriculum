import React from 'react';
import styles from './styles.module.css';

interface VocabTerm {
  term: string;
  definition?: string;
}

interface ActivityMetaProps {
  time?: string;
  space?: string;
  materials?: string;
  vocabulary?: (string | VocabTerm)[];
  groupSize?: string;
  show?: string[];
}

const defaultFields = ['time', 'space', 'materials', 'vocabulary'];

const labels: Record<string, string> = {
  time: 'Time',
  space: 'Space',
  materials: 'Materials',
  vocabulary: 'Vocabulary',
  groupSize: 'Group Size',
};

export default function ActivityMeta(props: ActivityMetaProps): React.ReactElement | null {
  const {show, ...fields} = props;
  const visibleFields = show || defaultFields;

  const rows = visibleFields
    .filter((field) => fields[field] != null)
    .map((field) => {
      const value = fields[field];
      let display: string;
      if (Array.isArray(value)) {
        display = value.map((v) =>
          typeof v === 'object' && v !== null ? v.term : v
        ).join(', ');
      } else {
        display = value as string;
      }
      return {label: labels[field] || field, value: display};
    });

  if (rows.length === 0) return null;

  return (
    <table className={styles.metaTable}>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th>{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
