'use client';

import styles from './Skeleton.module.scss';

interface SkeletonLineProps {
  width?: string;
  height?: string;
  className?: string;
}

export function SkeletonLine({ width, height = '0.75rem', className = '' }: SkeletonLineProps) {
  return (
    <div
      className={`${styles.skeletonLine} ${className}`}
      style={{ width, height }}
    />
  );
}

interface SkeletonCircleProps {
  size?: number;
  className?: string;
}

export function SkeletonCircle({ size = 36, className = '' }: SkeletonCircleProps) {
  return (
    <div
      className={`${styles.skeletonCircle} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <div className={`${styles.skeletonCard} ${className}`}>
      <SkeletonLine width="60%" height="0.9rem" />
      <div className={styles.skeletonCardBody}>
        {Array.from({ length: lines }, (_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? '40%' : '100%'}
            height="0.7rem"
          />
        ))}
      </div>
      <div className={styles.skeletonCardFooter}>
        <SkeletonCircle size={28} />
        <SkeletonLine width="80px" height="0.65rem" />
      </div>
    </div>
  );
}

interface SkeletonBlogCardProps {
  className?: string;
}

export function SkeletonBlogCard({ className = '' }: SkeletonBlogCardProps) {
  return (
    <div className={`${styles.skeletonBlogCard} ${className}`}>
      <SkeletonLine width="40%" height="0.6rem" />
      <SkeletonLine width="85%" height="0.95rem" />
      <div className={styles.skeletonBlogCardLines}>
        <SkeletonLine width="100%" height="0.65rem" />
        <SkeletonLine width="100%" height="0.65rem" />
        <SkeletonLine width="60%" height="0.65rem" />
      </div>
      <div className={styles.skeletonBlogCardTags}>
        <SkeletonLine width="50px" height="0.55rem" />
        <SkeletonLine width="40px" height="0.55rem" />
      </div>
    </div>
  );
}
