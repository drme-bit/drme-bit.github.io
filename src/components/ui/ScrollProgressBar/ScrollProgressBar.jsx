import { useScrollProgress } from '@/hooks/useRafScroll';
import './ScrollProgressBar.scss';

export default function ScrollProgressBar() {
  const pct = useScrollProgress();

  return (
    <div className="scroll-progress">
      <div className="scroll-progress-fill" style={{ width: `${pct * 100}%` }} />
    </div>
  );
}
