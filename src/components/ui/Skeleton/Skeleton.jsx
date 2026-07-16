import './Skeleton.scss';

export function SkeletonLine({ width, height = '0.75rem', className = '' }) {
  return (
    <div
      className={`skeleton-line ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonCircle({ size = 36, className = '' }) {
  return (
    <div
      className={`skeleton-circle ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`skeleton-card ${className}`}>
      <SkeletonLine width="60%" height="0.9rem" />
      <div className="skeleton-card__body">
        {Array.from({ length: lines }, (_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? '40%' : '100%'}
            height="0.7rem"
          />
        ))}
      </div>
      <div className="skeleton-card__footer">
        <SkeletonCircle size={28} />
        <SkeletonLine width="80px" height="0.65rem" />
      </div>
    </div>
  );
}

export function SkeletonBlogCard({ className = '' }) {
  return (
    <div className={`skeleton-blog-card ${className}`}>
      <SkeletonLine width="40%" height="0.6rem" />
      <SkeletonLine width="85%" height="0.95rem" />
      <div className="skeleton-blog-card__lines">
        <SkeletonLine width="100%" height="0.65rem" />
        <SkeletonLine width="100%" height="0.65rem" />
        <SkeletonLine width="60%" height="0.65rem" />
      </div>
      <div className="skeleton-blog-card__tags">
        <SkeletonLine width="50px" height="0.55rem" />
        <SkeletonLine width="40px" height="0.55rem" />
      </div>
    </div>
  );
}
