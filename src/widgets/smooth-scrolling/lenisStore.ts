import type Lenis from 'lenis';

/*  Lenis singleton for imperative scrolling outside React (navbar, page
    configs, footer). Set once by <SmoothScrolling>, read anywhere —
    components outside the ReactLenis subtree (e.g. Navbar) can't use
    useLenis, so they come here. Falls back to native smooth scroll.  */

let lenis: Lenis | null = null;
let scrollLocks = 0;

export function setLenis(instance: Lenis | null): void {
  lenis = instance;
  if (lenis && scrollLocks > 0) lenis.stop();
}

function resolveTarget(target: string | number | HTMLElement): string | number | HTMLElement | null {
  if (typeof target !== 'string') return target;
  // Lenis throws on missing selectors — guard first.
  const byId = target.startsWith('#') ? document.getElementById(target.slice(1)) : null;
  if (byId) return byId;
  return document.querySelector(target) ? target : null;
}

export function scrollToTarget(target: string | number | HTMLElement, offset = 0): void {
  if (typeof window === 'undefined') return;
  const resolved = resolveTarget(target);
  if (!resolved) return;
  if (lenis) {
    lenis.scrollTo(resolved, { offset, duration: 1.4 });
    return;
  }
  if (typeof resolved === 'number') {
    window.scrollTo({ top: resolved + offset, behavior: 'smooth' });
    return;
  }
  // A leftover string means the selector vanished between guard and scroll.
  if (typeof resolved === 'string') return;
  resolved.scrollIntoView({ behavior: 'smooth' });
}

export function scrollToTop(): void {
  if (typeof window === 'undefined') return;
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.2 });
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Freeze page scrolling while a mobile sheet is open. Reference-counted so
    closing the menu cannot accidentally re-enable scrolling behind the panel. */
export function setScrollLocked(locked: boolean): void {
  if (locked) {
    scrollLocks += 1;
    if (scrollLocks === 1) lenis?.stop();
    return;
  }
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) lenis?.start();
}
