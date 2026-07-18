import { useEffect, useRef } from 'react';
import './ScrollProgressBar.scss';

// Direct DOM update — no React re-renders at 60fps
export default function ScrollProgressBar() {
  const fillRef = useRef(null);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    let rafId;
    let lastPct = -1;

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const winH = window.innerHeight;
        const pct = docH > winH ? window.scrollY / (docH - winH) : 0;
        if (pct !== lastPct) {
          lastPct = pct;
          el.style.width = `${pct * 100}%`;
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="scroll-progress">
      <div ref={fillRef} className="scroll-progress-fill" />
    </div>
  );
}
