'use client';

import { useEffect, useRef } from 'react';

/* Silver-fern inspired ASCII backdrop: faint mono glyphs on canvas,
   rendered once + slow drift. Decorative, pointer-transparent. */

const GLYPHS = ['.', ':', '*', '+', '×', '%', '·', '—', '/', '\\', '|'];

export function AsciiFern({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cell = 14;
    let w = 0;
    let h = 0;
    let raf = 0;
    let offset = 0;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const isLight = document.body.classList.contains('light');
      ctx.font = `10px var(--font-geist-mono, monospace)`;
      ctx.fillStyle = isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.07)';

      const cols = Math.ceil(w / cell);
      const rows = Math.ceil(h / cell);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Fern fronds: density falls off from a diagonal spine
          const spine = Math.abs(x - y * 1.6 - offset * 0.02) / cols;
          const edge = (x / cols) * 0.5 + (y / rows) * 0.3;
          const hash = Math.abs(Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1;
          if (hash < 0.12 + spine * 0.25 - edge * 0.12) {
            const g = GLYPHS[Math.floor(hash * GLYPHS.length * 3) % GLYPHS.length];
            ctx.fillText(g, x * cell, y * cell);
          }
        }
      }
    };
    draw();

    let stopLoop: (() => void) | null = null;
    if (!reduced) {
      let running = false;
      const tick = () => {
        if (!running) return;
        offset += 1;
        if (offset % 12 === 0) draw();
        raf = requestAnimationFrame(tick);
      };
      const start = () => {
        if (running) return;
        running = true;
        raf = requestAnimationFrame(tick);
      };
      const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
      };
      if (typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) start();
          else stop();
        });
        io.observe(parent);
        stopLoop = () => io.disconnect();
      } else {
        start();
      }
    }

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(parent);
    return () => {
      cancelAnimationFrame(raf);
      stopLoop?.();
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`opacity-70 pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
