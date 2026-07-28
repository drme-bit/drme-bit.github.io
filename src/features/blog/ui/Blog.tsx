'use client';

import { useRouter } from 'next/navigation';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { blog } from '@/features/blog/lib';
import type { BlogPost } from '@/features/blog/lib';
import { FiArrowRight, FiClock } from '@/shared/ui/atoms/Icon';
import styles from './Blog.module.scss';

gsap.registerPlugin(ScrollTrigger);

/*  Post Card ── */

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

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
        delay: index * 0.04,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      },
    );
  }, [index]);

  return (
    <article
      ref={ref}
      className={`${styles['blog-card']}${post.featured ? ` ${styles['blog-card--featured']}` : ''}`}
      onClick={() => router.push(`/blog/${post.slug}`)}
    >
      <div className={styles['blog-card-inner']}>
        <div className={styles['blog-card-top']}>
          <span className={styles['blog-card-category']}>{post.category}</span>
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

/*  Blog ─ */

export const Blog = forwardRef<HTMLDivElement, { router?: ReturnType<typeof useRouter> }>(
  function Blog({ router: routerProp }, ref) {
    const router = routerProp || useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const featured = blog.featured;
    const recent = blog.recent.slice(0, 4);

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
              <PostCard key={post.slug} post={post} index={blog.all.indexOf(post)} />
            ))}
            {recent.map((post: BlogPost) => (
              <PostCard key={post.slug} post={post} index={blog.all.indexOf(post)} />
            ))}
          </div>

          <div className={styles['blog-footer']}>
            <button className={styles['blog-view-all']} onClick={() => router.push('/blog')}>
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