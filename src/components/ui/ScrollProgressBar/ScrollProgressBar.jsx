import { useEffect, useState } from 'react';
import './ScrollProgressBar.scss';

export default function ScrollProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="scroll-progress">
      <div className="scroll-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
