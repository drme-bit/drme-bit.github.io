'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { signInWithPopup, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import { db, auth, googleProvider } from '@/shared/config/firebase';
import { useModal } from '@/providers/ModalProvider';
import { PiArrowRight, PiCheckCircle, PiSignOut, PiStarFill, PiUser } from '@/shared/ui/atoms/Icon';
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

/* Reviews */

export default function Reviews() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);

  const { openModal } = useModal();
  const lenis = useLenis();

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

  useEffect(() => {
    if (!user) {
      setHasReviewed(false);
      return;
    }
    async function check() {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('uid', '==', user!.uid),
          where('approved', '==', true),
        );
        const snap = await getDocs(q);
        setHasReviewed(!snap.empty);
      } catch {
        setHasReviewed(false);
      }
    }
    check();
  }, [user]);

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

      // Hero reveal
      if (hero) {
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

      // Staggered card reveals
      if (grid) {
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
                toggleActions: 'play none none reverse',
              },
            },
          );
        }
      }
    },
    { scope: sectionRef },
  );

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
            <ReviewsForm user={user} onSignOut={handleSignOut} />
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
      {/* Decorative grid background */}
      <div className={styles['reviews-bg-grid']}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="reviews-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#reviews-grid)" />
        </svg>
      </div>

      <div ref={heroRef} className={styles['reviews-hero-wrap']} style={{ position: 'relative', zIndex: 1 }}>
        <ReviewsHero onOpenModal={openReviewModal} />
      </div>

      <div ref={gridRef} className={styles['reviews-grid']} style={{ position: 'relative', zIndex: 1 }}>
        {loading &&
          Array.from({ length: 6 }, (_, i) => (
            <div key={`skel-${i}`} className={`${styles['review-card']} ${styles['review-card--skeleton']}`}>
              <div className={styles['review-card-skeleton']}>
                <div className={styles['skeleton-line']} style={{ width: '60%' }} />
                <div className={styles['skeleton-line']} style={{ width: '90%' }} />
                <div className={styles['skeleton-line']} style={{ width: '40%' }} />
              </div>
            </div>
          ))}

        {!loading && reviews.length === 0 && (
          <div className={styles['reviews-empty']}>no reviews yet. be the first!</div>
        )}

        {!loading &&
          reviews.map((review) => (
            <div key={review.id} className={styles['review-card']}>
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
                    <img
                      src={review.photoURL}
                      alt=""
                      className={styles['review-card-avatar']}
                    />
                  ) : (
                    <div className={styles['review-card-avatar--fallback']}>
                      <PiUser size={12} />
                    </div>
                  )}
                  <div className={styles['review-card-info']}>
                    <span className={styles['review-card-name']}>{review.name}</span>
                    {review.role && (
                      <span className={styles['review-card-role']}>{review.role}</span>
                    )}
                  </div>
                </div>
                {review.rating && (
                  <div className={styles['review-card-stars']}>
                    {Array.from({ length: 5 }, (_, s) => (
                      <PiStarFill
                        key={s}
                        size={11}
                        className={
                          s < review.rating! ? styles['star-filled'] : styles['star-empty']
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
