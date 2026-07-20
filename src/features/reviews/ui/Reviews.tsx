'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { signInWithPopup, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { db, auth, googleProvider } from '@/shared/config/firebase';
import useReveal from '@/shared/hooks/useReveal';
import { useModal } from '@/providers/ModalProvider';
import {
  PiArrowRight,
  PiCheckCircle,
  PiSignOut,
  PiStarFill,
  PiUser,
} from 'react-icons/pi';
import styles from './Reviews.module.scss';
import ReviewsHero from './ReviewsHero';
import ReviewsForm from './ReviewsForm';

/* ─── Types ──────────────────────────────────────────────── */

interface Review {
  id: string;
  name?: string;
  email?: string;
  photoURL?: string;
  role?: string;
  header?: string;
  text: string;
  rating?: number;
  approved?: boolean;
  createdAt?: Date | null;
}

/* ─── Constants ──────────────────────────────────────────── */

const WORLD_W = 4000;
const WORLD_H = 2500;
const FOCUS_INTERVAL = 20000;
const RESUME_DELAY = 8000;
const BLUR_DURATION = 600;

/* ─── Seeded random ──────────────────────────────────────── */

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function distributeCards(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 * 1.618;
    const radius = 200 + seededRandom(i) * 800;
    const x = WORLD_W / 2 + Math.cos(angle) * radius - 140;
    const y = WORLD_H / 2 + Math.sin(angle) * radius - 80;
    return {
      x: Math.max(60, Math.min(WORLD_W - 340, x)),
      y: Math.max(60, Math.min(WORLD_H - 200, y)),
      rotation: (seededRandom(i + 200) - 0.5) * 8,
    };
  });
}

/* ─── Reviews ────────────────────────────────────────────── */

export default function Reviews() {
  const [ref, visible] = useReveal();
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const { openModal } = useModal();

  /* ─── Auth ───────────────────────────────────────────── */

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), where('approved', '==', true));
    const unsub = onSnapshot(q, (snap) => {
      const items: Review[] = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() ?? null } as Review;
      });
      items.sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));
      setReviews(items);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) { setHasReviewed(false); return; }
    async function check() {
      try {
        const q = query(collection(db, 'reviews'), where('uid', '==', user!.uid), where('approved', '==', true));
        const snap = await getDocs(q);
        setHasReviewed(!snap.empty);
      } catch { setHasReviewed(false); }
    }
    check();
  }, [user]);

  async function handleSignIn() {
    try { await signInWithPopup(auth, googleProvider); } catch (e) { console.error(e); }
  }

  async function handleSignOut() {
    try { await signOut(auth); setHasReviewed(false); } catch (e) { console.error(e); }
  }

  /* ─── Canvas state ───────────────────────────────────── */

  const worldRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const focusIdx = useRef(0);
  const userInteractedAt = useRef(0);
  const focusedId = useRef<string | null>(null);
  const [blurred, setBlurred] = useState(false);
  const [hintHidden, setHintHidden] = useState(false);
  const [viewportSize, setViewportSize] = useState({ w: 1200, h: 800 });

  useEffect(() => { setViewportSize({ w: window.innerWidth, h: window.innerHeight }); }, []);
  useEffect(() => { const t = setTimeout(() => setHintHidden(true), 6000); return () => clearTimeout(t); }, []);

  const cardPositions = useMemo(() => distributeCards(reviews.length), [reviews.length]);
  const skeletonPositions = useMemo(() => distributeCards(6), []);

  /* ─── Pan ────────────────────────────────────────────── */

  const animate = useCallback(() => {
    const el = worldRef.current;
    if (!el) return;
    const lerp = 0.04;
    posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp;
    posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp;
    el.style.transform = `translate(${-posRef.current.x}px, ${-posRef.current.y}px)`;
    if (Math.abs(targetRef.current.x - posRef.current.x) > 0.5 || Math.abs(targetRef.current.y - posRef.current.y) > 0.5) {
      rafRef.current = requestAnimationFrame(animate);
    }
  }, []);

  const panTo = useCallback((x: number, y: number) => {
    targetRef.current = { x, y };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  function focusOnCard(idx: number) {
    const pos = cardPositions[idx];
    if (!pos) return;
    focusedId.current = reviews[idx].id;
    userInteractedAt.current = Date.now();
    setBlurred(true);
    panTo(pos.x - window.innerWidth / 2 + 140, pos.y - window.innerHeight * 0.1);
    setTimeout(() => setBlurred(false), BLUR_DURATION);
  }

  /* ─── Auto-focus ─────────────────────────────────────── */

  useEffect(() => {
    if (reviews.length === 0) return;
    const startX = WORLD_W / 2 - window.innerWidth / 2;
    const startY = WORLD_H / 2 - window.innerHeight / 2;
    posRef.current = { x: startX, y: startY };
    targetRef.current = { x: startX, y: startY };

    const interval = setInterval(() => {
      if (Date.now() - userInteractedAt.current < RESUME_DELAY) return;
      focusIdx.current = (focusIdx.current + 1) % reviews.length;
      focusOnCard(focusIdx.current);
    }, FOCUS_INTERVAL);
    return () => clearInterval(interval);
  }, [reviews.length, cardPositions]);

  /* ─── Keyboard ───────────────────────────────────────── */

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (reviews.length === 0) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = (activeIdx + 1) % reviews.length;
        setActiveIdx(next);
        focusOnCard(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = (activeIdx - 1 + reviews.length) % reviews.length;
        setActiveIdx(prev);
        focusOnCard(prev);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reviews.length, activeIdx]);

  /* ─── Mouse drag ─────────────────────────────────────── */

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [canvasDragging, setCanvasDragging] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles['review-card']}`) || (e.target as HTMLElement).closest(`.${styles['reviews-hero']}`)) return;
    isDragging.current = true;
    setCanvasDragging(true);
    userInteractedAt.current = Date.now();
    focusedId.current = null;
    setBlurred(false);
    setHintHidden(true);
    dragStart.current = { x: e.clientX + posRef.current.x, y: e.clientY + posRef.current.y };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const x = dragStart.current.x - e.clientX;
    const y = dragStart.current.y - e.clientY;
    posRef.current = { x, y };
    targetRef.current = { x, y };
    if (worldRef.current) worldRef.current.style.transform = `translate(${-x}px, ${-y}px)`;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    setCanvasDragging(false);
  }, []);

  /* ─── Touch drag ─────────────────────────────────────── */

  const touchStart = useRef({ x: 0, y: 0 });

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles['review-card']}`) || (e.target as HTMLElement).closest(`.${styles['reviews-hero']}`)) return;
    const t = e.touches[0];
    isDragging.current = true;
    setCanvasDragging(true);
    userInteractedAt.current = Date.now();
    focusedId.current = null;
    setBlurred(false);
    setHintHidden(true);
    touchStart.current = { x: t.clientX + posRef.current.x, y: t.clientY + posRef.current.y };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const t = e.touches[0];
    const x = touchStart.current.x - t.clientX;
    const y = touchStart.current.y - t.clientY;
    posRef.current = { x, y };
    targetRef.current = { x, y };
    if (worldRef.current) worldRef.current.style.transform = `translate(${-x}px, ${-y}px)`;
  }, []);

  const onTouchEnd = useCallback(() => {
    isDragging.current = false;
    setCanvasDragging(false);
  }, []);

  /* ─── Modal ──────────────────────────────────────────── */

  function openReviewModal() {
    if (!user) { handleSignIn(); return; }
    openModal({
      className: 'modal-panel--reviews',
      content: (
        <div className={styles['review-modal-body']}>
          <div className={styles['review-modal-bar']}>
            <span className={styles['review-modal-title']}>// leave a review</span>
            <button type="button" className={styles['signout-link']} onClick={handleSignOut}>
              <PiSignOut size={12} />
              <span>sign out</span>
            </button>
          </div>
          {hasReviewed ? (
            <div className={styles['form-success']}>
              <PiCheckCircle size={40} />
              <p>You have already left a review.</p>
            </div>
          ) : (
            <ReviewsForm user={user} onSignOut={handleSignOut} />
          )}
        </div>
      ),
    });
  }

  /* ─── Render ─────────────────────────────────────────── */

  return (
    <section
      id="reviews"
      ref={ref}
      className={`${styles.section} ${styles['section--reviews']} ${styles.reveal}${visible ? ` ${styles['is-visible']}` : ''}`}
    >
      <div
        className={`${styles['reviews-canvas']}${blurred ? ` ${styles['reviews-canvas--blurred']}` : ''}${canvasDragging ? ` ${styles['reviews-canvas--dragging']}` : ''}${visible ? ` ${styles['is-revealed']}` : ''}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ReviewsHero isRevealed={visible} onOpenModal={openReviewModal} />

        <div className={`${styles['reviews-drag-hint']}${hintHidden ? ` ${styles['is-hidden']}` : ''}`}>
          <span>drag to explore</span>
          <PiArrowRight size={10} />
        </div>

        {/* Mini Map */}
        <div className={styles['reviews-minimap']}>
          {cardPositions.map((pos, i) => (
            <div
              key={`map-${i}`}
              className={`${styles['minimap-dot']}${focusedId.current === reviews[i]?.id ? ` ${styles['is-active']}` : ''}`}
              style={{ left: `${(pos.x / WORLD_W) * 100}%`, top: `${(pos.y / WORLD_H) * 100}%` }}
            />
          ))}
          <div
            className={styles['minimap-viewport']}
            style={{
              left: `${(posRef.current.x / WORLD_W) * 100}%`,
              top: `${(posRef.current.y / WORLD_H) * 100}%`,
              width: `${(viewportSize.w / WORLD_W) * 100}%`,
              height: `${(viewportSize.h / WORLD_H) * 100}%`,
            }}
          />
          <div className={styles['minimap-label']}>{reviews.length} reviews</div>
        </div>

        <div ref={worldRef} className={styles['reviews-world']} style={{ width: WORLD_W, height: WORLD_H }}>
          {loading && skeletonPositions.map((pos, i) => (
            <div
              key={`skel-${i}`}
              className={styles['review-card']} style={{ left: pos.x, top: pos.y, transform: `rotate(${pos.rotation}deg)`, opacity: 0.3 }}
            >
              <div className={styles['review-card-skeleton']}>
                <div className={styles['skeleton-line']} style={{ width: '60%' }} />
                <div className={styles['skeleton-line']} style={{ width: '90%' }} />
                <div className={styles['skeleton-line']} style={{ width: '40%' }} />
              </div>
            </div>
          ))}

          {!loading && reviews.length === 0 && (
            <div className={styles['reviews-empty']} style={{ left: WORLD_W / 2, top: WORLD_H / 2 }}>
              no reviews yet. be the first!
            </div>
          )}

          {!loading && reviews.map((review, i) => {
            const pos = cardPositions[i];
            if (!pos) return null;
            return (
              <div
                key={review.id}
                className={`${styles['review-card']}${focusedId.current === review.id ? ` ${styles['is-focused']}` : ''}`}
                style={{
                  left: pos.x,
                  top: pos.y,
                  transform: `rotate(${pos.rotation}deg)`,
                  transitionDelay: `${i * 0.06}s`,
                }}
              >
                {review.header && (
                  <div className={styles['review-card-header']}>
                    <span className={styles['review-card-header-dot']} />
                    {review.header}
                  </div>
                )}
                <p className={styles['review-card-text']}>{review.text}</p>
                <div className={styles['review-card-footer']}>
                  <div className={styles['review-card-author']}>
                    {review.photoURL ? (
                      <img src={review.photoURL} alt="" className={styles['review-card-avatar']} />
                    ) : (
                      <div className={styles['review-card-avatar--fallback']}>
                        <PiUser size={12} />
                      </div>
                    )}
                    <div className={styles['review-card-info']}>
                      <span className={styles['review-card-name']}>{review.name}</span>
                      {review.role && <span className={styles['review-card-role']}>{review.role}</span>}
                    </div>
                  </div>
                  {review.rating && (
                    <div className={styles['review-card-stars']}>
                      {Array.from({ length: 5 }, (_, s) => (
                        <PiStarFill key={s} size={11} className={s < review.rating! ? styles['star-filled'] : styles['star-empty']} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
