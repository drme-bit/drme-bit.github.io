import type { FC } from 'react'
import { PiPencilSimple } from 'react-icons/pi'
import styles from './Reviews.module.scss'

interface Props {
  isRevealed: boolean
  progress: number
  onOpenModal: () => void
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = clamp01((value - inMin) / (inMax - inMin))
  return outMin + t * (outMax - outMin)
}

const ReviewsHero: FC<Props> = ({ isRevealed, progress, onOpenModal }) => {
  const titleOpacity = mapRange(progress, 0.05, 0.25, 0, 1)
  const titleY = mapRange(progress, 0.05, 0.25, 24, 0)
  const descOpacity = mapRange(progress, 0.12, 0.32, 0, 1)
  const descY = mapRange(progress, 0.12, 0.32, 20, 0)
  const ctaOpacity = mapRange(progress, 0.2, 0.4, 0, 1)
  const ctaY = mapRange(progress, 0.2, 0.4, 16, 0)

  return (
    <div
      className={`${styles['reviews-hero']}${
        isRevealed ? ` ${styles['is-revealed']}` : ''
      }`}
    >
      <h2
        className={styles['reviews-hero-title']}
        style={{ opacity: titleOpacity, transform: `translateY(${titleY}px) scale(${mapRange(progress, 0.05, 0.25, 0.95, 1)})` }}
      >
        Wall of'<br />
        <span className={styles['reviews-hero-accent']}>Truth</span>
      </h2>
      <p
        className={styles['reviews-hero-desc']}
        style={{ opacity: descOpacity, transform: `translateY(${descY}px)` }}
      >
        Real feedback from real players —<br />
        unfiltered, unedited, unapologetic.
      </p>
      <button
        type="button"
        className={styles['reviews-cta']}
        style={{ opacity: ctaOpacity, transform: `translateY(${ctaY}px)` }}
        onClick={onOpenModal}
      >
        <PiPencilSimple size={13} />
        Leave a Review
      </button>
    </div>
  )
}

export default ReviewsHero
