'use client';

import { Check } from 'lucide-react';
import { useTheme, THEMES, type FontSize } from '@/app/providers/ThemeProvider';
import { Switch, Segmented } from '@/shared/ui';
import styles from './WorkspaceSettings.module.scss';

export default function WorkspaceSettings() {
  const settings = useTheme();
  return (
    <div className={styles.root}>
      <fieldset>
        <legend className={styles.legend}>Color theme</legend>
        <div className={styles.themeGrid}>
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              aria-pressed={settings.theme === theme.id}
              onClick={() => settings.setTheme(theme.id)}
              className={styles.themeButton}
            >
              <span
                className="size-4 rounded-full border border-[var(--border)]"
                style={{ background: theme.color }}
              />
              <span className="flex-1 text-left">{theme.label}</span>
              {settings.theme === theme.id && <Check size={13} />}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className={styles.legend}>Text size</legend>
        <Segmented<FontSize>
          value={settings.fontSize}
          onChange={settings.setFontSize}
          options={['sm', 'md', 'lg'] as const}
        />
      </fieldset>
      <fieldset>
        <legend className={styles.legend}>Preferences</legend>
        {[
          { label: 'Reduce motion', value: settings.reducedMotion, set: settings.setReducedMotion },
          { label: 'Compact layout', value: settings.compactMode, set: settings.setCompactMode },
          { label: 'Background blur', value: settings.blurEffects, set: settings.setBlurEffects },
        ].map((item) => (
          <label key={item.label} className={styles.preferenceRow}>
            {item.label}
            <Switch aria-label={item.label} checked={item.value} onCheckedChange={item.set} />
          </label>
        ))}
      </fieldset>
    </div>
  );
}
