import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock, FiHash, FiBookOpen } from 'react-icons/fi';
import { BLOG_POSTS } from '@/data/blogData';
import './BlogPage.scss';

const featuredPost = BLOG_POSTS.find((post) => post.featured) || BLOG_POSTS[0];

export default function BlogPage() {
  const totalWords = BLOG_POSTS.reduce(
    (sum, post) => sum + post.summary.split(/\s+/).filter(Boolean).length,
    0,
  );

  return (
    <div className="blog-page">
      <header className="blog-shell-header">
        <div className="blog-shell-inner">
          <Link to="/" className="blog-shell-brand">drme-bit</Link>

          <nav className="blog-shell-nav" aria-label="Blog navigation">
            <Link to="/" className="blog-shell-link">Home</Link>
            <Link to="/blog" className="blog-shell-link is-active">Blog</Link>
          </nav>

          <div className="blog-shell-meta">
            <span className="blog-shell-chip">
              <FiBookOpen size={12} />
              {BLOG_POSTS.length} posts
            </span>
            <span className="blog-shell-chip">
              <FiHash size={12} />
              {totalWords} words
            </span>
          </div>
        </div>
      </header>

      <header className="blog-hero">
        <div className="blog-hero-inner">
          <p className="blog-kicker">Notes, essays, implementation details</p>
          <h1 className="blog-title">Blog</h1>
          <p className="blog-lead">
            Short technical posts about frontend architecture, motion, UI structure, and the decisions behind this portfolio.
          </p>

          <div className="blog-hero-stats">
            <span className="blog-hero-stat">
              <FiClock size={12} />
              updated weekly
            </span>
            <span className="blog-hero-note">technical writing, not a feed</span>
          </div>
        </div>
      </header>

      <main className="blog-layout">
        <section className="blog-featured">
          <div className="blog-section-head">
            <span className="blog-section-num">01</span>
            <h2 className="blog-section-title">Featured</h2>
          </div>

          <article className="blog-featured-card">
            <div className="blog-featured-meta">
              <span>{featuredPost.category}</span>
              <span>{featuredPost.date}</span>
              <span>{featuredPost.readTime}</span>
            </div>
            <h3>{featuredPost.title}</h3>
            <p>{featuredPost.summary}</p>
            <div className="blog-tag-row">
              {featuredPost.tags.map((tag) => (
                <span key={tag} className="blog-tag">{tag}</span>
              ))}
            </div>
            <Link to={`/blog/${featuredPost.slug}`} className="blog-read-link">
              Read post
              <FiArrowRight size={14} />
            </Link>
          </article>
        </section>

        <section className="blog-list-section">
          <div className="blog-section-head">
            <span className="blog-section-num">02</span>
            <h2 className="blog-section-title">All posts</h2>
          </div>

          <div className="blog-list">
            {BLOG_POSTS.map((post, index) => (
              <article key={post.slug} className="blog-card">
                <div className="blog-card-index">{String(index + 1).padStart(2, '0')}</div>
                <div className="blog-card-body">
                  <div className="blog-card-meta">
                    <span>{post.category}</span>
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="blog-tag-row">
                    {post.tags.map((tag) => (
                      <span key={tag} className="blog-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <Link to={`/blog/${post.slug}`} className="blog-card-link" aria-label={`Open ${post.title}`}>
                  <FiArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}