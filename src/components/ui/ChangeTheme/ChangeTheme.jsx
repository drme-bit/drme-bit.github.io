import { useTheme } from '@/context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

import styles from './ChangeTheme.module.scss';

const themeIcons = [
  { label: "light", icon: FiSun},
  { label: "dark", icon: FiMoon},
]



export default function ChangeTheme() {
  const { theme, toggle } = useTheme();

  const Icon = themeIcons.find((item) => item.label === theme)?.icon ?? FiMoon;

  return (
    <div className={styles.toggleContainer}>
      <button
        type="button"
        className={`${styles.themeToggle} ${theme === 'light' ? styles.isLight : ''}`}
        onClick={toggle}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      >
        <span className={styles.icon}><Icon/></span>
      </button>
    </div>
  );
}
