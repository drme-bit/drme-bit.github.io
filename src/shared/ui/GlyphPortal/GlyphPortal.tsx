'use client';

/**
 * Glyph Portal © 2026 Christian Katzmann. MIT.
 * Origin: UsefulPortal.astro on https://ktzm.dk → UsefulPortal.tsx → ClarityPortal.tsx.
 * A scroll-driven camera through live type. Keep this notice with copies.
 *
 * Local adaptations (perf only, behavior identical):
 * - pure character index map (react-compiler purity rule);
 * - cached document offset instead of getBoundingClientRect per frame;
 * - paint throttled to ~30fps while scrolling, skipped when idle;
 * - unchanged DOM writes skipped (datasets, clip-path, marks).
 */
import { useId, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export type GlyphPortalStyle = CSSProperties & {
  '--gp-paper'?: string;
  '--gp-ink'?: string;
  '--gp-field'?: string;
  '--gp-foreground'?: string;
};

export type GlyphPortalProps = {
  word?: string;
  /** First matching character. Omit to choose the largest safe patch of ink. */
  focusChar?: string;
  /** Hover, tap, or use arrow keys to choose a letter before scrolling. */
  interactive?: boolean;
  /** Decorative, inert, mounted once. Fill its parent with an image, video, or canvas. */
  background?: ReactNode;
  /** Optional foreground composition for the opening frame, above the clipped scene. */
  front?: ReactNode;
  children?: ReactNode;
  /** Scroll travel in visible container heights, clamped to 1–8. */
  scrollLength?: number;
  fontFamily?: string;
  fontWeight?: number;
  annotations?: boolean;
  enterLabel?: string;
  className?: string;
  style?: GlyphPortalStyle;
  /** Called once per rendered scroll frame, never through React state. */
  onProgress?: (progress: number) => void;
};

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const DEFAULT_FONT = '"Arial Black", "Arial", sans-serif';
type Ink = { x: number; y: number; radius: number; index: number };
type Letter = { index: number; x: number; y: number; width: number; height: number };

/** Largest opaque square, in linear time. Unlike a stem guess, it works in O, S and Ø. */
function interior(context: CanvasRenderingContext2D, char: string, font: string): Omit<Ink, 'index'> | null {
  const canvas = context.canvas;
  context.font = font;
  const m = context.measureText(char);
  const pad = 8;
  const left = Math.ceil(m.actualBoundingBoxLeft);
  const ascent = Math.ceil(m.actualBoundingBoxAscent);
  canvas.width = Math.max(1, Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2);
  canvas.height = Math.max(1, Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2);
  context.font = font;
  context.fontKerning = 'none';
  context.fillText(char, pad + left, pad + ascent);
  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  const rows = new Uint16Array(width + 1);
  let size = 0, bx = 0, by = 0;
  for (let y = 0; y < height; y++) {
    let diagonal = 0;
    for (let x = 0; x < width; x++) {
      const above = rows[x + 1];
      rows[x + 1] = pixels[(y * width + x) * 4 + 3] > 245
        ? Math.min(above, rows[x], diagonal) + 1 : 0;
      diagonal = above;
      if (rows[x + 1] > size) { size = rows[x + 1]; bx = x; by = y; }
    }
  }
  if (size < 3) return null;
  // Scan at 3× SVG size. Inscribe a disk in the square, with room for raster disagreement.
  return { x: (bx + 1 - size / 2 - pad - left) / 3,
    y: (by + 1 - size / 2 - pad - ascent) / 3, radius: (size / 2 - 1) / 3 };
}

function scrollParent(element: HTMLElement): HTMLElement | null {
  for (let p = element.parentElement; p; p = p.parentElement) {
    if (/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowY) && p !== document.body && p !== document.documentElement) return p;
  }
  return null;
}

export default function GlyphPortal({
  word = 'SUBLIME', focusChar, interactive = true, background, front, children, scrollLength = 2.4,
  fontFamily = DEFAULT_FONT, fontWeight = 900, annotations = false,
  enterLabel = 'Enter section', className, style, onProgress,
}: GlyphPortalProps) {
  const uid = `gp-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const clipId = `${uid}-clip`;
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(onProgress);
  useLayoutEffect(() => { progressRef.current = onProgress; }, [onProgress]);
  const text = word.trim().normalize('NFC') || 'SUBLIME';
  const chars = Array.from(text);
  // Code-unit offset of each character (pure — no render-scope mutation).
  const characters = chars.map((char, i) => ({
    char,
    index: chars.slice(0, i).join('').length,
  }));
  const length = Number.isFinite(scrollLength) ? clamp(scrollLength, 1, 8) : 2.4;
  const weight = Number.isFinite(fontWeight) ? clamp(fontWeight, 1, 1000) : 900;
  const hasFront = front != null;
  const q = `:where(#${uid})`;

  useLayoutEffect(() => {
    const section = sectionRef.current!;
    const pin = section.querySelector<HTMLElement>('[data-gp-pin]')!;
    const field = section.querySelector<HTMLElement>('[data-gp-field]')!;
    const art = section.querySelector<SVGSVGElement>('[data-gp-art]')!;
    const clip = section.querySelector<SVGClipPathElement>(`#${clipId}`)!;
    const glyph = section.querySelector<SVGTextElement>('[data-gp-glyph]')!;
    const marks = section.querySelector<SVGGElement>('[data-gp-marks]')!;
    const choices = section.querySelector<HTMLElement>('[data-gp-choices]')!;
    const buttons = Array.from(choices.querySelectorAll<HTMLButtonElement>('button'));
    const picker = section.querySelector<HTMLSelectElement>('[data-gp-select]')!;
    const root = scrollParent(section);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    let disposed = false, raf = 0, dirty = true, active = true, ready = false;
    const mountedAt = performance.now();
    let browserFrameSeen = false, stalled = false, fontsSettled = false;
    let W = 1, H = 1, travel = 1, startScale = 1, endScale = 1;
    // Adaptive flight pacing: static tiers guess from pixels, but the live
    // paint cost decides. Slow frames raise the divisor, fast ones lower it.
    let flightDivisor = 1;
    let frameCount = 0;
    let paintEma = 0;
    let paintSamples = 0;
    let lastAnchorY = -1;
    // CSS var writes invalidate the whole pin subtree per call — quantize.
    const varCache: Record<string, string> = {};
    const setVar = (name: string, value: number | string): void => {
      const v = typeof value === 'number' ? value.toFixed(3) : value;
      if (varCache[name] !== v) {
        varCache[name] = v;
        section.style.setProperty(name, v);
      }
    };    let center = { x: 0, y: 0 }, target: Ink | null = null;
    let lastProgress = -1;
    let lastEntered = false;
    // The stylesheet sets no clip-path, so the field starts unclipped
    // (computed `none`). Claim `true` so the first paint below t=1
    // actually writes the url — with `false` the write is skipped as a
    // "no-change" and the word never appears until a full pass flips it.
    let lastClipNone = true;
    // Cover-freeze flag for the deep-zoom tail (see paint()).
    let lastCovered = false;
    let lastChoosing: boolean | null = null;
    let candidates: Ink[] = [], letters: Letter[] = [];
    let choosing = false;
    let bounds = { x: 0, y: 0, width: 1, height: 1 };
    let fontDirty = true;
    // Document offset of the section. Measured live every painted frame:
    // late images/fonts above shift the document mid-approach, and a stale
    // cache maps scroll into the wrong flight segment (violet canvas from
    // the very first pass). One rect per frame, only while scrolling.
    let sectionTop = 0;
    // Freeze an available face for this mount. Late font swaps move the ink under the camera.
    // Runs now AND again on document.fonts.ready: at mount the webfont is
    // usually still loading, and check() fails for pending faces — without
    // the second pass the portal would stay static forever.
    const freezeFace = (): boolean => {
      glyph.style.fontFamily = fontFamily;
      const computedFamily = getComputedStyle(glyph).fontFamily;
      const families = computedFamily.match(/(?:[^,"']+|"[^"]*"|'[^']*')+/g) ?? [];
      const available = families.filter((family) => {
        try { return document.fonts.check(`${weight} 100px ${family.trim()}`, text); }
        catch { return false; }
      });
      glyph.style.fontFamily = [...available, DEFAULT_FONT].join(',');
      // Any single usable face is enough (synthetic fallback faces like
      // "GeistSans Fallback" legitimately fail check() — they need no
      // download and are already droppable). Only stall when NOTHING works.
      return available.length > 0;
    };
    stalled = !freezeFace();
    // Re-measure late: webfonts, lazy images and layout shifts after mount
    // invalidate the frozen metrics. Without these second passes the flight
    // runs on stale geometry until something else forces a re-layout
    // (the classic "scroll to the end and back to activate it").
    const remeasure = (): void => {
      if (disposed) return;
      if (!freezeFace()) return;
      fontsSettled = true;
      stalled = false;
      fontDirty = true;
      dirty = true;
      schedule();
    };
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(remeasure).catch(() => {});
    }
    window.addEventListener('load', remeasure);
    // Late variable-font loads (Safari often swaps weights after
    // fonts.ready + load): without a last-chance pass the flight stays
    // measured against fallback metrics — or never becomes ready, leaving
    // an empty pin after reload.
    const lateTimer = window.setTimeout(remeasure, 2500);

    const readInk = () => {
      if (!context) return false;
      const font = getComputedStyle(glyph);
      const scanFont = `${font.fontWeight} 300px ${font.fontFamily}`;
      context.font = `${font.fontWeight} 100px ${font.fontFamily}`;
      context.fontKerning = 'none';
      const metrics = context.measureText(text);
      const advances = Array.from({ length: text.length }, (_, i) => context.measureText(text.slice(0, i)).width);
      // SVG getBBox includes the font's line box in some engines. Frame visible ink instead.
      bounds = { x: -metrics.actualBoundingBoxLeft, y: -metrics.actualBoundingBoxAscent,
        width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent };
      if (!bounds.width || !bounds.height) return false;
      center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
      const requested = focusChar ? text.indexOf(focusChar.normalize('NFC')) : -1;
      let offset = 0;
      candidates = []; letters = [];
      for (const char of Array.from(text)) {
        context.font = `${font.fontWeight} 100px ${font.fontFamily}`;
        const m = context.measureText(char);
        letters.push({ index: offset, x: advances[offset] - m.actualBoundingBoxLeft,
          y: -m.actualBoundingBoxAscent, width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
          height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent });
        const found = interior(context, char, scanFont);
        if (found) candidates.push({ ...found, x: found.x + advances[offset], index: offset });
        offset += char.length;
      }
      target = candidates.find((candidate) => candidate.index === requested) ?? [...candidates].sort((a, b) => b.radius - a.radius || Math.abs(a.x - center.x) - Math.abs(b.x - center.x))[0] ?? null;
      return true;
    };

    const select = (next: Ink | null) => {
      target = next;
      // Coverage needs hypot/(r*2) (viewport diagonal inside ink diameter);
      // 1.8 keeps an 11% margin while rasterizing ~45% fewer pixels per frame
      // than 1.35 — the peak zoom on HiDPI fullscreen is what melts WebKit.
      endScale = target ? Math.max(startScale, Math.hypot(W, H) / (target.radius * 1.8)) : startScale;
      section.dataset.gpFocus = target ? Array.from(text.slice(target.index))[0] : '';
      section.dataset.gpFocusIndex = String(target?.index ?? -1);
      for (const button of buttons) {
        const selected = Number(button.dataset.gpLetter) === target?.index;
        button.disabled = !candidates.some((candidate) => candidate.index === Number(button.dataset.gpLetter));
        button.setAttribute('aria-checked', String(selected));
        button.tabIndex = selected ? 0 : -1;
      }
      if (picker.value !== '') picker.value = String(target?.index ?? -1);
      for (const option of Array.from(picker.options)) option.disabled = option.value === '' || !candidates.some((candidate) => candidate.index === Number(option.value));
      const u = 1 / startScale;
      const y = bounds.y + bounds.height + 25 * u;
      const x = bounds.x;
      const right = x + bounds.width;
      const cross = target ? `M${target.x - 9 * u} ${target.y}h${18 * u}M${target.x} ${target.y - 9 * u}v${18 * u}` : '';
      const annotationPath = marks.querySelector('path')!;
      annotationPath.setAttribute('d', `M${x} ${y}H${right}M${x} ${y - 5 * u}v${10 * u}M${right} ${y - 5 * u}v${10 * u}${cross}`);
      annotationPath.setAttribute('stroke-width', String(u));
    };

    const position = () => {
      if (root) {
        const origin = root.getBoundingClientRect().top + root.clientTop;
        return clamp((origin - section.getBoundingClientRect().top) / travel);
      }
      return clamp((window.scrollY - sectionTop) / travel);
    };

    const paint = (progress: number) => {
      const isStatic = motion.matches || !browserFrameSeen || stalled || !target;
      const p = isStatic ? 0 : progress;
      const t = clamp(p / 0.78);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      const scale = Math.exp(Math.log(startScale) + Math.log(endScale / startScale) * eased);
      const blend = endScale === startScale ? 0 : (1 / scale - 1 / startScale) / (1 / endScale - 1 / startScale);
      const cx = center.x + ((target?.x ?? center.x) - center.x) * blend;
      const cy = center.y + ((target?.y ?? center.y) - center.y) * blend;
      const roll = -4 * smooth(0.06, 0.5, t) * (1 - smooth(0.62, 0.92, t));
      const transform = `translate(${W / 2} ${H * 0.46 + H * 0.04 * eased}) scale(${scale}) rotate(${roll}) translate(${-cx} ${-cy})`;
      // Keep scale on the clip to avoid text paint limits. Text-local translation
      // follows page zoom in WebKit; translation on an HTML clip reference does not.
      const radians = roll * Math.PI / 180;
      const dx = W / 2 / scale, dy = (H * .46 + H * .04 * eased) / scale;
      // Past full coverage the field fills the viewport no matter what —
      // freezing the clip/glyph writes kills the most expensive tail frames
      // with pixel-identical output. Resumes on scroll-back automatically.
      const coverScale = target ? Math.hypot(W, H) / (target.radius * 2) : Infinity;
      const covered = scale >= coverScale;
      if (!covered || !lastCovered) {
        clip.setAttribute('transform', `scale(${scale}) rotate(${roll})`);
        glyph.setAttribute('transform', `translate(${Math.cos(radians) * dx + Math.sin(radians) * dy - cx} ${-Math.sin(radians) * dx + Math.cos(radians) * dy - cy})`);
      }
      lastCovered = covered;
      if (annotations) {
        marks.setAttribute('transform', transform);
        marks.style.opacity = String(1 - smooth(0.015, 0.17, p));
      }
      choosing = interactive && !isStatic && p < .04;
      if (choosing !== lastChoosing) {
        lastChoosing = choosing;
        choices.inert = !choosing;
        section.dataset.gpChoosing = String(choosing);
      }
      // Drop the clip only after the camera has already filled the viewport with ink.
      const clipNone = t >= 1;
      if (clipNone !== lastClipNone) {
        lastClipNone = clipNone;
        // -webkit- twin: Safari takes the reliable (and faster) clip path
        // only when the prefixed property is present alongside.
        const value = clipNone ? 'none' : `url(#${clipId})`;
        field.style.clipPath = value;
        (field.style as CSSStyleDeclaration & { webkitClipPath?: string }).webkitClipPath = value;
      }
      setVar('--gp-caption', 1 - smooth(0.01, 0.16, p));
      setVar('--gp-reveal', isStatic ? 1 : smooth(0.78, 0.9, p));
      setVar('--gp-field-scale', 1 + .16 * smooth(0, .82, p));
      setVar('--gp-caption-hit', p < 0.08 ? 'auto' : 'none');
      const entered = p >= 0.9;
      if (entered !== lastEntered) {
        lastEntered = entered;
        section.dataset.gpEntered = String(entered);
      }
      // Attribute writes invalidate matching selectors every frame — only
      // touch the DOM when the quantized value actually changed.
      const quantized = p.toFixed(4);
      if (section.dataset.gpProgress !== quantized) {
        section.dataset.gpProgress = quantized;
        section.dataset.gpDbg =
          `W${W | 0} H${H | 0} bw${bounds.width | 0} ss${startScale.toFixed(2)} ` +
          `es${endScale.toFixed(1)} r${target ? target.radius.toFixed(1) : '-'} ` +
          `st${Math.round(sectionTop)} why${section.dataset.gpWhy ?? ''}`;
      }
      if (progressRef.current && p !== lastProgress) { lastProgress = p; progressRef.current(p); }
    };

    const layout = () => {
      if (!section.clientWidth) return;
      sectionTop = section.getBoundingClientRect().top + window.scrollY;
      W = pin.clientWidth;
      // A 100svh probe keeps browser chrome from continually changing the scroll distance.
      const smallViewport = section.querySelector<HTMLElement>('[data-gp-viewport]')!.offsetHeight;
      const viewportHeight = Math.max(1, Math.min(root?.clientHeight ?? smallViewport, smallViewport));
      H = motion.matches ? Math.min(viewportHeight * 0.75, 480) : viewportHeight;
      section.style.setProperty('--gp-height', `${H}px`);
      travel = H * length;
      // Seed for the adaptive pacer below: fullscreen HiDPI starts
      // conservative, then earns full rate back if paints stay cheap.
      const devicePixels = W * H * (window.devicePixelRatio || 1) ** 2;
      flightDivisor = devicePixels > 12000000 ? 3 : devicePixels > 4500000 ? 2 : 1;
      art.setAttribute('viewBox', `0 0 ${W} ${H}`);
      if (fontDirty) {
        ready = readInk();
        // Safari can measure a not-yet-loaded variable face as garbage
        // (hairline boxes): the word then computes larger than the viewport
        // and the pin reads as solid violet from the very first approach.
        // Fall back to the system black and re-read in the same pass.
        if (ready && (bounds.width < 80 || !target || target.radius < 3)) {
          glyph.style.fontFamily = DEFAULT_FONT;
          ready = readInk();
        }
        fontDirty = false;
      }
      if (!ready) return;
      const wordHeight = hasFront && H < 480 ? Math.min(H * .38, Math.max(24, H - 264)) : H * .38;
      startScale = Math.min(W * 0.84 / bounds.width, wordHeight / bounds.height);
      // The whole viewport fits inside measured ink, even with the small camera bank.
      select(target);
      for (const button of buttons) {
        const letter = letters.find((item) => item.index === Number(button.dataset.gpLetter))!;
        Object.assign(button.style, {
          left: `${W / 2 + (letter.x - center.x) * startScale}px`,
          top: `${H * .46 + (letter.y - center.y) * startScale - Math.max(0, 44 - letter.height * startScale) / 2}px`,
          width: `${Math.max(1, letter.width * startScale)}px`,
          height: `${Math.max(44, letter.height * startScale)}px`,
        });
      }
      section.style.setProperty('--gp-word-top', `${H * .46 - bounds.height * startScale / 2}px`);
      section.style.setProperty('--gp-word-bottom', `${H * .46 + bounds.height * startScale / 2}px`);
      section.dataset.gpReady = 'true';
      section.dataset.gpMotion = !motion.matches && browserFrameSeen && !stalled && target ? 'on' : 'off';
      section.dataset.gpWhy = [
        motion.matches ? 'reduced-motion' : '',
        !browserFrameSeen ? 'no-frame-yet' : '',
        !fontsSettled ? 'fonts-pending' : '',
        stalled ? 'stalled' : '',
        !target ? 'no-target' : '',
      ].filter(Boolean).join(',') || 'ok';
    };

    const frame = (time?: number) => {
      raf = 0;
      if (disposed) return;
      if (time !== undefined && !browserFrameSeen) {
        // Slow first frame on a heavy load must not strand the portal in
        // static mode — only stall while the fonts themselves are unsettled.
        browserFrameSeen = true;
        stalled ||= !fontsSettled && performance.now() - mountedAt > 6000;
        dirty = true;
      }
      const laidOut = dirty;
      if (dirty) { dirty = false; layout(); }
      // Live anchor, quantized: late images/fonts above shift the document
      // mid-approach, so a cached offset maps scroll into the wrong flight
      // segment — but a rect forces layout, so only re-measure past 24px
      // of travel (≤1.5% progress error, invisible).
      if (!root) {
        const y = window.scrollY;
        if (laidOut || Math.abs(y - lastAnchorY) > 24) {
          sectionTop = section.getBoundingClientRect().top + y;
          lastAnchorY = y;
        }
      }
      frameCount += 1;
      const shouldPaint = laidOut || frameCount % flightDivisor === 0;
      if (ready && shouldPaint) {
        const t0 = performance.now();
        paint(position());
        const cost = performance.now() - t0;
        paintEma = paintEma === 0 ? cost : paintEma * 0.9 + cost * 0.1;
        // Re-tier every ~30 painted frames with hysteresis: cheap frames
        // earn full rate back (no stepping on fast machines), slow ones
        // back off before the whole page judders.
        if (++paintSamples % 30 === 0) {
          flightDivisor = paintEma > 14 ? 3 : paintEma > 9 ? 2 : 1;
        }
      }
    };
    const schedule = () => { if (!raf && active) raf = requestAnimationFrame(frame); };
    const resize = () => { cancelAnimationFrame(raf); dirty = true; frame(); };
    // Skip frames when nothing moved: same scroll offset reproduces
    // the identical frame, so don't burn main-thread time on it.
    // (No time-based throttle: the original paints every scroll event,
    // and throttling is exactly what made ours feel steppier.)
    let lastScrollY = -1;
    const scroll = () => {
      const y = root ? root.getBoundingClientRect().top : window.scrollY;
      if (y === lastScrollY && !dirty) return;
      lastScrollY = y;
      // rAF starvation fallback (throttled background tabs, odd embeds):
      // if no rAF frame has ever been delivered, paint synchronously.
      if (!browserFrameSeen && performance.now() - mountedAt > 3000) {
        frame();
        return;
      }
      schedule();
    };
    const choose = (event: Event) => {
      if (!choosing || position() >= .04) return;
      const button = (event.target as Element).closest<HTMLButtonElement>('[data-gp-letter]');
      const next = candidates.find((candidate) => candidate.index === Number(button?.dataset.gpLetter));
      if (!next || next === target) return;
      select(next); paint(position());
    };
    const navigate = (event: KeyboardEvent) => {
      if (!choosing || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = candidates.indexOf(target!);
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? candidates.length - 1
        : (current + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + candidates.length) % candidates.length;
      buttons.find((button) => Number(button.dataset.gpLetter) === candidates[index].index)?.focus({ preventScroll: true });
    };
    const pick = () => {
      if (!choosing || position() >= .04) return;
      const next = candidates.find((candidate) => candidate.index === Number(picker.value));
      if (next) { select(next); paint(position()); }
    };
    choices.addEventListener('pointerover', choose);
    choices.addEventListener('click', choose);
    choices.addEventListener('focusin', choose);
    choices.addEventListener('keydown', navigate);
    picker.addEventListener('change', pick);
    const observer = new ResizeObserver(resize);
    observer.observe(section);
    if (root) observer.observe(root);
    const visibility = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      if (active) { dirty = true; schedule(); }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { root, rootMargin: '100% 0px' });
    visibility.observe(section);
    (root ?? window).addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    motion.addEventListener('change', resize);
    frame();
    // WebKit can withhold frames, timers and scroll events behind an initial hung font.
    // Begin in reading flow. Enable motion only when the browser starts rendering promptly.
    schedule();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(lateTimer);
      observer.disconnect();
      visibility.disconnect();
      (root ?? window).removeEventListener('scroll', scroll);
      window.removeEventListener('load', remeasure);
      window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
      motion.removeEventListener('change', resize);
      choices.removeEventListener('pointerover', choose);
      choices.removeEventListener('click', choose);
      choices.removeEventListener('focusin', choose);
      choices.removeEventListener('keydown', navigate);
      picker.removeEventListener('change', pick);
    };
  }, [text, focusChar, interactive, fontFamily, weight, length, clipId, hasFront, annotations]);

  return (
    <section
      ref={sectionRef}
      id={uid}
      className={className}
      aria-label={text}
      style={
        {
          '--gp-length': length,
          '--gp-characters': Array.from(text).length,
          ...style,
        } as CSSProperties
      }
    >
      <style>{`
        ${q} [data-gp-field]{position:absolute;inset:0;background:var(--gp-field);opacity:0;pointer-events:none;will-change:clip-path;transform:translateZ(0);}
        ${q}{--gp-paper:#fff;--gp-ink:#0c1212;--gp-field:#0b3b2a;--gp-foreground:#fbfbfa;position:relative;isolation:isolate;background:var(--gp-paper);color:var(--gp-ink);font-family:Arial,sans-serif;}
        ${q}>[data-gp-viewport]{position:absolute;inset:0 auto auto 0;height:100vh;height:100svh;width:0;pointer-events:none;visibility:hidden;}
        ${q} [data-gp-pin]{position:relative;height:var(--gp-height,100svh);overflow:clip;isolation:isolate;container-type:size;}
        ${q} [data-gp-field]{position:absolute;inset:0;background:var(--gp-field);opacity:0;pointer-events:none;}
        ${q}[data-gp-ready] [data-gp-field]{opacity:1;}
        ${q} [data-gp-art]{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;}
        ${q} [data-gp-marks]{fill:none;stroke:var(--gp-ink);opacity:.6;}
        ${q} [data-gp-choices]{position:absolute;inset:0;visibility:hidden;pointer-events:none;}
        ${q}[data-gp-choosing=true] [data-gp-choices]{visibility:visible;}
        ${q} [data-gp-letter]{box-sizing:border-box;position:absolute;border:0;padding:0;margin:0;background:transparent;cursor:pointer;pointer-events:auto;touch-action:pan-y;}
        ${q} [data-gp-letter]:disabled{pointer-events:none;}
        ${q} [data-gp-letter]:focus-visible{outline:2px solid var(--gp-field);outline-offset:5px;}
        ${q} [data-gp-touch-picker]{display:none;position:absolute;top:calc(var(--gp-word-bottom,50%) + 42px);left:50%;transform:translateX(-50%);font:12px/1.4 Arial,sans-serif;align-items:center;gap:12px;visibility:hidden;}
        ${q}[data-gp-choosing=true] [data-gp-touch-picker]{visibility:visible;}
        ${q} [data-gp-select]{min-height:44px;min-width:90px;border:1px solid #d8deda;border-radius:4px;background:var(--gp-paper);color:var(--gp-ink);padding:0 10px;font:inherit;}
        ${q} [data-gp-select]:focus-visible{outline:2px solid var(--gp-field);outline-offset:4px;}
        @media(any-pointer:coarse){${q} [data-gp-touch-picker]{display:flex;}}
        ${q} [data-gp-fallback]{position:absolute;inset:0;display:none;place-items:center;font-size:min(calc(100cqw / var(--gp-characters)),38cqh);line-height:1;color:var(--gp-field);}
        ${q}[data-gp-ready] [data-gp-fallback]{visibility:hidden;}
        ${q} [data-gp-caption]{position:absolute;inset:auto 8% 9%;display:flex;align-items:center;justify-content:space-between;gap:1rem;font:12px/1.4 Arial,sans-serif;opacity:var(--gp-caption,1);pointer-events:var(--gp-caption-hit,auto);}
        ${q} [data-gp-caption]{font-family:inherit;}
        ${q} [data-gp-front]{position:absolute;inset:0;opacity:var(--gp-caption,1);pointer-events:none;}
        ${q} [data-gp-front] a,${q} [data-gp-front] button{pointer-events:var(--gp-caption-hit,auto);}
        ${q} [data-gp-front]:focus-within{opacity:1;}
        ${q} [data-gp-hint]{max-width:30ch;color:var(--gp-ink);}
        ${q} [data-gp-enter]{display:inline-flex;align-items:center;gap:16px;min-height:44px;color:inherit;font:inherit;text-decoration:none;letter-spacing:inherit;}
        ${q} [data-gp-enter]:focus-visible{outline:2px solid currentColor;outline-offset:5px;}
        ${q} [data-gp-caption]:focus-within{opacity:1;pointer-events:auto;}
        ${q} [data-gp-enter]:focus-visible{background:var(--gp-paper);color:var(--gp-ink);padding:0 12px;margin:0 -12px;}
        ${q} [data-gp-content]{box-sizing:border-box;position:relative;min-height:var(--gp-height,100svh);padding:clamp(32px,7%,100px);display:grid;align-content:center;color:var(--gp-foreground);background:var(--gp-field);overflow-wrap:anywhere;}
        ${q}[data-gp-motion=on] [data-gp-pin]{position:sticky;top:0;}
        ${q}[data-gp-motion=off] [data-gp-hint]{display:none;}
        ${q}[data-gp-motion=on] [data-gp-content]{margin-top:calc((var(--gp-length) - 1) * var(--gp-height));background:transparent;opacity:var(--gp-reveal,0);pointer-events:none;}
        ${q}[data-gp-motion=on][data-gp-entered=true] [data-gp-content]{pointer-events:auto;}
        ${q}[data-gp-motion=on]:has([data-gp-content]:focus-within) [data-gp-field]{clip-path:none!important;}
        ${q}[data-gp-motion=on] [data-gp-content]:focus-within{opacity:1;pointer-events:auto;}
        ${q}:has([data-gp-content]:focus-within) [data-gp-caption],${q}:has([data-gp-content]:focus-within) [data-gp-marks]{opacity:0;}
        ${q} [data-gp-default-title]{color:inherit;font:400 clamp(32px,5vw,72px)/1.05 Georgia,serif;letter-spacing:-.035em;max-width:13ch;margin:0 0 24px;text-wrap:balance;}
        ${q} [data-gp-default-copy]{color:inherit;font:16px/1.6 Arial,sans-serif;max-width:36ch;margin:0;}
        @media(prefers-reduced-motion:reduce){${q} [data-gp-pin]{position:relative!important;} ${q} [data-gp-content]{margin-top:0!important;opacity:1!important;background:var(--gp-field)!important;min-height:0;padding-block:64px;} ${q} [data-gp-caption]{opacity:1!important;}}
        @media(prefers-reduced-motion:reduce){${q} [data-gp-hint]{display:none;}}
      `}</style>
      {/* JS reveals only measured geometry. The unmeasured poster is reserved for no-JS. */}
      <noscript>
        <style>{`${q} [data-gp-fallback]{display:grid}${q} [data-gp-hint]{display:none}`}</style>
      </noscript>
      <div data-gp-viewport aria-hidden="true" />
      <div data-gp-pin>
        <div data-gp-field aria-hidden="true" inert>
          {background ?? (
            <div
              data-gp-default-field
              style={{
                position: 'absolute',
                inset: 0,
                transform: 'scale(var(--gp-field-scale,1))',
                background:
                  'radial-gradient(circle at 18% 8%, rgba(68,125,98,.72), transparent 34%), radial-gradient(circle at 82% 20%, rgba(251,251,250,.12), transparent 28%), radial-gradient(circle at 48% 78%, rgba(9,48,35,.5), transparent 44%), linear-gradient(135deg,#0b3b2a 0%,#14573f 48%,#082d22 100%)',
              }}
            />
          )}
        </div>
        <svg data-gp-art aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <text
                data-gp-glyph
                x="0"
                y="0"
                style={{
                  fontFamily,
                  fontWeight: weight,
                  fontSize: 100,
                  fontKerning: 'none',
                  fontVariantLigatures: 'none',
                  letterSpacing: 0,
                  textRendering: 'optimizeSpeed',
                }}
              >
                {text}
              </text>
            </clipPath>
          </defs>
          <g data-gp-marks style={{ visibility: annotations ? 'visible' : 'hidden' }}>
            <path />
          </g>
        </svg>
        <div
          data-gp-choices
          role="radiogroup"
          aria-label="Choose the letter to enter through"
          inert
        >
          {characters.map(({ char, index }, i) => (
            <button
              type="button"
              role="radio"
              aria-checked="false"
              tabIndex={-1}
              data-gp-letter={index}
              key={index}
              aria-label={`${char}, letter ${i + 1} of ${characters.length}`}
            />
          ))}
        </div>
        <label data-gp-touch-picker>
          <span
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              overflow: 'hidden',
              clipPath: 'inset(50%)',
            }}
          >
            Entry letter
          </span>
          <select data-gp-select defaultValue="">
            <option value="" disabled>
              Choose a letter
            </option>
            {characters.map(({ char, index }, i) => (
              <option key={index} value={index}>
                {i + 1} · {char}
              </option>
            ))}
          </select>
        </label>
        {front && <div data-gp-front>{front}</div>}
        <span data-gp-fallback aria-hidden="true" style={{ fontFamily, fontWeight: weight }}>
          {text}
        </span>
        <div data-gp-caption>
          <span data-gp-hint aria-hidden="true">
            {interactive ? 'Scroll to enter.' : annotations ? 'A passage through type' : ''}
          </span>
          <a data-gp-enter href={`#${uid}-content`}>
            {enterLabel}
            <span aria-hidden="true">↘</span>
          </a>
        </div>
      </div>
      <div data-gp-content id={`${uid}-content`} tabIndex={-1}>
        {children ?? (
          <div>
            <h2 data-gp-default-title>A letter becomes a place.</h2>
            <p data-gp-default-copy>The shape opens onto whatever comes next.</p>
          </div>
        )}
      </div>
    </section>
  );
}
