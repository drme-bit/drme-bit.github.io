'use client';

import type { FC } from 'react';
import { PiPencilSimple, PiStarFill } from '@/shared/ui/atoms/Icon';
import styles from './Reviews.module.scss';

interface Props {
  onOpenModal: () => void;
  average: number;
  count: number;
}

const ReviewsHero: FC<Props> = ({ onOpenModal, average, count }) => {
  const rounded = Math.round(average);

  return (
    <div className={styles['reviews-hero']}>
      <p className={styles['reviews-hero-cmd']}>
        <span className={styles['reviews-hero-cmd-prompt']}>➜</span> comments --wall --live
      </p>
      <h2 className={styles['reviews-hero-title']}>
        Wall of
        <br />
        <span className={styles['reviews-hero-accent']}>Truth</span>
      </h2>
      <p className={styles['reviews-hero-desc']}>
        Real feedback from real people — unfiltered, unedited, unapologetic.
      </p>

      <div className={styles['reviews-hero-meta']}>
        {count > 0 && (
          <div className={styles['reviews-rating-chip']} aria-label={`${average.toFixed(1)} out of 5, ${count} reviews`}>
            <span className={styles['reviews-rating-num']}>{average.toFixed(1)}</span>
            <span className={styles['reviews-rating-stars']} aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <PiStarFill
                  key={i}
                  size={11}
                  className={i < rounded ? styles['star-filled'] : styles['star-empty']}
                />
              ))}
            </span>
            <span className={styles['reviews-rating-label']}>
              {count} review{count === 1 ? '' : 's'}
            </span>
          </div>
        )}
        <button type="button" className={styles['reviews-cta']} onClick={onOpenModal}>
          <PiPencilSimple size={13} />
          leave a review
        </button>
      </div>
    </div>
  );
};

export default ReviewsHero;
