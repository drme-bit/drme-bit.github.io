import type { FC } from 'react'
import { PiPencilSimple } from 'react-icons/pi'
import styles from './Reviews.module.scss'

interface Props {
  isRevealed: boolean
  onOpenModal: () => void
}

const ReviewsHero: FC<Props> = ({ isRevealed, onOpenModal }) => (
  <div
    className={`${styles['reviews-hero']}${
      isRevealed ? ` ${styles['is-revealed']}` : ''
    }`}
  >
    <h2 className={styles['reviews-hero-title']}>
      Players'<br />
      <span className={styles['reviews-hero-accent']}>Reviews</span>
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

export default ReviewsHero
