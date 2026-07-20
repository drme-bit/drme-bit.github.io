'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  FiHome,
  FiArrowLeft,
  FiArrowRight,
} from 'react-icons/fi';
import { BLOG_POSTS } from '@/data/blogData';
import styles from './PostPage.module.scss';

/* ─── Progress Bar ───────────────────────────────────────── */

function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      setProgress(scrollHeight > 0 ? (scrolled / scrollHeight) * 100 : 0);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={styles['progress-bar']}>
      <div
        className={styles['progress-bar-fill']}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* ─── Dynamic PostContent loader ─────────────────────────── */

const POST_COMPONENTS: Record<string, React.ComponentType> = {
  'integrating-nodejs': dynamic(
    () => import('@/data/posts/integrating-nodejs/PostContent'),
    { ssr: false, loading: () => <div className={styles['post-loading']}>Loading...</div> }
  ),
  'why-i-replaced-cobe': dynamic(
    () => import('@/data/posts/why-i-replaced-cobe/PostContent'),
    { ssr: false, loading: () => <div className={styles['post-loading']}>Loading...</div> }
  ),
  'building-my-portfolio': dynamic(
    () => import('@/data/posts/building-my-portfolio/PostContent'),
    { ssr: false, loading: () => <div className={styles['post-loading']}>Loading...</div> }
  ),
};

/* ─── Main Component ─────────────────────────────────────── */

export default function PostPageClient() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!post) router.replace('/posts');
  }, [post, router]);

  if (!post) return null;

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;
  const PostContent = POST_COMPONENTS[slug];

  return (
    <div className={styles['post-page']}>
      <ProgressBar />

      {/* Floating Nav */}
      <nav className={styles['pp-nav']}>
        <Link href="/" className={styles['pp-nav-home']}>
          <FiHome size={10} />
          <span>home</span>
        </Link>
        <div className={styles['pp-nav-divider']} />
        <Link href="/posts" className={styles['pp-nav-home']}>
          <FiArrowLeft size={10} />
          <span>posts</span>
        </Link>
        <div className={styles['pp-nav-spacer']} />
        <div className={styles['pp-nav-arrows']}>
          {prevPost && (
            <Link href={`/posts/${prevPost.slug}`} className={styles['pp-nav-arrow']}>
              <FiArrowLeft size={14} />
            </Link>
          )}
          {nextPost && (
            <Link href={`/posts/${nextPost.slug}`} className={styles['pp-nav-arrow']}>
              <FiArrowRight size={14} />
            </Link>
          )}
        </div>
      </nav>

      {/* Post Content (each post renders its own hero) */}
      {PostContent && <PostContent />}

      {/* Bottom Nav */}
      <nav className={styles['post-bottom-nav']}>
        {prevPost && (
          <Link href={`/posts/${prevPost.slug}`} className={styles['post-bottom-nav-btn']}>
            <FiArrowLeft size={14} />
            <span>{prevPost.title}</span>
          </Link>
        )}
        <Link href="/" className={styles['post-bottom-nav-home']}>
          <FiHome size={14} />
        </Link>
        {nextPost && (
          <Link
            href={`/posts/${nextPost.slug}`}
            className={`${styles['post-bottom-nav-btn']} ${styles['post-bottom-nav-btn--next']}`}
          >
            <span>{nextPost.title}</span>
            <FiArrowRight size={14} />
          </Link>
        )}
      </nav>
    </div>
  );
}
