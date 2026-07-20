export default class CarouselScroller {
  private track: HTMLDivElement;
  private duration: number;
  private startTs = 0;
  private paused = false;
  private pausedAt = 0;
  private totalElapsed = 0;
  private rafId: number | null = null;
  private trackHeight = 0;
  private firstSetHeight = 0;

  constructor(track: HTMLDivElement, duration: number) {
    this.track = track;
    this.duration = duration;
  }

  start(): void {
    this.trackHeight = this.track.scrollHeight;
    const sets = this.track.children.length;
    this.firstSetHeight = this.trackHeight / sets;
    this.startTs = performance.now();
    this._tick();
  }

  stop(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  pause(): void {
    this.paused = true;
    this.pausedAt = performance.now();
  }

  resume(): void {
    if (!this.paused) return;
    const pauseDuration = performance.now() - this.pausedAt;
    this.startTs += pauseDuration;
    this.paused = false;
  }

  private _tick = (): void => {
    if (this.paused) {
      this.rafId = requestAnimationFrame(this._tick);
      return;
    }

    const elapsed = (performance.now() - this.startTs) / 1000;
    const progress = (elapsed % this.duration) / this.duration;
    const translateY = -progress * this.firstSetHeight;

    this.track.style.transform = `translateY(${translateY}px)`;

    this.rafId = requestAnimationFrame(this._tick);
  };
}
