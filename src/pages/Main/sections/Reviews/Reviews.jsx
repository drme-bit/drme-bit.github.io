import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collection, addDoc, query, where, onSnapshot, getDocs, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from 'firebase/auth';
import { motion } from 'motion/react';
import { db, auth, googleProvider } from '@/config/firebase';
import useReveal from '@/hooks/useReveal';
import { useModal } from '@/contexts/ModalContext';
import { FiStar, FiSend, FiCheck, FiAlertCircle, FiLogIn, FiLogOut, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import './Reviews.scss';

const WORLD_W = 4000;
const WORLD_H = 2500;
const FOCUS_INTERVAL = 16000;

export default function Reviews() {
  const [ref, visible] = useReveal();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ rating: 5, text: '', header: '', role: '' });
  const [hasReviewed, setHasReviewed] = useState(false);
  const { openModal } = useModal();

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
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Sign-in error:', e);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      setHasReviewed(false);
    } catch (e) {
      console.error('Sign-out error:', e);
    }
  }

  const [draggedId, setDraggedId] = useState(null);
  const [canvasDragging, setCanvasDragging] = useState(false);
  const topZ = useRef(1);
  const worldRef = useRef(null);
  const focusIdx = useRef(0);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const [isBlurred, setIsBlurred] = useState(false);
  const userInteractedAt = useRef(0);
  const focusedId = useRef(null);
  const RESUME_DELAY = 5000;
  const [hintHidden, setHintHidden] = useState(false);

  // Auto-hide drag hint after 6s
  useEffect(() => {
    const t = setTimeout(() => setHintHidden(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // Skeleton positions (same scatter logic, 6 placeholders)
  const skeletonPositions = useMemo(() => {
    const seededRandom = (seed) => {
      const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2 * 1.618;
      const radius = 200 + seededRandom(i + 500) * 800;
      const x = WORLD_W / 2 + Math.cos(angle) * radius - 140;
      const y = WORLD_H / 2 + Math.sin(angle) * radius - 80;
      const rotation = (seededRandom(i + 700) - 0.5) * 12;
      return {
        x: Math.max(60, Math.min(WORLD_W - 340, x)),
        y: Math.max(60, Math.min(WORLD_H - 200, y)),
        rotation,
      };
    });
  }, []);

  // Scatter cards across the infinite world
  const cardPositions = useMemo(() => {
    if (reviews.length === 0) return [];
    const count = reviews.length;
    const seededRandom = (seed) => {
      const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return x - Math.floor(x);
    };
    // Spiral-ish scatter across the world
    return reviews.map((_, i) => {
      const angle = (i / count) * Math.PI * 2 * 1.618; // golden angle
      const radius = 200 + seededRandom(i) * 800;
      const x = WORLD_W / 2 + Math.cos(angle) * radius - 140;
      const y = WORLD_H / 2 + Math.sin(angle) * radius - 80;
      const rotation = (seededRandom(i + 200) - 0.5) * 12;
      return {
        x: Math.max(60, Math.min(WORLD_W - 340, x)),
        y: Math.max(60, Math.min(WORLD_H - 200, y)),
        rotation,
      };
    });
  }, [reviews]);

  // Smooth pan to target
  const animateToTarget = useCallback(() => {
    const el = worldRef.current;
    if (!el) return;

    const lerp = 0.04;
    posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp;
    posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp;

    el.style.transform = `translate(${-posRef.current.x}px, ${-posRef.current.y}px)`;

    const dx = Math.abs(targetRef.current.x - posRef.current.x);
    const dy = Math.abs(targetRef.current.y - posRef.current.y);
    if (dx > 0.5 || dy > 0.5) {
      rafRef.current = requestAnimationFrame(animateToTarget);
    }
  }, []);

  const panTo = useCallback((x, y) => {
    targetRef.current = { x, y };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animateToTarget);
  }, [animateToTarget]);

  // Auto-focus: cycle through cards
  useEffect(() => {
    if (reviews.length === 0) return;

    // Start centered on world
    const startX = WORLD_W / 2 - window.innerWidth / 2;
    const startY = WORLD_H / 2 - window.innerHeight / 2;
    posRef.current = { x: startX, y: startY };
    targetRef.current = { x: startX, y: startY };

    const interval = setInterval(() => {
      // Skip if user recently interacted
      if (Date.now() - userInteractedAt.current < RESUME_DELAY) return;

      focusIdx.current = (focusIdx.current + 1) % reviews.length;
      const pos = cardPositions[focusIdx.current];
      if (pos) {
        focusedId.current = reviews[focusIdx.current].id;
        setIsBlurred(true);
        panTo(pos.x - window.innerWidth / 2 + 140, pos.y - window.innerHeight * 0.10);
        // Unblur after pan settles
        setTimeout(() => setIsBlurred(false), 1200);
      }
    }, FOCUS_INTERVAL);

    return () => clearInterval(interval);
  }, [reviews.length, cardPositions, panTo]);

  // Manual drag to reposition viewport
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleWorldMouseDown = useCallback((e) => {
    if (e.target.closest('.reviews-drag-card') || e.target.closest('.reviews-hero')) return;
    isDragging.current = true;
    setCanvasDragging(true);
    userInteractedAt.current = Date.now();
    focusedId.current = null;
    setIsBlurred(false);
    setHintHidden(true);
    dragStart.current = { x: e.clientX + posRef.current.x, y: e.clientY + posRef.current.y };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const handleWorldMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const x = dragStart.current.x - e.clientX;
    const y = dragStart.current.y - e.clientY;
    posRef.current = { x, y };
    targetRef.current = { x, y };
    worldRef.current.style.transform = `translate(${-x}px, ${-y}px)`;
  }, []);

  const handleWorldMouseUp = useCallback(() => {
    isDragging.current = false;
    setCanvasDragging(false);
    setDraggedId(null);
  }, []);

  const handleDragStart = useCallback((id) => {
    setDraggedId(id);
    setCanvasDragging(true);
    userInteractedAt.current = Date.now();
    focusedId.current = null;
    setIsBlurred(false);
    topZ.current += 1;
  }, []);

  function openReviewModal() {
    if (!user) {
      handleSignIn();
      return;
    }
    if (hasReviewed) {
      setError('You have already left a review.');
    }
    setSubmitted(false);
    setError(null);

    openModal({
      className: 'modal-panel--reviews',
      content: (
        <div className="review-modal-body">
          <div className="review-modal-bar">
            <span className="review-modal-title">// leave a review</span>
          </div>

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
                <img src={user.photoURL} alt="" className="user-avatar" loading="lazy" />
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
                        onClick={() => setForm(prev => ({ ...prev, rating: star }))}
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
      ),
    });
  }

  return (
    <section id="reviews" ref={ref} className={`section section--reviews reveal${visible ? ' is-visible' : ''}`}>
      <div
        className={`reviews-canvas${isBlurred ? ' reviews-canvas--blurred' : ''}${canvasDragging ? ' reviews-canvas--dragging' : ''} ${visible ? 'is-revealed' : ''}`}
        onMouseDown={handleWorldMouseDown}
        onMouseMove={handleWorldMouseMove}
        onMouseUp={handleWorldMouseUp}
        onMouseLeave={handleWorldMouseUp}
      >
        {/* ── Hero overlay (fixed center of viewport) ── */}
        <div className="reviews-hero">
          <h3 className="reviews-hero-title">
            What people say<span className="reviews-hero-accent">_</span>
          </h3>
          <p className="reviews-hero-desc">
            Real feedback from colleagues and collaborators
          </p>
          <button className="reviews-cta" onClick={openReviewModal}>
            <FiMessageSquare size={14} />
            <span>Leave a review</span>
          </button>
        </div>

        {/* ── Drag hint ── */}
        <div className={`reviews-drag-hint${hintHidden ? ' is-hidden' : ''}`}>
          <span>drag to explore</span>
          <FiArrowRight size={10} />
        </div>

        <div
          ref={worldRef}
          className="reviews-world"
          style={{ width: WORLD_W, height: WORLD_H }}
        >
          {/* ── Skeleton cards while loading ── */}
          {loading && skeletonPositions.map((pos, i) => (
            <div
              key={`skeleton-${i}`}
              className="reviews-skeleton"
              style={{
                left: pos.x,
                top: pos.y,
                transform: `rotate(${pos.rotation}deg)`,
              }}
            >
              <div className="reviews-skeleton-footer" />
            </div>
          ))}

          {/* ── Review Cards scattered across world ── */}
          {!loading && reviews.length === 0 && (
            <div className="reviews-empty" style={{ left: WORLD_W / 2, top: WORLD_H / 2 }}>
              No reviews yet. Be the first!
            </div>
          )}
          {!loading && reviews.map((review, i) => {
            const pos = cardPositions[i];
            if (!pos) return null;
            return (
              <motion.div
                key={review.id}
                className={`reviews-drag-card${focusedId.current === review.id ? ' is-focused' : ''}${draggedId === review.id ? ' is-dragged' : ''}`}
                drag
                dragMomentum={false}
                dragElastic={0.1}
                onDragStart={() => handleDragStart(review.id)}
                initial={{
                  left: pos.x,
                  top: pos.y,
                  rotate: pos.rotation,
                }}
                animate={{
                  rotate: pos.rotation,
                  transition: { delay: 0.08 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                }}
                whileDrag={{ scale: 1.04, rotate: 0 }}
                style={{ zIndex: focusedId.current === review.id ? 3 : 1 }}
              >
                {review.header && (
                  <div className="review-card-header">{review.header}</div>
                )}
                <p className="review-card-text">{review.text}</p>
                <div className="review-card-footer">
                  <div className="review-card-author">
                    {review.photoURL ? (
                      <img src={review.photoURL} alt="" className="review-card-avatar" />
                    ) : (
                      <div className="review-card-avatar--fallback">
                        {(review.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="review-card-info">
                      <span className="review-card-name">{review.name}</span>
                      {review.role && <span className="review-card-role">{review.role}</span>}
                    </div>
                  </div>
                  {review.rating && (
                    <div className="review-card-stars">
                      {Array.from({ length: 5 }, (_, s) => (
                        <FiStar
                          key={s}
                          size={11}
                          className={s < review.rating ? 'star-filled' : 'star-empty'}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
