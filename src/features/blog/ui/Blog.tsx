'use client';

import { useRouter } from 'next/navigation';
import useReveal from '@/shared/hooks/useReveal';
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import { BLOG_POSTS } from '@/data/blogData';
import type { BlogPost } from '@/data/blogData';
import { FiArrowRight, FiClock, FiTag } from 'react-icons/fi';
import styles from './Blog.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

interface PostCardProps {
  post: BlogPost;
  index: number;
}

/* ─── Data ───────────────────────────────────────────────── */

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: 'var(--accent-secondary)',
  Architecture: 'var(--accent-tertiary)',
  Design: 'var(--accent-warm)',
};

/* ─── Sub-components ─────────────────────────────────────── */

function PostCard({ post, index }: PostCardProps) {
  const router = useRouter();
  const color = CATEGORY_COLORS[post.category] || 'var(--accent-secondary)';

  return (
    <article
      className={`${styles['blog-card']}${post.featured ? ` ${styles['blog-card--featured']}` : ''}`}
      style={{ '--card-accent': color } as React.CSSProperties}
      onClick={() => router.push(`/posts/${post.slug}`)}
    >
      <div className={styles['blog-card-header']}>
        <span className={styles['blog-card-id']}>
          <span className={styles['blog-card-prompt']}>$</span>
          ./post_{String(index + 1).padStart(3, '0')}
        </span>
        <span className={styles['blog-card-category']}>{post.category}</span>
      </div>

      <h3 className={styles['blog-card-title']}>{post.title}</h3>
      <p className={styles['blog-card-excerpt']}>{post.excerpt}</p>

      <div className={styles['blog-card-meta']}>
        <span className={styles['blog-card-date']}>
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span className={styles['blog-card-sep']}>·</span>
        <span className={styles['blog-card-readtime']}>
          <FiClock size={11} />
          {post.readTime}
        </span>
      </div>

      <div className={styles['blog-card-tags']}>
        {post.tags.slice(0, 3).map((tag: string) => (
          <span key={tag} className={styles['blog-card-tag']}>
            <FiTag size={10} />
            {tag}
          </span>
        ))}
      </div>

      <div className={styles['blog-card-action']}>
        <span className={styles['blog-card-cta']}>
          cat post.md
          <FiArrowRight size={12} />
        </span>
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
          <span className={styles['blog-view-all-text']}>ls ./all_posts</span>
          <FiArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
