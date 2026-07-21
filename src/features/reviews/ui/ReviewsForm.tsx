import { type FC, useState } from 'react'
import {
  PiStarFill,
  PiStar,
  PiCheckCircle,
  PiWarningCircle,
  PiSignOut,
} from 'react-icons/pi'
import type { User } from 'firebase/auth'
import styles from './Reviews.module.scss'

interface Props {
  user: User
  onSignOut: () => void
}

const ReviewsForm: FC<Props> = ({ user, onSignOut }) => {
  const [name, setName] = useState(user.displayName ?? '')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !title.trim() || !text.trim()) {
      setError('All fields are required.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { db } = await import('@/shared/config/firebase')
      const { collection, addDoc, serverTimestamp } = await import(
        'firebase/firestore'
      )
      await addDoc(collection(db, 'reviews'), {
        name: name.trim(),
        header: title.trim(),
        text: text.trim(),
        rating,
        uid: user.uid,
        createdAt: serverTimestamp(),
      })
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError('Failed to submit review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles['form-success']}>
        <PiCheckCircle size={40} />
        <p>Thanks! Your review has been submitted for approval.</p>
      </div>
    )
  }

  return (
    <form className={styles['review-form']} onSubmit={handleSubmit}>
      <div className={styles['user-badge']}>
        <img
          src={user.photoURL ?? ''}
          alt=""
          className={styles['user-avatar']}
        />
        <span className={styles['user-name']}>{user.displayName}</span>
        <button
          type="button"
          className={styles['signout-icon']}
          onClick={onSignOut}
          title="Sign out"
        >
          <PiSignOut size={14} />
        </button>
      </div>

      {error && (
        <div className={styles['form-error']}>
          <PiWarningCircle size={14} />
          {error}
        </div>
      )}

      <div className={styles['form-group']}>
        <label>Your Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dyrachyo"
        />
      </div>

      <div className={styles['form-group']}>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short headline"
        />
      </div>

      <div className={styles['form-group']}>
        <label>Review</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What was your experience like?"
          rows={4}
        />
      </div>

      <div className={styles['form-group']}>
        <label>Rating</label>
        <div className={styles['rating-input']}>
          {Array.from({ length: 5 }, (_, i) => {
            const filled = i < (hovered || rating)
            return (
              <button
                key={i}
                type="button"
                className={`${styles['rating-star']}${
                  filled ? ` ${styles['active']}` : ''
                }`}
                onMouseEnter={() => setHovered(i + 1)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(i + 1)}
              >
                {filled ? <PiStarFill /> : <PiStar />}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="submit"
        className={styles['submit-btn']}
        disabled={loading}
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}

export default ReviewsForm
