import React, {useState, useMemo} from 'react';
import activities, {type ActivitySummary} from './activitiesData';
import styles from './styles.module.css';

type SortField = keyof ActivitySummary;
type SortDir = 'asc' | 'desc';

const columns: {field: SortField; label: string}[] = [
  {field: 'name', label: 'Name'},
  {field: 'icon', label: 'Icon'},
  {field: 'image', label: 'Image'},
  {field: 'tagline', label: 'Tagline'},
  {field: 'lessons', label: 'Lessons'},
  {field: 'status', label: 'Status'},
];

function compare(a: string, b: string): number {
  return a.localeCompare(b, undefined, {numeric: true, sensitivity: 'base'});
}

export default function ActivitiesTable(): React.ReactElement {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sorted = useMemo(() => {
    const copy = [...activities];
    copy.sort((a, b) => {
      const av = String(a[sortField] ?? '');
      const bv = String(b[sortField] ?? '');
      return sortDir === 'asc' ? compare(av, bv) : compare(bv, av);
    });
    return copy;
  }, [sortField, sortDir]);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function arrow(field: SortField): string {
    if (field !== sortField) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.field}
              className={styles.sortable}
              onClick={() => handleSort(col.field)}
            >
              {col.label}{arrow(col.field)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((act) => (
          <tr key={act.name}>
            <td>
              {act.link ? (
                <a href={act.link}>{act.name}</a>
              ) : (
                <span>{act.name}</span>
              )}
            </td>
            <td className={styles.imageCell}>
              {act.icon ? (
                <img src={act.icon} alt={`${act.name} icon`} className={styles.thumb} />
              ) : (
                <span className={styles.noImage}>--</span>
              )}
            </td>
            <td className={styles.imageCell}>
              {act.image ? (
                <img src={act.image} alt={act.name} className={styles.thumb} />
              ) : (
                <span className={styles.noImage}>--</span>
              )}
            </td>
            <td>{act.tagline}</td>
            <td>{act.lessons}</td>
            <td>
              {act.status === 'tbd' ? (
                <span className={styles.tbd}>TBD</span>
              ) : (
                <span className={styles.done}>Done</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
