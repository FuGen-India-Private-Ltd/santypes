// Santypes 3-2-1 Countdown Overlay Component

export class CountdownOverlay {
  private container: HTMLElement;
  private overlayEl: HTMLElement | null = null;
  private numberEl: HTMLElement | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private active: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    const existing = this.container.querySelector('#countdown-overlay');
    if (existing) existing.remove();

    this.overlayEl = document.createElement('div');
    this.overlayEl.id = 'countdown-overlay';
    this.overlayEl.className = 'countdown-overlay';

    this.numberEl = document.createElement('div');
    this.numberEl.className = 'countdown-number';
    this.numberEl.textContent = '3';

    this.overlayEl.appendChild(this.numberEl);
    this.container.appendChild(this.overlayEl);
  }

  public run(onComplete: () => void): void {
    if (this.active || !this.overlayEl || !this.numberEl) return;
    this.active = true;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    let count = 3;
    this.overlayEl.classList.add('visible');
    this.numberEl.textContent = String(count);
    this.animateNumber();

    this.timer = setInterval(() => {
      if (!this.active || !this.container.isConnected) {
        this.cancel();
        return;
      }
      count--;
      if (count <= 0) {
        if (this.timer !== null) {
          clearInterval(this.timer);
          this.timer = null;
        }
        this.active = false;
        this.overlayEl?.classList.remove('visible');
        onComplete();
        return;
      }
      if (this.numberEl) {
        this.numberEl.textContent = String(count);
        this.animateNumber();
      }
    }, 750);
  }

  private animateNumber(): void {
    if (!this.numberEl) return;
    this.numberEl.style.animation = 'none';
    void this.numberEl.offsetWidth; // Force reflow
    this.numberEl.style.animation = 'countPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }

  public cancel(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.active = false;
    this.overlayEl?.classList.remove('visible');
  }
}
