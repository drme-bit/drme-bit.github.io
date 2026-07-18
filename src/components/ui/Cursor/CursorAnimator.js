const TRAIL_LENGTH = 5;
const LERP_RING = 0.12;
const LERP_DOT = 0.7;
const TRAIL_LERP = 0.25;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function isInteractive(el) {
  return el.tagName === 'A' || el.tagName === 'BUTTON' || el.closest('a, button, [role="button"], input, textarea, select');
}

/**
 * CursorAnimator — OOP controller for custom cursor animation.
 * Manages mouse tracking, lerp-based ring/dot/trail animation,
 * hover/press detection, and rAF loop.
 */
export default class CursorAnimator {
  constructor() {
    this.mouse = { x: -100, y: -100 };
    this.ring = { x: -100, y: -100 };
    this.dot = { x: -100, y: -100 };
    this.trail = Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 }));
    this.isHovering = false;
    this.isPressed = false;
    this.rafId = null;
    this.ringEl = null;
    this.dotEl = null;
    this.trailEls = [];
    this._listeners = [];
    this._bound = {};
  }

  /** Set DOM element references */
  setElements(ringEl, dotEl, trailEls) {
    this.ringEl = ringEl;
    this.dotEl = dotEl;
    this.trailEls = trailEls;
  }

  /** Attach mouse listeners and start rAF loop */
  start() {
    document.body.classList.add('custom-cursor-active');

    this._bound.onMouseMove = (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; };
    this._bound.onMouseDown = () => { this.isPressed = true; };
    this._bound.onMouseUp = () => { this.isPressed = false; };
    this._bound.onMouseOver = (e) => { if (isInteractive(e.target)) this.isHovering = true; };
    this._bound.onMouseOut = (e) => { if (isInteractive(e.target)) this.isHovering = false; };

    const opts = { passive: true };
    window.addEventListener('mousemove', this._bound.onMouseMove, opts);
    window.addEventListener('mousedown', this._bound.onMouseDown);
    window.addEventListener('mouseup', this._bound.onMouseUp);
    window.addEventListener('mouseover', this._bound.onMouseOver, opts);
    window.addEventListener('mouseout', this._bound.onMouseOut, opts);

    this._startLoop();
  }

  /** Stop rAF loop and remove listeners */
  stop() {
    document.body.classList.remove('custom-cursor-active');
    window.removeEventListener('mousemove', this._bound.onMouseMove);
    window.removeEventListener('mousedown', this._bound.onMouseDown);
    window.removeEventListener('mouseup', this._bound.onMouseUp);
    window.removeEventListener('mouseover', this._bound.onMouseOver);
    window.removeEventListener('mouseout', this._bound.onMouseOut);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  /** Get current hover/press state for React class toggles */
  get state() {
    return {
      isHovering: this.isHovering,
      isPressed: this.isPressed,
    };
  }

  // ── Private ──

  _startLoop() {
    const tick = () => {
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
