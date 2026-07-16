import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, query, where, onSnapshot, getDocs, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from '@/config/firebase';
import useReveal from '@/hooks/useReveal';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import TestimonialsColumn from '@/components/ui/TestimonialsColumn';
import { FiStar, FiSend, FiCheck, FiAlertCircle, FiLogIn, FiLogOut, FiX, FiMessageSquare } from 'react-icons/fi';
import './Reviews.scss';

export default function Reviews() {
  const [ref, visible] = useReveal();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ rating: 5, text: '', header: '', role: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), where('approved', '==', true));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() ?? null,
        };
      });
      items.sort((a, b) => {
        const ta = a.createdAt?.getTime?.() ?? 0;
        const tb = b.createdAt?.getTime?.() ?? 0;
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

  useEffect(() => {
    if (!user) { setHasReviewed(false); return; }
    async function checkReviewed() {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('email', '==', user.email),
          where('approved', '==', true)
        );
        const snap = await getDocs(q);
        setHasReviewed(!snap.empty);
      } catch {
        setHasReviewed(false);
      }
    }
    checkReviewed();
  }, [user]);

  async function handleSignIn() {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          setError(`Redirect failed: ${redirectErr.message}`);
          return;
        }
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in cancelled.');
      } else {
        setError(`Sign in failed: ${err.message}`);
      }
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
      const dupCheck = query(
        collection(db, 'reviews'),
        where('email', '==', user.email),
        where('approved', '==', true)
      );
      const dupSnap = await getDocs(dupCheck);

      if (!dupSnap.empty) {
        setError('You have already left a review.');
        setHasReviewed(true);
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'reviews'), {
        name: user.displayName || user.email,
        email: user.email,
        photoURL: user.photoURL,
        header: form.header.trim() || null,
        role: form.role.trim() || null,
        rating: form.rating,
        text: form.text.trim(),
        approved: false,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setHasReviewed(true);
      setForm({ rating: 5, text: '', header: '', role: '' });
      setTimeout(() => { setModalOpen(false); setSubmitted(false); }, 2000);
    } catch (err) {
      setError(`Failed to submit: ${err.message}`);
      console.error('Error adding review:', err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleRatingClick(rating) {
    setForm(prev => ({ ...prev, rating }));
  }

  const columns = useMemo(() => {
    if (reviews.length === 0) return [[], [], []];
    const col1 = reviews.filter((_, i) => i % 3 === 0);
    const col2 = reviews.filter((_, i) => i % 3 === 1);
    const col3 = reviews.filter((_, i) => i % 3 === 2);
    return [col1, col2, col3];
  }, [reviews]);

  function openModal() {
    if (!user) {
      handleSignIn();
      return;
    }
    if (hasReviewed) {
      setError('You have already left a review.');
    }
    setModalOpen(true);
    setError(null);
    setSubmitted(false);
  }

  return (
    <section id="reviews" ref={ref} className={`section section--reviews reveal${visible ? ' is-visible' : ''}`}>
      <SectionHeader title="reviews" number="06" visible={visible} />

      <div className="reviews-inner">
        <div className="reviews-header-row">
          <p className="reviews-subtitle">What people think about working with me</p>
          <button className="reviews-cta" onClick={openModal}>
            <FiMessageSquare size={14} />
            <span>Leave a review</span>
          </button>
        </div>

        <div className="reviews-columns-wrapper">
          {loading ? (
            <div className="reviews-loading">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="reviews-empty">No reviews yet. Be the first!</div>
          ) : (
            <>
              <TestimonialsColumn testimonials={columns[0]} duration={15} />
              <TestimonialsColumn testimonials={columns[1]} duration={19} className="reviews-col--desktop" />
              <TestimonialsColumn testimonials={columns[2]} duration={17} className="reviews-col--wide" />
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="review-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-bar">
              <span className="review-modal-title">// leave a review</span>
              <button className="review-modal-close" onClick={() => setModalOpen(false)}>
                <FiX size={14} />
              </button>
            </div>

            <div className="review-modal-body">
              {!user ? (
                <div className="auth-prompt">
                  <p>Sign in with Google to leave a review</p>
                  <button onClick={handleSignIn} className="signin-btn">
                    <FiLogIn size={14} />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              ) : hasReviewed && !submitted ? (
                <div className="form-success">
                  <FiCheck size={24} />
                  <p>You have already left a review.</p>
                  <button onClick={handleSignOut} className="signout-link">
                    <FiLogOut size={12} />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : submitted ? (
                <div className="form-success">
                  <FiCheck size={24} />
                  <p>Thank you! Your review will appear after moderation.</p>
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
                      <label htmlFor="review-header">Header</label>
                      <input
                        id="review-header"
                        type="text"
                        value={form.header}
                        onChange={e => setForm(prev => ({ ...prev, header: e.target.value }))}
                        placeholder="Short headline..."
                        maxLength={80}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="review-role">Role</label>
                      <input
                        id="review-role"
                        type="text"
                        value={form.role}
                        onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                        placeholder="Your role / title..."
                        maxLength={60}
                      />
                    </div>

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
                        rows={3}
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
          </div>
        </div>
      )}
    </section>
  );
}
