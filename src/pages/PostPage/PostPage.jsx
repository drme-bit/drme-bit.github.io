import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiArrowRight, FiClock, FiTag, FiCalendar } from 'react-icons/fi';
import { getBlogPostBySlug, getBlogPostIndex, BLOG_POSTS } from '@/data/blogData';
import './PostPage.scss';

export default function PostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = getBlogPostBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!post) navigate('/posts', { replace: true });
  }, [post, navigate]);

  if (!post) return null;

  const currentIndex = getBlogPostIndex(slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  return (
    <div className="post-page">
      {/* Floating Nav */}
      <nav className="pp-nav">
        <Link to="/" className="pp-nav-home">
          <FiHome size={10} />
          <span>home</span>
        </Link>
        <div className="pp-nav-divider" />
        <Link to="/posts" className="pp-nav-home">
          <FiArrowLeft size={10} />
          <span>posts</span>
        </Link>
        <div className="pp-nav-spacer" />
        <div className="pp-nav-arrows">
          {prevPost && (
            <Link to={`/posts/${prevPost.slug}`} className="pp-nav-arrow">
              <FiArrowLeft size={14} />
            </Link>
          )}
          {nextPost && (
            <Link to={`/posts/${nextPost.slug}`} className="pp-nav-arrow">
              <FiArrowRight size={14} />
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header className="post-hero">
        <div className="post-hero-inner">
          <div className="post-hero-breadcrumb">
            <Link to="/">home</Link>
            <span>/</span>
            <Link to="/posts">posts</Link>
            <span>/</span>
            <span className="post-hero-bc-current">{slug}</span>
          </div>

          <span className="post-hero-category">{post.category}</span>
          <h1 className="post-hero-title">{post.title}</h1>
          <p className="post-hero-excerpt">{post.summary}</p>

          <div className="post-hero-meta">
            <span className="post-hero-date">
              <FiCalendar size={12} />
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="post-hero-sep">·</span>
            <span className="post-hero-readtime">
              <FiClock size={12} />
              {post.readTime}
            </span>
            <span className="post-hero-sep">·</span>
            <span className="post-hero-counter">
              {String(currentIndex + 1).padStart(2, '0')} / {String(BLOG_POSTS.length).padStart(2, '0')}
            </span>
          </div>

          <div className="post-hero-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="post-hero-tag">
                <FiTag size={10} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="post-content">
        <div className="post-terminal">
          <div className="post-terminal-bar">
            <span className="post-terminal-dot post-terminal-dot--red" />
            <span className="post-terminal-dot post-terminal-dot--yellow" />
            <span className="post-terminal-dot post-terminal-dot--green" />
            <span className="post-terminal-title">~/posts/{slug}</span>
          </div>
          <div className="post-terminal-body">
            {post.sections.map((section, i) => (
              <section key={i} className="post-section">
                <h2 className="post-section-heading">
                  <span className="post-section-prompt">#</span>
                  {section.heading}
                </h2>
                <p className="post-section-body">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="post-bottom-nav">
        {prevPost && (
          <Link to={`/posts/${prevPost.slug}`} className="post-bottom-nav-btn">
            <FiArrowLeft size={14} />
            <span>{prevPost.title}</span>
          </Link>
        )}
        <Link to="/" className="post-bottom-nav-home">
          <FiHome size={14} />
        </Link>
        {nextPost && (
          <Link to={`/posts/${nextPost.slug}`} className="post-bottom-nav-btn post-bottom-nav-btn--next">
            <span>{nextPost.title}</span>
            <FiArrowRight size={14} />
          </Link>
        )}
      </nav>
    </div>
  );
}
