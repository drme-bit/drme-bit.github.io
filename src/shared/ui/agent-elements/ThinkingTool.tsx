import { SpiralLoader } from './SpiralLoader';
import styles from './ThinkingTool.module.scss';

export function ThinkingTool({ label }: { label: string }) {
  return (
    <div className={styles.activity} role="status" aria-live="polite">
      <SpiralLoader size={22} />
      <span key={label} className={styles.label}>
        {label}
      </span>
    </div>
  );
}
