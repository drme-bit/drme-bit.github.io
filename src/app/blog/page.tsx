'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TransitionLink } from '@/features/transitions';
import {
  FiArrowLeft,
  FiArrowRight,
  FiClock,
  FiSearch,
  FiStar,
} from '@/shared/ui/Icon';
import { blog, CATEGORIES } from '@/features/blog/lib';
import type { BlogPost } from '@/features/blog/lib';
import { usePostTransition } from '@/features/blog/model/PostTransitionContext';

const ALL_CATEGORIES = ['All', ...blog.categories];

function useOpenPost() {
  const router = useRouter();
  const { setTransitionFrom } = usePostTransition();
  return (post: BlogPost) => (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTransitionFrom({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
    router.push(`/blog/${post.slug}`);
  };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function FeaturedCard({ post }: { post: BlogPost }) {
  const openPost = useOpenPost();
  const cat = CATEGORIES[post.category] || CATEGORIES.Frontend;

  return (
    <article
      onClick={openPost(post)}
      className="group animate-rise cursor-pointer rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-6 transition-colors duration-200 hover:border-[var(--border-hover)] max-[700px]:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
          <FiStar size={10} aria-hidden="true" />
          Featured
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-dim)]">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full"
            style={{ backgroundColor: cat.color }}
          />
          {post.category}
        </span>
      </div>

      <h2 className="m-0 mt-4 font-display text-[clamp(1.4rem,3vw,1.9rem)] font-semibold leading-[1.15] tracking-[var(--tracking-tight)] text-foreground">
        {post.title}
      </h2>
      <p className="m-0 mt-2 max-w-[62ch] text-[0.86rem] leading-[1.65] text-muted-foreground">
        {post.excerpt}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-[0.66rem] text-[var(--text-ghost)]">{fmtDate(post.date)}</span>
        <span className="inline-flex items-center gap-1 font-mono text-[0.66rem] text-[var(--text-ghost)]">
          <FiClock size={11} aria-hidden="true" />
          {post.readTime}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[0.7rem] text-[var(--text-dim)] transition-all duration-200 group-hover:translate-x-1 group-hover:text-foreground">
          read <FiArrowRight size={13} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function PostRow({ post, index }: { post: BlogPost; index: number }) {
  const openPost = useOpenPost();
  const cat = CATEGORIES[post.category] || CATEGORIES.Frontend;

  return (
    <article
      onClick={openPost(post)}
      style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
      className="group animate-rise flex cursor-pointer items-baseline gap-5 border-b border-[var(--border)] py-5 transition-colors duration-200 first:border-t hover:bg-[var(--glass)] max-[700px]:gap-3"
    >
      <span className="w-8 shrink-0 font-mono text-[0.62rem] text-[var(--text-ghost)] max-[700px]:hidden">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-dim)]">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full"
              style={{ backgroundColor: cat.color }}
            />
            {post.category}
          </span>
          <span className="font-mono text-[0.62rem] text-[var(--text-ghost)]">{fmtDate(post.date)}</span>
        </div>
        <h3 className="m-0 mt-1.5 font-display text-[1.05rem] font-semibold leading-snug tracking-[var(--tracking-tight)] text-foreground transition-transform duration-200 group-hover:translate-x-1">
          {post.title}
        </h3>
        <p className="m-0 mt-1 line-clamp-2 max-w-[68ch] text-[0.82rem] leading-[1.6] text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {post.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="font-mono text-[0.62rem] text-[var(--text-ghost)]">
              #{tag}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[0.62rem] text-[var(--text-ghost)]">
            <FiClock size={10} aria-hidden="true" />
            {post.readTime}
          </span>
        </div>
      </div>

      <FiArrowRight
        size={14}
        aria-hidden="true"
        className="shrink-0 self-center text-[var(--text-ghost)] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-foreground"
      />
    </article>
  );
}

export default function PostsList() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const featuredPost = blog.featured[0];
  const allPosts = blog.all.filter(p => p.slug !== featuredPost?.slug);

  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`mx-auto w-full max-w-[880px] px-5 pb-20 pt-28 max-[700px]:pt-24 ${mounted ? '' : 'opacity-0'}`}>
      <header>
        <p className="m-0 font-mono text-[0.62rem] tracking-[0.1em] text-[var(--text-ghost)]">
          <TransitionLink href="/">home</TransitionLink>
          <span aria-hidden="true"> / </span>
          <span className="text-[var(--text-dim)]">blog</span>
        </p>
        <h1 className="m-0 mt-3 font-display text-[clamp(2.4rem,6vw,3.6rem)] font-bold leading-none tracking-[var(--tracking-section)] text-foreground">
          blog
        </h1>
        <p className="m-0 mt-3 max-w-[52ch] text-[0.9rem] leading-[1.65] text-muted-foreground">
          Notes on frontend, architecture, and design — short reads about building things that
          work.
        </p>
      </header>

      {featuredPost && activeCategory === 'All' && !searchQuery && (
        <section className="mt-10">
          <FeaturedCard post={featuredPost} />
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <label className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-transparent px-3.5 py-2.5 transition-colors focus-within:border-[var(--border-hover)]">
          <FiSearch size={14} aria-hidden="true" className="shrink-0 text-[var(--text-ghost)]" />
          <input
            type="text"
            placeholder="search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search posts"
            className="h-6 w-full bg-transparent text-[0.85rem] text-foreground outline-none placeholder:text-[var(--text-ghost)]"
          />
        </label>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className={`cursor-pointer rounded-full border px-3 py-1 font-mono text-[0.66rem] tracking-[0.04em] transition-all duration-200 active:scale-95 ${
                activeCategory === cat
                  ? 'border-[var(--accent-secondary)]/50 bg-[var(--accent-secondary)]/10 text-foreground'
                  : 'border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--border-hover)] hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="mt-6">
        {filteredPosts.length === 0 ? (
          <p className="m-0 border border-dashed border-[var(--border)] p-8 text-center font-mono text-[0.72rem] text-[var(--text-ghost)]">
            No posts found matching &quot;{searchQuery || activeCategory}&quot;
          </p>
        ) : (
          filteredPosts.map((post, i) => (
            <PostRow key={post.slug} post={post} index={i} />
          ))
        )}
      </main>

      <footer className="mt-12">
        <TransitionLink
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[0.7rem] text-[var(--text-dim)] transition-colors hover:text-foreground"
        >
          <FiArrowLeft size={14} aria-hidden="true" />
          <span>back to home</span>
        </TransitionLink>
      </footer>
    </div>
  );
}
