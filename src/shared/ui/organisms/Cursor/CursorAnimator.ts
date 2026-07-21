const TRAIL_LENGTH = 5;
const LERP_RING = 0.12;
const LERP_DOT = 0.7;
const TRAIL_LERP = 0.25;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function isInteractive(el: Element | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  return el.tagName === 'A' || el.tagName === 'BUTTON' || !!el.closest('a, button, [role="button"], input, textarea, select');
}

export default class CursorAnimator {
  private mouse = { x: -100, y: -100 };
  private ring = { x: -100, y: -100 };
  private dot = { x: -100, y: -100 };
  private trail = Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }));
  private isHovering = false;
  private isPressed = false;
  private rafId: number | null = null;
  private ringEl: HTMLDivElement | null = null;
  private dotEl: HTMLDivElement | null = null;
  private trailEls: (HTMLDivElement | null)[] = [];
  private _bound: Record<string, EventListener> = {};

  setElements(ringEl: HTMLDivElement | null, dotEl: HTMLDivElement | null, trailEls: (HTMLDivElement | null)[]): void {
    this.ringEl = ringEl;
    this.dotEl = dotEl;
    this.trailEls = trailEls;
  }

  start(): void {
    document.body.classList.add('custom-cursor-active');

    this._bound.onMouseMove = ((e: MouseEvent) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; }) as EventListener;
    this._bound.onMouseDown = () => { this.isPressed = true; };
    this._bound.onMouseUp = () => { this.isPressed = false; };
    this._bound.onMouseOver = ((e: MouseEvent) => { if (isInteractive(e.target as Element)) this.isHovering = true; }) as EventListener;
    this._bound.onMouseOut = ((e: MouseEvent) => { if (isInteractive(e.target as Element)) this.isHovering = false; }) as EventListener;

    const opts: AddEventListenerOptions = { passive: true };
    window.addEventListener('mousemove', this._bound.onMouseMove, opts);
    window.addEventListener('mousedown', this._bound.onMouseDown);
    window.addEventListener('mouseup', this._bound.onMouseUp);
    window.addEventListener('mouseover', this._bound.onMouseOver, opts);
    window.addEventListener('mouseout', this._bound.onMouseOut, opts);

    this._startLoop();
  }

  stop(): void {
    document.body.classList.remove('custom-cursor-active');
    window.removeEventListener('mousemove', this._bound.onMouseMove);
    window.removeEventListener('mousedown', this._bound.onMouseDown);
    window.removeEventListener('mouseup', this._bound.onMouseUp);
    window.removeEventListener('mouseover', this._bound.onMouseOver);
    window.removeEventListener('mouseout', this._bound.onMouseOut);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  get state(): { isHovering: boolean; isPressed: boolean } {
    return { isHovering: this.isHovering, isPressed: this.isPressed };
  }

  private _startLoop(): void {
    const tick = (): void => {
      const mx = this.mouse.x;
      const my = this.mouse.y;

      this.ring.x = lerp(this.ring.x, mx, LERP_RING);
      this.ring.y = lerp(this.ring.y, my, LERP_RING);

      this.dot.x = lerp(this.dot.x, mx, LERP_DOT);
      this.dot.y = lerp(this.dot.y, my, LERP_DOT);

      for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
        this.trail[i].x = lerp(this.trail[i].x, this.trail[i - 1].x, TRAIL_LERP);
        this.trail[i].y = lerp(this.trail[i].y, this.trail[i - 1].y, TRAIL_LERP);
      }
      this.trail[0].x = lerp(this.trail[0].x, mx, TRAIL_LERP);
      this.trail[0].y = lerp(this.trail[0].y, my, TRAIL_LERP);

      if (this.ringEl) {
        this.ringEl.style.transform = `translate(${this.ring.x}px, ${this.ring.y}px) translate(-50%, -50%)`;
      }
      if (this.dotEl) {
        this.dotEl.style.transform = `translate(${this.dot.x}px, ${this.dot.y}px) translate(-50%, -50%)`;
      }
      this.trailEls.forEach((el, i) => {
        if (el) {
          el.style.transform = `translate(${this.trail[i].x}px, ${this.trail[i].y}px) translate(-50%, -50%)`;
        }
      });

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }
}
