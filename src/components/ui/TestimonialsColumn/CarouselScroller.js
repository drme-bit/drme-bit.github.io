/**
 * CarouselScroller — OOP controller for infinite vertical carousel scroll.
 * Manages rAF loop, speed interpolation, ResizeObserver, and pause/resume.
 */
export default class CarouselScroller {
  constructor(trackEl, duration = 10) {
    this.track = trackEl;
    this.duration = duration;
    this.pos = 0;
    this.speed = 1;
    this.targetSpeed = 1;
    this.setHeight = 0;
    this.rafId = null;
    this.ro = null;
    this._prev = 0;
    this._started = false;
  }

  /** Start the rAF loop and measure */
  start() {
    if (this._started || !this.track || !this.track.parentElement) return;
    this._started = true;

    this._measure();
    this.ro = new ResizeObserver(() => this._measure());
    this.ro.observe(this.track);

    this._prev = performance.now();
    this._tick(this._prev);
  }

  /** Stop rAF and disconnect ResizeObserver */
  stop() {
    this._started = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.ro?.disconnect();
    this.ro = null;
  }

  /** Pause scrolling (hover) */
  pause() {
    this.targetSpeed = 0.3;
  }

  /** Resume scrolling (leave hover) */
  resume() {
    this.targetSpeed = 1;
  }

  /** Update duration (if testimonials change) */
  setDuration(d) {
    this.duration = d;
  }

  // ── Private ──

  _measure() {
    const children = this.track?.children;
    if (!children?.length) return;
    const gap = parseFloat(getComputedStyle(this.track).gap) || 0;
    this.setHeight = children[0].offsetHeight + gap;
  }

  _tick = (now) => {
    const dt = (now - this._prev) / 1000;
    this._prev = now;

    this.speed += (this.targetSpeed - this.speed) * Math.min(dt * 4, 1);

    const pxPerSec = (this.setHeight / this.duration) * this.speed;
    this.pos += pxPerSec * dt;

    if (this.setHeight > 0 && this.pos >= this.setHeight) {
      this.pos -= this.setHeight;
    }

    if (this.track) {
      this.track.style.transform = `translate3d(0,${-this.pos}px,0)`;
    }

    this.rafId = requestAnimationFrame(this._tick);
  };
}
