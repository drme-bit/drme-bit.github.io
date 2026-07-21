'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import useReveal from '@/shared/hooks/useReveal';
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import { BLOG_POSTS, CATEGORIES } from '@/data/blogData';
import type { BlogPost } from '@/data/blogData';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import styles from './Blog.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

interface PostCardProps {
  post: BlogPost;
  index: number;
}

/* ─── Sub-components ─────────────────────────────────────── */

function PostCard({ post, index }: PostCardProps) {
  const router = useRouter();
  const cat = CATEGORIES[post.category] || CATEGORIES.Frontend;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  return (
    <article
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

export default function Blog() {
  const [ref, visible] = useReveal();
  const router = useRouter();
  const featured = BLOG_POSTS.filter((p: BlogPost) => p.featured);
  const recent = BLOG_POSTS.filter((p: BlogPost) => !p.featured).slice(0, 2);

  return (
    <section id="blog" ref={ref} className={`${styles.section} ${styles['section--blog']} ${styles.reveal}${visible ? ` ${styles['is-visible']}` : ''}`}>
      <SectionTitle title="blog" accent="_" visible={visible} />

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
  );
}
