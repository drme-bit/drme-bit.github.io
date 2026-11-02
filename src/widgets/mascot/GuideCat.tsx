import { memo } from 'react';
import Image from 'next/image';

interface GuideCatProps {
  size?: number;
  className?: string;
}

/** A compact low-poly guide mascot for the portfolio assistant. */
function GuideCat({ size = 32, className }: GuideCatProps) {
  return (
    <span
      aria-hidden="true"
      className={className}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        flexShrink: 0,
        filter: 'drop-shadow(0 2px 5px rgb(0 0 0 / 0.24))',
      }}
    >
      <Image
        src="/images/mascot/guide-cat-lowpoly.png"
        alt=""
        width={1254}
        height={1254}
        unoptimized
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </span>
  );
}

export default memo(GuideCat);
