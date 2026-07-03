import { Link, Navigate, useParams } from 'react-router-dom';
import { FiClock, FiCalendar, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { getBlogPostBySlug, getBlogPostIndex, BLOG_POSTS } from '@/data/blogData';
import './BlogPostPage.scss';

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) return <Navigate to="/blog" replace />;

  const index = getBlogPostIndex(slug);
  const prevPost = index > 0 ? BLOG_POSTS[index - 1] : null;
  const nextPost = index < BLOG_POSTS.length - 1 ? BLOG_POSTS[index + 1] : null;

  return (
    <div className="blog-post-page">
      <header className="blog-shell-header">
        <div className="blog-shell-inner">
          <Link to="/" className="blog-shell-brand">drme-bit</Link>

          <nav className="blog-shell-nav" aria-label="Blog navigation">
            <Link to="/" className="blog-shell-link">Home</Link>
            <Link to="/blog" className="blog-shell-link is-active">Blog</Link>
          </nav>

          <div className="blog-shell-meta">
            <span className="blog-shell-chip">{post.category}</span>
            <span className="blog-shell-chip"><FiCalendar size={12} /> {post.date}</span>
            <span className="blog-shell-chip"><FiClock size={12} /> {post.readTime}</span>
          </div>
        </div>
      </header>

      <header className="blog-post-hero">
        <div className="blog-post-hero-inner">
          <div className="blog-post-breadcrumb">
            <Link to="/">home</Link>
            <span>/</span>
            <Link to="/blog">blog</Link>
            <span>/</span>
            <span>{post.slug}</span>
          </div>

          <h1>{post.title}</h1>
          <p className="blog-post-summary">{post.summary}</p>

          <div className="blog-post-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="blog-post-tag">{tag}</span>
            ))}
          </div>
        </div>
      </header>

      <main className="blog-post-layout">
        <article className="blog-post-content">
          {post.sections.map((section, index) => (
            <section key={section.heading} className="blog-post-section">
              <div className="blog-post-section-index">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </div>
            </section>
          ))}
        </article>

        <aside className="blog-post-side">
          <div className="blog-post-side-card">
            <span className="blog-post-side-label">Continue</span>
            <div className="blog-post-side-links">
              <Link to="/blog" className="blog-post-nav-link blog-post-nav-link--back">
                <FiArrowLeft size={14} />
                All posts
              </Link>
              {prevPost && (
                <Link to={`/blog/${prevPost.slug}`} className="blog-post-nav-link">
                  <FiArrowLeft size={14} />
                  Previous post
                </Link>
              )}
              {nextPost && (
                <Link to={`/blog/${nextPost.slug}`} className="blog-post-nav-link">
                  <FiArrowRight size={14} />
                  Next post
                </Link>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}