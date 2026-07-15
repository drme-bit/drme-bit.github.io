import { useNavigate } from 'react-router-dom';
import useReveal from '@/hooks/useReveal';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import { BLOG_POSTS } from '@/data/blogData';
import { FiArrowRight, FiClock, FiTag } from 'react-icons/fi';
import './Blog.scss';

const CATEGORY_COLORS = {
  Frontend: 'var(--accent-secondary)',
  Architecture: 'var(--accent-tertiary)',
  Design: 'var(--accent-warm)',
};

function PostCard({ post, index }) {
  const navigate = useNavigate();
  const color = CATEGORY_COLORS[post.category] || 'var(--accent-secondary)';

  return (
    <article
      className={`blog-card${post.featured ? ' blog-card--featured' : ''}`}
      style={{ '--card-accent': color }}
      onClick={() => navigate(`/posts/${post.slug}`)}
    >
      <div className="blog-card-header">
        <span className="blog-card-id">
          <span className="blog-card-prompt">$</span>
          ./post_{String(index + 1).padStart(3, '0')}
        </span>
        <span className="blog-card-category">{post.category}</span>
      </div>

      <h3 className="blog-card-title">{post.title}</h3>
      <p className="blog-card-excerpt">{post.excerpt}</p>

      <div className="blog-card-meta">
        <span className="blog-card-date">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <span className="blog-card-sep">·</span>
        <span className="blog-card-readtime">
          <FiClock size={11} />
          {post.readTime}
        </span>
      </div>

      <div className="blog-card-tags">
        {post.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="blog-card-tag">
            <FiTag size={10} />
            {tag}
          </span>
        ))}
      </div>

      <div className="blog-card-action">
        <span className="blog-card-cta">
          cat post.md
          <FiArrowRight size={12} />
        </span>
      </div>
    </article>
  );
}

export default function Blog() {
  const [ref, visible] = useReveal();
  const navigate = useNavigate();
  const featured = BLOG_POSTS.filter((p) => p.featured);
  const recent = BLOG_POSTS.filter((p) => !p.featured).slice(0, 2);

  return (
    <section id="blog" ref={ref} className={`section section--blog reveal${visible ? ' is-visible' : ''}`}>
      <SectionHeader title="blog" number="05" visible={visible} />

      <div className="blog-grid">
        {featured.map((post, i) => (
          <PostCard key={post.slug} post={post} index={BLOG_POSTS.indexOf(post)} />
        ))}
        {recent.map((post, i) => (
          <PostCard key={post.slug} post={post} index={BLOG_POSTS.indexOf(post)} />
        ))}
      </div>

      <div className="blog-footer">
        <button className="blog-view-all" onClick={() => navigate('/posts')}>
          <span className="blog-view-all-text">ls ./all_posts</span>
          <FiArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
