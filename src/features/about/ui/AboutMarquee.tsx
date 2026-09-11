'use client';

import { MARQUEE } from './data';
import styles from './About.module.scss';

export function AboutMarquee() {
  return (
    <div className={styles['ab-marquee']} aria-hidden="true">
      <div className={styles['ab-marquee-track']}>
        {[0, 1].map((rep) => (
          <div key={rep} className={styles['ab-marquee-group']}>
            {MARQUEE.map((token, i) => (
              <span key={i} className={styles['ab-marquee-item']}>
                {token}
                <span className={styles['ab-marquee-sep']}>·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}