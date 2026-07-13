import { useTheme } from '@/context/ThemeContext';
import styles from './ChangeTheme.module.scss';

export default function ChangeTheme() {
  const { theme, toggle } = useTheme();

  return (
    <div className={styles.toggleContainer}>
      <button
        type="button"
        className={`${styles.themeToggle} ${theme === 'light' ? styles.isLight : ''}`}
        onClick={toggle}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        <span className={styles.icon}>{theme === 'dark' ? '☀' : '☾'}</span>
      </button>
    </div>
  );
}
