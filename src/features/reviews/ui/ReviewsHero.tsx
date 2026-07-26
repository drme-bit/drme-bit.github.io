import type { FC } from 'react'
import { PiPencilSimple } from '@/shared/ui/atoms/Icon'
import styles from './Reviews.module.scss'

interface Props {
  onOpenModal: () => void
}

const ReviewsHero: FC<Props> = ({ onOpenModal }) => {
  return (
    <div className={styles['reviews-hero']}>
      <h2 className={styles['reviews-hero-title']}>
        Wall of'<br />
        <span className={styles['reviews-hero-accent']}>Truth</span>
      </h2>
      <p className={styles['reviews-hero-desc']}>
        Real feedback from real players —<br />
        unfiltered, unedited, unapologetic.
      </p>
      <button
        type="button"
        className={styles['reviews-cta']}
        onClick={onOpenModal}
      >
        <PiPencilSimple size={13} />
        Leave a Review
      </button>
    </div>
  )
}

export default ReviewsHero