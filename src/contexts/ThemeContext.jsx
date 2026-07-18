import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

function readColors() {
  const s = getComputedStyle(document.body);
  const g = (v) => s.getPropertyValue(v).trim();
  return {
    bg: g('--bg'),
    accent: g('--accent'),
    accentSecondary: g('--accent-secondary'),
    accentTertiary: g('--accent-tertiary'),
    text: g('--text'),
    textSecondary: g('--text-secondary'),
    border: g('--border'),
  };
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [colors, setColors] = useState(readColors);

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('light', theme === 'light');
    try { localStorage.setItem('theme', theme); } catch {}
    setColors(readColors());
  }, [theme]);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
