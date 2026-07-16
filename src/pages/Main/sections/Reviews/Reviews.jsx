import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from '@/config/firebase';
import useReveal from '@/hooks/useReveal';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import { FiStar, FiSend, FiCheck, FiAlertCircle, FiLogIn, FiLogOut } from 'react-icons/fi';
import './Reviews.scss';

export default function Reviews() {
  const [ref, visible] = useReveal();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ rating: 5, text: '' });
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setSigningIn(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), where('approved', '==', true));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      setReviews(items);
      setLoading(false);
    }, (err) => {
      console.error('Reviews listener error:', err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleSignIn() {
    try {
      setError(null);
      setSigningIn(true);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      console.log('Signing in, isMobile:', isMobile);
      if (isMobile) {
        console.log('Using signInWithRedirect');
        await signInWithRedirect(auth, googleProvider);
      } else {
        console.log('Using signInWithPopup');
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError(`Sign in failed: ${err.message}`);
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      setSubmitted(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !form.text.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'reviews'), {
        name: user.displayName || user.email,
        email: user.email,
        photoURL: user.photoURL,
        rating: form.rating,
        text: form.text.trim(),
        approved: false,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setForm({ rating: 5, text: '' });
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Error adding review:', err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleRatingClick(rating) {
    setForm(prev => ({ ...prev, rating }));
  }

  return (
    <section id="reviews" ref={ref} className={`section section--reviews reveal${visible ? ' is-visible' : ''}`}>
      <SectionHeader title="reviews" number="06" visible={visible} />

      <div className="reviews-inner">
        <div className="reviews-content">
          {/* Submit Form */}
          <div className="reviews-form-card">
            <h3 className="form-title">Leave a Review</h3>

            {!user ? (
              <div className="auth-prompt">
                <p>Sign in with Google to leave a review</p>
                <button onClick={handleSignIn} className="signin-btn" disabled={signingIn}>
                  <FiLogIn size={14} />
                  <span>{signingIn ? 'Redirecting...' : 'Sign in with Google'}</span>
                </button>
                {error && (
                  <div className="form-error" style={{ marginTop: '0.5rem' }}>
                    <FiAlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            ) : submitted ? (
              <div className="form-success">
                <FiCheck size={24} />
                <p>Thank you! Your review will appear after moderation.</p>
                <button onClick={handleSignOut} className="signout-link">
                  <FiLogOut size={12} />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <>
                <div className="user-badge">
                  <img src={user.photoURL} alt="" className="user-avatar" />
                  <span className="user-name">{user.displayName}</span>
                  <button onClick={handleSignOut} className="signout-icon" title="Sign out">
                    <FiLogOut size={14} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="review-form">
                  <div className="form-group">
                    <label>Rating</label>
                    <div className="rating-input">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`rating-star ${form.rating >= star ? 'active' : ''}`}
                          onClick={() => handleRatingClick(star)}
                          aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        >
                          <FiStar />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-text">Review</label>
                    <textarea
                      id="review-text"
                      value={form.text}
                      onChange={e => setForm(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Your review..."
                      required
                      rows={4}
                      maxLength={500}
                    />
                  </div>

                  {error && (
                    <div className="form-error">
                      <FiAlertCircle size={14} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting || !form.text.trim()}
                  >
                    <FiSend size={14} />
                    <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Reviews List */}
          <div className="reviews-list">
            {loading ? (
              <div className="reviews-loading">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="reviews-empty">No reviews yet. Be the first!</div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">
                      {review.photoURL ? (
                        <img src={review.photoURL} alt="" className="review-avatar" />
                      ) : (
                        <div className="review-avatar review-avatar--fallback">
                          {(review.name || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <span className="review-name">{review.name}</span>
                    </div>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={i < review.rating ? 'filled' : ''}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-text">{review.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
