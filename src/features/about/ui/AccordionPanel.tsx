'use client';

import Image from 'next/image';
import type { Highlight } from './data';
import styles from './About.module.scss';

export function AccordionPanel({ highlight, index }: { highlight: Highlight; index: number }) {
  const Icon = highlight.icon;

  return (
    <div className={styles['ab-panel']} tabIndex={0}>
      <Image
        src={highlight.image}
        alt={highlight.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
        quality={85}
        className={styles['ab-panel-img']}
      />
      <div className={styles['ab-panel-shade']} aria-hidden="true" />
      <div className={styles['ab-panel-label']} aria-hidden="true">
        <span className={styles['ab-panel-index']}>0{index + 1}</span>
        <span className={styles['ab-panel-label-text']}>{highlight.title}</span>
      </div>
      <div className={styles['ab-panel-content']}>
        <span className={styles['ab-panel-icon']}><Icon size={15} /></span>
        <h4 className={styles['ab-panel-title']}>{highlight.title}</h4>
        <p className={styles['ab-panel-desc']}>{highlight.desc}</p>
        {highlight.tags && (
          <div className={styles['ab-chips']}>
            {highlight.tags.map((t) => (
              <span key={t} className={styles['ab-chip']}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}