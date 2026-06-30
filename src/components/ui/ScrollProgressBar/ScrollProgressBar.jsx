import { useEffect, useState } from 'react';
import './ScrollProgressBar.scss';

export default function ScrollProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    update();
    let rafId;
    const tick = () => {
      update();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="scroll-progress">
      <div className="scroll-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
