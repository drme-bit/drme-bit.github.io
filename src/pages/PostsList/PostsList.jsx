import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiArrowRight, FiClock, FiTag, FiSearch } from 'react-icons/fi';
import { BLOG_POSTS } from '@/data/blogData';
import './PostsList.scss';

const CATEGORY_COLORS = {
  Frontend: 'var(--accent-secondary)',
  Architecture: 'var(--accent-tertiary)',
  Design: 'var(--accent-warm)',
};

const ALL_CATEGORIES = ['All', ...new Set(BLOG_POSTS.map((p) => p.category))];

function PostRow({ post, index }) {
  const navigate = useNavigate();
  const color = CATEGORY_COLORS[post.category] || 'var(--accent-secondary)';

  return (
    <article
      className="posts-row"
      style={{ '--row-accent': color }}
      onClick={() => navigate(`/posts/${post.slug}`)}
    >
      <div className="posts-row-num">
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="posts-row-content">
        <div className="posts-row-top">
          <span className="posts-row-category">{post.category}</span>
          <span className="posts-row-date">
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <h3 className="posts-row-title">{post.title}</h3>
        <p className="posts-row-excerpt">{post.excerpt}</p>

        <div className="posts-row-bottom">
          <div className="posts-row-tags">
            {post.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="posts-row-tag">
                <FiTag size={9} />
                {tag}
              </span>
            ))}
          </div>
          <span className="posts-row-readtime">
            <FiClock size={11} />
            {post.readTime}
          </span>
        </div>
      </div>

      <div className="posts-row-arrow">
        <FiArrowRight size={14} />
      </div>
    </article>
  );
}

export default function PostsList() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="posts-list-page">
      {/* Floating Nav */}
      <nav className="pp-nav">
        <Link to="/" className="pp-nav-home">
          <FiHome size={10} />
          <span>home</span>
        </Link>
        <div className="pp-nav-divider" />
        <span className="pp-nav-label">posts</span>
        <div className="pp-nav-spacer" />
        <span className="pp-nav-count">{BLOG_POSTS.length} posts</span>
      </nav>

      {/* Hero */}
      <header className="pl-hero">
        <div className="pl-hero-inner">
          <div className="pl-hero-breadcrumb">
            <Link to="/">home</Link>
            <span>/</span>
            <span className="pl-hero-bc-current">posts</span>
          </div>

          <h1 className="pl-hero-title">
            <span className="pl-hero-prompt">$</span>
            ls ./posts
          </h1>
          <p className="pl-hero-desc">
            Notes on frontend, architecture, and design — short reads about building things that work.
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="pl-filters">
        <div className="pl-search">
          <FiSearch size={14} className="pl-search-icon" />
          <input
            type="text"
            placeholder="grep -i 'search posts...'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-search-input"
          />
        </div>

        <div className="pl-categories">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`pl-category-btn${activeCategory === cat ? ' is-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <main className="pl-posts">
        {filteredPosts.length === 0 ? (
          <div className="pl-empty">
            <span className="pl-empty-prompt">$</span>
            <span>No posts found matching "{searchQuery || activeCategory}"</span>
          </div>
        ) : (
          filteredPosts.map((post, i) => (
            <PostRow key={post.slug} post={post} index={BLOG_POSTS.indexOf(post)} />
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="pl-footer">
        <Link to="/" className="pl-footer-home">
          <FiArrowLeft size={14} />
          <span>back to home</span>
        </Link>
      </footer>
    </div>
  );
}
