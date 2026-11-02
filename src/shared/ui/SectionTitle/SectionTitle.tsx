'use client';

import styles from './SectionTitle.module.scss';

interface SectionTitleProps {
  title: string;
  accent?: string;
  description?: string;
  visible?: boolean;
}

export default function SectionTitle({ title, accent, description, visible }: SectionTitleProps) {
  return (
    <div className={`${styles.sectionTitleBlock} ${visible ? styles.isVisible : ''}`}>
      <h2 className={styles.sectionTitleHeading}>
        {title}
        {accent && <span className={styles.sectionTitleAccent}>{accent}</span>}
      </h2>
      {description && <p className={styles.sectionTitleDesc}>{description}</p>}
    </div>
  );
}
