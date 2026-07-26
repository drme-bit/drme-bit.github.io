'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { BLOG_POSTS, CATEGORIES } from '@/data/blogData';
import type { BlogPost } from '@/data/blogData';
import { FiArrowRight, FiClock } from '@/shared/ui/atoms/Icon';
import styles from './Blog.module.scss';

gsap.registerPlugin(ScrollTrigger);

/* ─── Post Card ──────────────────────────────────────────── */

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const cat = CATEGORIES[post.category] || CATEGORIES.Frontend;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        delay: index * 0.08,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      },
    );
  }, [index]);

  return (
    <article
      ref={ref}
      className={`${styles['blog-card']}${post.featured ? ` ${styles['blog-card--featured']}` : ''}`}
      style={{ '--card-color': cat.color } as React.CSSProperties}
      onClick={() => router.push(`/posts/${post.slug}`)}
      onMouseMove={handleMouseMove}
    >
      <div className={styles['blog-card-inner']}>
        <div className={styles['blog-card-top']}>
          <span className={styles['blog-card-category']}>
            <span className={styles['blog-card-cat-dot']} />
            {post.category}
          </span>
          {post.featured && (
            <span className={styles['blog-card-featured']}>featured</span>
          )}
        </div>

        <h3 className={styles['blog-card-title']}>{post.title}</h3>
        <p className={styles['blog-card-excerpt']}>{post.excerpt}</p>

        <div className={styles['blog-card-meta']}>
          <span className={styles['blog-card-date']}>
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className={styles['blog-card-sep']}>·</span>
          <span className={styles['blog-card-readtime']}>
            <FiClock size={10} />
            {post.readTime}
          </span>
        </div>

        <div className={styles['blog-card-tags']}>
          {post.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className={styles['blog-card-tag']}>{tag}</span>
          ))}
        </div>

        <div className={styles['blog-card-action']}>
          <span className={styles['blog-card-cta']}>
            read more
            <FiArrowRight size={12} />
          </span>
        </div>
      </div>
    </article>
  );
}

/* ─── Blog ───────────────────────────────────────────────── */

export const Blog = forwardRef<HTMLDivElement, { router?: ReturnType<typeof useRouter> }>(
  function Blog({ router: routerProp }, ref) {
    const router = routerProp || useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const featured = BLOG_POSTS.filter((p: BlogPost) => p.featured);
    const recent = BLOG_POSTS.filter((p: BlogPost) => !p.featured).slice(0, 2);

    useImperativeHandle(ref, () => wrapperRef.current!);

    return (
      <div ref={wrapperRef} className={styles.wrapper}>
        <section id="blog" ref={sectionRef} className={styles.section}>
          <div className={styles.header}>
            <span className={styles.headerTag}>02 / 03</span>
            <h2 className={styles.headerTitle}>BLOG</h2>
            <p className={styles.headerSub}>thoughts & writeups</p>
          </div>

          <div className={styles['blog-grid']}>
            {featured.map((post: BlogPost) => (
              <PostCard key={post.slug} post={post} index={BLOG_POSTS.indexOf(post)} />
            ))}
            {recent.map((post: BlogPost) => (
              <PostCard key={post.slug} post={post} index={BLOG_POSTS.indexOf(post)} />
            ))}
          </div>

          <div className={styles['blog-footer']}>
            <button className={styles['blog-view-all']} onClick={() => router.push('/posts')}>
              <span>view all posts</span>
              <FiArrowRight size={13} />
            </button>
          </div>
        </section>
      </div>
    )
  }
);

Blog.displayName = 'Blog';