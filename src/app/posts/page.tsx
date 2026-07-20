'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiHome,
  FiArrowLeft,
  FiArrowRight,
  FiClock,
  FiTag,
  FiSearch,
  FiStar,
} from 'react-icons/fi';
import { BLOG_POSTS, CATEGORIES } from '@/data/blogData';
import type { BlogPost } from '@/data/blogData';
import styles from './PostsList.module.scss';

const ALL_CATEGORIES = ['All', ...new Set(BLOG_POSTS.map((p) => p.category))];

function FeaturedCard({ post }: { post: BlogPost }) {
  const router = useRouter();
  const cat = CATEGORIES[post.category] || CATEGORIES.Frontend;

  return (
    <article
      className={styles['featured-card']}
      style={{ '--card-gradient': cat.gradient, '--card-color': cat.color } as React.CSSProperties}
      onClick={() => router.push(`/posts/${post.slug}`)}
    >
      <div className={styles['featured-card-glow']} />
      <div className={styles['featured-card-content']}>
        <div className={styles['featured-card-top']}>
          <span className={styles['featured-badge']}>
            <FiStar size={10} />
            Featured
          </span>
          <span className={styles['featured-card-cat']}>{post.category}</span>
        </div>
        <h2 className={styles['featured-card-title']}>{post.title}</h2>
        <p className={styles['featured-card-excerpt']}>{post.excerpt}</p>
        <div className={styles['featured-card-meta']}>
          <span className={styles['featured-card-date']}>
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className={styles['featured-card-sep']}>·</span>
          <span className={styles['featured-card-readtime']}>
            <FiClock size={11} />
            {post.readTime}
          </span>
        </div>
        <div className={styles['featured-card-tags']}>
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles['featured-card-tag']}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <FiArrowRight size={18} className={styles['featured-card-arrow']} />
    </article>
  );
}

function PostRow({ post, index }: { post: BlogPost; index: number }) {
  const router = useRouter();
  const cat = CATEGORIES[post.category] || CATEGORIES.Frontend;

  return (
    <article
      className={styles['posts-row']}
      style={{
        '--row-accent': cat.color,
        '--row-gradient': cat.gradient,
        animationDelay: `${index * 0.06}s`,
      } as React.CSSProperties}
      onClick={() => router.push(`/posts/${post.slug}`)}
    >
      <div className={styles['posts-row-accent']} />
      <div className={styles['posts-row-num']}>{String(index + 1).padStart(2, '0')}</div>

      <div className={styles['posts-row-content']}>
        <div className={styles['posts-row-top']}>
          <span className={styles['posts-row-category']}>{post.category}</span>
          <span className={styles['posts-row-date']}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <h3 className={styles['posts-row-title']}>{post.title}</h3>
        <p className={styles['posts-row-excerpt']}>{post.excerpt}</p>

        <div className={styles['posts-row-bottom']}>
          <div className={styles['posts-row-tags']}>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles['posts-row-tag']}>
                <FiTag size={9} />
                {tag}
              </span>
            ))}
          </div>
          <span className={styles['posts-row-readtime']}>
            <FiClock size={11} />
            {post.readTime}
          </span>
        </div>
      </div>

      <div className={styles['posts-row-arrow']}>
        <FiArrowRight size={14} />
      </div>
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

  const featuredPost = BLOG_POSTS.find((p) => p.featured);
  const regularPosts = BLOG_POSTS.filter((p) => !p.featured);

  const filteredPosts = regularPosts.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`${styles['posts-list-page']}${mounted ? ` ${styles['is-mounted']}` : ''}`}>
      {/* Floating Nav */}
      <nav className={styles['pp-nav']}>
        <Link href="/" className={styles['pp-nav-home']}>
          <FiHome size={10} />
          <span>home</span>
        </Link>
        <div className={styles['pp-nav-divider']} />
        <span className={styles['pp-nav-label']}>posts</span>
        <div className={styles['pp-nav-spacer']} />
        <span className={styles['pp-nav-count']}>{BLOG_POSTS.length} posts</span>
      </nav>

      {/* Hero */}
      <header className={styles['pl-hero']}>
        <div className={styles['pl-hero-inner']}>
          <div className={styles['pl-hero-breadcrumb']}>
            <Link href="/">home</Link>
            <span>/</span>
            <span className={styles['pl-hero-bc-current']}>posts</span>
          </div>

          <h1 className={styles['pl-hero-title']}>
            <span className={styles['pl-hero-prompt']}>$</span>
            ls ./posts
          </h1>
          <p className={styles['pl-hero-desc']}>
            Notes on frontend, architecture, and design — short reads about building things that
            work.
          </p>
        </div>
      </header>

      {/* Featured */}
      {featuredPost && activeCategory === 'All' && !searchQuery && (
        <section className={styles['pl-featured']}>
          <FeaturedCard post={featuredPost} />
        </section>
      )}

      {/* Filters */}
      <div className={styles['pl-filters']}>
        <div className={styles['pl-search']}>
          <FiSearch size={14} className={styles['pl-search-icon']} />
          <input
            type="text"
            placeholder="grep -i 'search posts...'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles['pl-search-input']}
          />
        </div>

        <div className={styles['pl-categories']}>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles['pl-category-btn']}${activeCategory === cat ? ` ${styles['is-active']}` : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <main className={styles['pl-posts']}>
        {filteredPosts.length === 0 ? (
          <div className={styles['pl-empty']}>
            <span className={styles['pl-empty-prompt']}>$</span>
            <span>No posts found matching &quot;{searchQuery || activeCategory}&quot;</span>
          </div>
        ) : (
          filteredPosts.map((post, i) => (
            <PostRow key={post.slug} post={post} index={i} />
          ))
        )}
      </main>

      {/* Footer */}
      <footer className={styles['pl-footer']}>
        <Link href="/" className={styles['pl-footer-home']}>
          <FiArrowLeft size={14} />
          <span>back to home</span>
        </Link>
      </footer>
    </div>
  );
}
