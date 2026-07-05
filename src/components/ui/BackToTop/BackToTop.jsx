import { useScrollY } from '@/hooks/useRafScroll';
import './BackToTop.scss';

export default function BackToTop() {
  const scrollY = useScrollY();

  return (
    <button
      className={`back-to-top${scrollY > window.innerHeight * 0.6 ? ' is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}
