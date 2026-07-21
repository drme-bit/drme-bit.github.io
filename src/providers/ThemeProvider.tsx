'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeId = 'dark' | 'light' | 'cattpuchin' | 'nord' | 'dracula' | 'solarized';

export interface ThemeColors {
  bg: string;
  accent: string;
  accentSecondary: string;
  accentTertiary: string;
  text: string;
  textSecondary: string;
  border: string;
}

export type FontSize = 'sm' | 'md' | 'lg';

interface SettingsState {
  theme: ThemeId;
  fontSize: FontSize;
  reducedMotion: boolean;
  compactMode: boolean;
  blurEffects: boolean;
}

interface SettingsContextType extends SettingsState {
  setTheme: (t: ThemeId) => void;
  setFontSize: (s: FontSize) => void;
  setReducedMotion: (v: boolean) => void;
  setCompactMode: (v: boolean) => void;
  setBlurEffects: (v: boolean) => void;
  colors: ThemeColors;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const THEMES: { id: ThemeId; label: string; color: string }[] = [
  { id: 'dark', label: 'Dark', color: '#0a0a0a' },
  { id: 'light', label: 'Light', color: '#f5f3f0' },
  { id: 'cattpuchin', label: 'Cattpuchin', color: '#1e1c1c' },
  { id: 'nord', label: 'Nord', color: '#2e3440' },
  { id: 'dracula', label: 'Dracula', color: '#282a36' },
  { id: 'solarized', label: 'Solarized', color: '#002b36' },
];

const THEME_CLASSES: Record<ThemeId, string> = {
  dark: '',
  light: 'light',
  cattpuchin: 'cattpuchin',
  nord: 'nord',
  dracula: 'dracula',
  solarized: 'solarized',
};

function readColors(): ThemeColors {
  if (typeof document === 'undefined') {
    return {
      bg: '#0a0a0a',
      accent: '#e8e4df',
      accentSecondary: '#7dd3fc',
      accentTertiary: '#c4b5fd',
      text: '#f0eeeb',
      textSecondary: 'rgba(240, 238, 235, 0.55)',
      border: 'rgba(255, 255, 255, 0.08)',
    };
  }
  const s = getComputedStyle(document.body);
  const g = (v: string) => s.getPropertyValue(v).trim();
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

function loadSettings(): Partial<SettingsState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('settings');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveSettings(s: SettingsState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('settings', JSON.stringify({
    theme: s.theme,
    fontSize: s.fontSize,
    reducedMotion: s.reducedMotion,
    compactMode: s.compactMode,
    blurEffects: s.blurEffects,
  }));
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SettingsState>(() => {
    const saved = loadSettings();
    return {
      theme: saved.theme || 'dark',
      fontSize: saved.fontSize || 'md',
      reducedMotion: saved.reducedMotion ?? false,
      compactMode: saved.compactMode ?? false,
      blurEffects: saved.blurEffects ?? true,
    };
  });
  const [mounted, setMounted] = useState(false);
  const [colors, setColors] = useState<ThemeColors>(readColors);

  useEffect(() => {
    const saved = loadSettings();
    setState((s) => ({
      ...s,
      theme: (saved.theme as ThemeId) || s.theme,
      fontSize: saved.fontSize || s.fontSize,
      reducedMotion: saved.reducedMotion ?? s.reducedMotion,
      compactMode: saved.compactMode ?? s.compactMode,
      blurEffects: saved.blurEffects ?? s.blurEffects,
    }));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    const body = document.body;

    html.classList.remove('light', 'cattpuchin', 'nord', 'dracula', 'solarized');
    body.classList.remove('light', 'cattpuchin', 'nord', 'dracula', 'solarized');

    const cls = THEME_CLASSES[state.theme];
    if (cls) { html.classList.add(cls); body.classList.add(cls); }

    // Font size
    html.classList.remove('font-sm', 'font-md', 'font-lg');
    html.classList.add(`font-${state.fontSize}`);

    // Reduced motion
    html.classList.toggle('reduced-motion', state.reducedMotion);

    // Compact mode
    html.classList.toggle('compact-mode', state.compactMode);

    // Blur effects
    html.classList.toggle('no-blur', !state.blurEffects);

    saveSettings(state);
    setColors(readColors());
  }, [state, mounted]);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const setTheme = useCallback((t: ThemeId) => setState((s) => ({ ...s, theme: t })), []);
  const setFontSize = useCallback((f: FontSize) => setState((s) => ({ ...s, fontSize: f })), []);
  const setReducedMotion = useCallback((v: boolean) => setState((s) => ({ ...s, reducedMotion: v })), []);
  const setCompactMode = useCallback((v: boolean) => setState((s) => ({ ...s, compactMode: v })), []);
  const setBlurEffects = useCallback((v: boolean) => setState((s) => ({ ...s, blurEffects: v })), []);

  return (
    <SettingsContext.Provider value={{
      ...state,
      setTheme, setFontSize, setReducedMotion, setCompactMode, setBlurEffects,
      colors,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useTheme must be used within SettingsProvider');
  return ctx;
}
