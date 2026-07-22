'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import {
  FiHome,
  FiArrowLeft,
  FiArrowRight,
} from 'react-icons/fi';
import { BLOG_POSTS } from '@/data/blogData';
import { useNav } from '@/providers/NavProvider';
import { usePostTransition } from '../PostTransitionContext';
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
    { ssr: false, loading: () => <div className={styles['post-loading']}>loading...</div> }
  ),
  'why-i-replaced-cobe': dynamic(
    () => import('@/data/posts/why-i-replaced-cobe/PostContent'),
    { ssr: false, loading: () => <div className={styles['post-loading']}>loading...</div> }
  ),
  'building-my-portfolio': dynamic(
    () => import('@/data/posts/building-my-portfolio/PostContent'),
    { ssr: false, loading: () => <div className={styles['post-loading']}>loading...</div> }
  ),
};

/* ─── Main Component ─────────────────────────────────────── */

export default function PostPageClient() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { transitionFrom } = usePostTransition();
  const { setPageConfig } = useNav();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  const clipFrom = useMemo(() => {
    if (typeof window === 'undefined' || !transitionFrom) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const top = transitionFrom.y;
    const right = vw - transitionFrom.x - transitionFrom.width;
    const bottom = vh - transitionFrom.y - transitionFrom.height;
    const left = transitionFrom.x;
    return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  }, [transitionFrom]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!post) router.replace('/posts');
  }, [post, router]);

  // Configure nav with prev/next arrows
  useEffect(() => {
    if (!post) return;
    setPageConfig({
      pagination: {
        prev: prevPost
          ? { label: prevPost.title, href: `/posts/${prevPost.slug}`, onClick: () => router.push(`/posts/${prevPost.slug}`) }
          : undefined,
        next: nextPost
          ? { label: nextPost.title, href: `/posts/${nextPost.slug}`, onClick: () => router.push(`/posts/${nextPost.slug}`) }
          : undefined,
      },
    });
  }, [slug]);

  if (!post) return null;

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;
  const PostContent = POST_COMPONENTS[slug];

  return (
    <div className={styles['post-page']}>
      <ProgressBar />

      {/* Post Content with clip-path morph from card */}
      {PostContent && clipFrom ? (
        <motion.div
          initial={{ clipPath: clipFrom }}
          animate={{ clipPath: 'inset(0)' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <PostContent />
        </motion.div>
      ) : (
        PostContent && <PostContent />
      )}
    </div>
  );
}
