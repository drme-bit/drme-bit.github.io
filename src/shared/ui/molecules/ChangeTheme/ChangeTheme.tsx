'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTheme, THEMES, type ThemeId, type FontSize } from '@/app/providers/ThemeProvider';
import { FiSettings, FiCheck } from '@/shared/ui/atoms/Icon';
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
} from '@/shared/ui/atoms';

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
        <FiSettings className="size-4" />
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
                <div className="grid grid-cols-3 gap-1.5">
                  {THEMES.map((t) => {
                    const isActive = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        title={t.label}
                        aria-pressed={isActive}
                        onClick={() => setTheme(t.id as ThemeId)}
                        className={cn(
                          'relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-border-hover',
                          isActive
                            ? 'border-accent/60 bg-accent/10 ring-1 ring-accent/20'
                            : 'border-border bg-secondary/50',
                        )}
                      >
                        <span
                          className="size-4 rounded-full border border-border/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                          style={{ background: t.color }}
                        />
                        <span
                          className={cn(
                            'max-w-full truncate font-mono text-[10px] lowercase',
                            isActive ? 'text-foreground' : 'text-muted-foreground/70',
                          )}
                        >
                          {t.label}
                        </span>
                        {isActive && (
                          <span className="absolute top-1.5 right-1.5 text-accent">
                            <FiCheck className="size-3" />
                          </span>
                        )}
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
                <div className="flex flex-col">
                  <label className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-secondary/60">
                    <span className="text-[13px] text-muted-foreground">reduced motion</span>
                    <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-secondary/60">
                    <span className="text-[13px] text-muted-foreground">compact mode</span>
                    <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                  </label>
                  <label className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-secondary/60">
                    <span className="text-[13px] text-muted-foreground">blur effects</span>
                    <Switch checked={blurEffects} onCheckedChange={setBlurEffects} />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border px-2 pt-2 pb-1">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                  <Kbd>esc</Kbd>
                  close
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/50">drme/ui</span>
              </div>
            </div>
          </PanelSurface>
        </motion.div>
      )}
    </div>
  );
}