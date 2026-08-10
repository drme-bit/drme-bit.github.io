'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { signInWithPopup, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { db, auth, googleProvider } from '@/shared/config/firebase';
import { useModal } from '@/app/providers/ModalProvider';
import { PiCheckCircle, PiSignOut, PiStarFill, PiUser } from '@/shared/ui/atoms/Icon';
import styles from './Reviews.module.scss';
import ReviewsHero from './ReviewsHero';
import ReviewsForm from './ReviewsForm';

gsap.registerPlugin(ScrollTrigger);

/* Types */

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

const RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

function formatDate(d?: Date | null): string | null {
  if (!d || Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Reviews */

export default function Reviews() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);

  const { openModal } = useModal();

  /* Auth & Firestore Subscriptions */
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'reviews'), where('approved', '==', true));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items: Review[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() ?? null,
          } as Review;
        });
        items.sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));
        setReviews(items);
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  /* Block duplicate submissions: any review (approved or not) for this uid. */
  useEffect(() => {
    if (!user) {
      setHasReviewed(false);
      return;
    }
    const uid = user.uid;
    let cancelled = false;
    async function check() {
      try {
        const q = query(collection(db, 'reviews'), where('uid', '==', uid));
        const snap = await getDocs(q);
        if (!cancelled) setHasReviewed(!snap.empty);
      } catch {
        if (!cancelled) setHasReviewed(false);
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [user]);

  /* Derived stats */
  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      const rating = Math.min(5, Math.max(1, Math.floor(r.rating ?? 0)));
      c[rating - 1] += 1;
    }
    return c;
  }, [reviews]);

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
    : 0;

  const filters: { value: number; label: string; count: number }[] = useMemo(() => {
    const withCount = RATING_OPTIONS.map((value) => ({
      value,
      label: String(value) + ' ★',
      count: counts[value - 1],
    })).filter((f) => f.count > 0);
    return [{ value: 0, label: 'All', count: reviews.length }, ...withCount];
  }, [counts, reviews.length]);

  const visible =
    ratingFilter === 0 ? reviews : reviews.filter((r) => Math.floor(r.rating ?? 0) === ratingFilter);

  async function handleSignIn() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      setHasReviewed(false);
    } catch (e) {
      console.error(e);
    }
  }

  /* GSAP Scroll Animations */
  useGSAP(
    () => {
      const section = sectionRef.current;
      const hero = heroRef.current;
      const grid = gridRef.current;
      if (!section) return;

      if (hero && !prefersReducedMotion()) {
        gsap.fromTo(
          hero,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: hero,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      }

      if (grid && !prefersReducedMotion()) {
        const cards = Array.from(grid.querySelectorAll(`.${styles['review-card']}`));
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 30, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: grid,
                start: 'top 80%',
                once: true,
              },
            },
          );
        }
      }
    },
    { scope: sectionRef },
  );

  /* Re-animate the grid when the rating filter changes */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return;
    const cards = Array.from(grid.querySelectorAll(`.${styles['review-card']}`));
    if (cards.length === 0) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 26, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.05, ease: 'power2.out' },
    );
  }, [ratingFilter]);

  /* GSAP: Reviews sticky, Contact slides over */
  useEffect(() => {
    const section = sectionRef.current;
    const contact = document.getElementById('contact');
    if (!section || !contact) return;

    const ctx = gsap.context(() => {
      gsap.to(section, {
        filter: 'blur(6px)',
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: contact,
          start: 'top 88%',
          end: 'top top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  function openReviewModal() {
    if (!user) {
      handleSignIn();
      return;
    }
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
            <ReviewsForm user={user} onSignOut={handleSignOut} onSubmitted={() => setHasReviewed(true)} />
          )}
        </div>
      ),
    });
  }

  /* Render */
  return (
    <section
      id="reviews"
      ref={sectionRef}
      className={`${styles.section} ${styles['section--reviews']}`}
    >
      <div className={styles['reviews-bg-grid']} aria-hidden="true" />

      <div ref={heroRef} className={styles['reviews-hero-wrap']} style={{ position: 'relative', zIndex: 1 }}>
        <ReviewsHero onOpenModal={openReviewModal} average={average} count={reviews.length} />
      </div>

      {!loading && reviews.length > 0 && (
        <div className={styles['reviews-toolbar']} style={{ position: 'relative', zIndex: 1 }}>
          <span className={styles['reviews-toolbar-label']}>filter by rating</span>
          <div className={styles['reviews-filter']} role="group" aria-label="Filter reviews by rating">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                className={`${styles['reviews-filter-btn']} ${ratingFilter === f.value ? styles['reviews-filter-btn--active'] : ''}`}
                aria-pressed={ratingFilter === f.value}
                onClick={() => setRatingFilter(f.value)}
              >
                <span>{f.label}</span>
                <span className={styles['reviews-filter-count']}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={gridRef} className={styles['reviews-grid']} style={{ position: 'relative', zIndex: 1 }}>
        {loading &&
          Array.from({ length: 6 }, (_, i) => (
            <div key={`skel-${i}`} className={`${styles['review-card']} ${styles['review-card--skeleton']}`}>
              <div className={styles['review-card-skeleton']}>
                <div className={styles['skeleton-line']} style={{ width: '55%' }} />
                <div className={styles['skeleton-line']} style={{ width: '92%' }} />
                <div className={styles['skeleton-line']} style={{ width: '70%' }} />
                <div className={styles['skeleton-line']} style={{ width: '40%' }} />
                <div className={styles['skeleton-author']}>
                  <span className={styles['skeleton-avatar']} />
                  <div className={styles['skeleton-author-lines']}>
                    <div className={styles['skeleton-line']} style={{ width: '80%' }} />
                    <div className={styles['skeleton-line']} style={{ width: '55%' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}

        {!loading && reviews.length === 0 && (
          <div className={styles['reviews-empty']}>
            <span className={styles['reviews-empty-mark']}>//</span>
            <p>no reviews yet — be the first to leave one.</p>
            <button type="button" className={styles['reviews-cta']} onClick={openReviewModal}>
              <PiUser size={13} />
              leave a review
            </button>
          </div>
        )}

        {!loading &&
          visible.map((review, i) => (
            <article key={review.id} className={styles['review-card']}>
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
                    <span className={styles['review-card-date']}>
                      {formatDate(review.createdAt) ?? 'verified'}
                    </span>
                  </div>
                </div>
                <div className={styles['review-card-side']}>
                  {review.rating ? (
                    <div className={styles['review-card-stars']}>
                      {Array.from({ length: 5 }, (_, s) => (
                        <PiStarFill
                          key={s}
                          size={11}
                          className={s < review.rating! ? styles['star-filled'] : styles['star-empty']}
                        />
                      ))}
                    </div>
                  ) : null}
                  <span className={styles['review-card-index']}>{String(i + 1).padStart(2, '0')}</span>
                </div>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
