'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme, THEMES, type ThemeId, type FontSize } from '@/providers/ThemeProvider';
import { FiSettings } from 'react-icons/fi';
import styles from './ChangeTheme.module.scss';

export default function ChangeTheme() {
  const {
    theme, setTheme,
    fontSize, setFontSize,
    reducedMotion, setReducedMotion,
    compactMode, setCompactMode,
    blurEffects, setBlurEffects,
  } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className={styles.toggleContainer} ref={ref}>
      <button
        type="button"
        className={styles.themeToggle}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open settings"
      >
        <span className={styles.icon}><FiSettings /></span>
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelBar}>
            <span className={`${styles.panelDot} ${styles['panelDot--r']}`} />
            <span className={`${styles.panelDot} ${styles['panelDot--y']}`} />
            <span className={`${styles.panelDot} ${styles['panelDot--g']}`} />
            <span className={styles.panelTitle}>settings</span>
          </div>

          <div className={styles.panelBody}>
            {/* Theme */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>theme</span>
              <div className={styles.themeGrid}>
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.themeBtn} ${theme === t.id ? styles.themeBtnActive : ''}`}
                    onClick={() => setTheme(t.id as ThemeId)}
                  >
                    <span
                      className={styles.themeSwatch}
                      style={{ background: t.color }}
                    />
                    <span className={styles.themeBtnLabel}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>font size</span>
              <div className={styles.optionRow}>
                {(['sm', 'md', 'lg'] as FontSize[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.optionBtn} ${fontSize === s ? styles.optionBtnActive : ''}`}
                    onClick={() => setFontSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className={styles.section}>
              <span className={styles.sectionLabel}>preferences</span>

              <label className={styles.toggleRow}>
                <span className={styles.toggleLabel}>reduced motion</span>
                <button
                  type="button"
                  className={`${styles.toggle}${reducedMotion ? ` ${styles.toggleOn}` : ''}`}
                  onClick={() => setReducedMotion(!reducedMotion)}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </label>

              <label className={styles.toggleRow}>
                <span className={styles.toggleLabel}>compact mode</span>
                <button
                  type="button"
                  className={`${styles.toggle}${compactMode ? ` ${styles.toggleOn}` : ''}`}
                  onClick={() => setCompactMode(!compactMode)}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </label>

              <label className={styles.toggleRow}>
                <span className={styles.toggleLabel}>blur effects</span>
                <button
                  type="button"
                  className={`${styles.toggle}${blurEffects ? ` ${styles.toggleOn}` : ''}`}
                  onClick={() => setBlurEffects(!blurEffects)}
                >
                  <span className={styles.toggleKnob} />
                </button>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
