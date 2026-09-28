'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTheme, THEMES, type ThemeId, type FontSize } from '@/app/providers/ThemeProvider';
import { SettingsGear, Check } from '@/shared/ui/Icon';
import { cn } from '@/shared/lib/cn';
import {
  IconButton,
  Kbd,
  Chip,
  PanelSurface,
  PanelLabel,
  Switch,
  Segmented,
  Separator,
} from '@/shared/ui';

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
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const activeTheme = THEMES.find((t) => t.id === theme);

  return (
    <div className="relative" ref={ref}>
      <IconButton
        size="icon-sm"
        aria-label="Open settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'text-muted-foreground hover:bg-secondary hover:text-foreground',
          open && 'bg-secondary text-foreground',
        )}
        onClick={() => setOpen((o) => !o)}
      >
        <SettingsGear className="size-4" />
      </IconButton>

      {open && (
        <motion.div
          role="dialog"
          aria-label="Settings"
          className="absolute top-full right-0 z-[1005] mt-2 w-[288px]"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        >
          <PanelSurface className="p-2">
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
              <PanelLabel>settings</PanelLabel>
              {activeTheme && <Chip tone="accent">{activeTheme.label}</Chip>}
            </div>

            <div className="flex flex-col gap-3">
              {/* Theme */}
              <div className="flex flex-col gap-1.5">
                <PanelLabel className="px-1">theme</PanelLabel>
                <div className="overflow-hidden rounded-[var(--radius-sm)] border border-border">
                  {THEMES.map((t, i) => {
                    const isActive = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setTheme(t.id as ThemeId)}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2.5 bg-transparent px-2.5 py-2 text-left transition-colors outline-none hover:bg-secondary/60 focus-visible:bg-secondary',
                          i > 0 && 'border-t border-border',
                        )}
                      >
                        <span
                          className="size-4 shrink-0 rounded-full border border-border/60"
                          style={{ background: t.color }}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            'min-w-0 flex-1 truncate font-mono text-[12px] lowercase',
                            isActive ? 'text-foreground' : 'text-muted-foreground',
                          )}
                        >
                          {t.label}
                        </span>
                        {isActive && <Check className="size-3.5 shrink-0 text-foreground" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
              <PanelLabel className="px-1">font size</PanelLabel>
              <Segmented<FontSize>
                value={fontSize}
                onChange={setFontSize}
                options={['sm', 'md', 'lg'] as const}
              />
            </div>

            <Separator className="my-0.5" />

            {/* Preferences */}
            <div className="flex flex-col gap-1.5">
              <PanelLabel className="px-1">preferences</PanelLabel>
                <div className="overflow-hidden rounded-[var(--radius-sm)] border border-border">
                  {[
                    { label: 'reduced motion', value: reducedMotion, set: setReducedMotion },
                    { label: 'compact mode', value: compactMode, set: setCompactMode },
                    { label: 'blur effects', value: blurEffects, set: setBlurEffects },
                  ].map((row, i) => (
                    <label
                      key={row.label}
                      className={cn(
                        'flex cursor-pointer items-center justify-between gap-2 bg-transparent px-2.5 py-2 transition-colors hover:bg-secondary/60',
                        i > 0 && 'border-t border-border',
                      )}
                    >
                      <span className="text-[13px] text-muted-foreground">{row.label}</span>
                      <Switch checked={row.value} onCheckedChange={row.set} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center border-t border-border px-2 pt-2 pb-1">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                  <Kbd>esc</Kbd>
                  close
                </span>
              </div>
            </div>
          </PanelSurface>
        </motion.div>
      )}
    </div>
  );
}