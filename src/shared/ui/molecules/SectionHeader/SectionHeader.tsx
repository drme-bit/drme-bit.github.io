'use client';

import styles from './SectionHeader.module.scss';

interface SectionHeaderProps {
  title: string;
  number?: string;
  visible?: boolean;
}

export default function SectionHeader({ title, number, visible }: SectionHeaderProps) {
  return (
    <div className={`${styles.sectionHeader} ${visible ? styles.isVisible : ''}`}>
      <span className={styles.sectionHeaderLine} />
      {number && <span className={styles.sectionHeaderNumber}>{number}</span>}
      <span className={styles.sectionHeaderText}>// {title}</span>
      <span className={styles.sectionHeaderLine} />
    </div>
  );
}
