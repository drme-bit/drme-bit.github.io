interface SoundConfig {
  freq: number;
  type: OscillatorType;
  duration: number;
  volume: number;
  sweep?: boolean;
}

const SOUNDS: Record<string, SoundConfig> = {
  click: { freq: 800, type: 'sine', duration: 0.05, volume: 0.012 },
  hover: { freq: 1200, type: 'sine', duration: 0.03, volume: 0.006 },
  type: { freq: 600, type: 'square', duration: 0.02, volume: 0.008 },
  scroll: { freq: 1000, type: 'sine', duration: 0.01, volume: 0.004 },
  section: { freq: 400, type: 'sine', duration: 0.15, volume: 0.01, sweep: true },
};

function isInteractive(el: Element | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  return el.tagName === 'A' || el.tagName === 'BUTTON' || !!el.closest('a, button, [role="button"]');
}

export default class SoundManager {
  private ctx: AudioContext | null = null;
  private lastScrollTick = 0;
  private reducedMotion = false;
  private _bound: Record<string, EventListener> = {};
  private _attached = false;

  setReducedMotion(value: boolean): void {
    this.reducedMotion = value;
  }

  private _getCtx(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      return this.ctx;
    } catch {
      return null;
    }
  }

  play(name: string): void {
    if (this.reducedMotion) return;
    const ctx = this._getCtx();
    if (!ctx) return;

    const sound = SOUNDS[name];
    if (!sound) return;

    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = sound.type;
    o.frequency.value = sound.freq;
    g.gain.value = sound.volume;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + sound.duration);

    if (sound.sweep) {
      o.frequency.exponentialRampToValueAtTime(sound.freq * 1.5, ctx.currentTime + sound.duration);
    }

    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + sound.duration);
  }

  attach(): void {
    if (this._attached) return;
    this._attached = true;

    this._bound.onPointerUp = ((e: Event) => { if (isInteractive((e as PointerEvent).target as Element)) this.play('click'); }) as EventListener;
    this._bound.onPointerOver = ((e: Event) => { if (isInteractive((e as PointerEvent).target as Element)) this.play('hover'); }) as EventListener;
    this._bound.onKeyDown = ((e: KeyboardEvent) => {
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') this.play('type');
    }) as EventListener;
    this._bound.onScroll = () => {
      const now = Date.now();
      if (now - this.lastScrollTick > 100) {
        this.play('scroll');
        this.lastScrollTick = now;
      }
    };

    window.addEventListener('pointerup', this._bound.onPointerUp, { passive: true });
    window.addEventListener('pointerover', this._bound.onPointerOver, { passive: true });
    window.addEventListener('keydown', this._bound.onKeyDown);
    window.addEventListener('scroll', this._bound.onScroll, { passive: true });
  }

  detach(): void {
    if (!this._attached) return;
    this._attached = false;
    window.removeEventListener('pointerup', this._bound.onPointerUp);
    window.removeEventListener('pointerover', this._bound.onPointerOver);
    window.removeEventListener('keydown', this._bound.onKeyDown);
    window.removeEventListener('scroll', this._bound.onScroll);
    this.ctx?.close();
    this.ctx = null;
  }
}
