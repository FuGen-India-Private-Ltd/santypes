// Santypes Pomodoro Bar Component (Hidden until summoned via Ctrl+Shift+P or toggle)

export class PomodoroTimer {
  private container: HTMLElement;
  private active: boolean = false;
  private phase: 'work' | 'break' = 'work';
  private remainingSeconds: number = 25 * 60;
  private sessionsCompleted: number = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private isVisible: boolean = false;

  private onStateChange?: (active: boolean) => void;

  constructor(container: HTMLElement, onStateChange?: (active: boolean) => void) {
    this.container = container;
    this.onStateChange = onStateChange;
    this.render();
  }

  private render(): void {
    this.container.className = 'pomodoro-bar';
    this.container.style.display = 'none';

    this.container.innerHTML = `
      <div class="pomo-ring" id="pomo-ring">25:00</div>
      <div class="pomo-info">
        <strong id="pomo-phase-title">Focus Session</strong>
        <span id="pomo-session-sub">Session 1 of 4 · 0m completed</span>
      </div>
      <div class="pomo-actions">
        <button class="pomo-btn" id="pomo-toggle-btn">Start</button>
        <button class="pomo-btn" id="pomo-reset-btn">Reset</button>
      </div>
    `;

    const toggleBtn = this.container.querySelector('#pomo-toggle-btn') as HTMLButtonElement;
    const resetBtn = this.container.querySelector('#pomo-reset-btn') as HTMLButtonElement;

    toggleBtn?.addEventListener('click', () => this.toggleRun());
    resetBtn?.addEventListener('click', () => this.reset());
  }

  public toggleVisibility(): boolean {
    this.isVisible = !this.isVisible;
    this.container.style.display = this.isVisible ? 'flex' : 'none';
    if (this.onStateChange) this.onStateChange(this.isVisible);
    return this.isVisible;
  }

  public getIsVisible(): boolean {
    return this.isVisible;
  }

  public toggleRun(): void {
    if (this.active) {
      this.pause();
    } else {
      this.start();
    }
  }

  public start(): void {
    if (this.active) return;
    this.active = true;
    this.timer = setInterval(() => {
      if (!this.active || !this.container.isConnected) {
        this.pause();
        return;
      }
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.handlePhaseEnd();
      }
      this.updateUI();
    }, 1000);
    this.updateUI();
  }

  public pause(): void {
    if (!this.active) return;
    this.active = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.updateUI();
  }

  public reset(): void {
    this.pause();
    this.phase = 'work';
    this.remainingSeconds = 25 * 60;
    this.sessionsCompleted = 0;
    this.updateUI();
  }

  private handlePhaseEnd(): void {
    this.pause();
    if (this.phase === 'work') {
      this.sessionsCompleted++;
      this.phase = 'break';
      this.remainingSeconds = 5 * 60;
    } else {
      this.phase = 'work';
      this.remainingSeconds = 25 * 60;
    }
    this.updateUI();
  }

  private updateUI(): void {
    const ring = this.container.querySelector('#pomo-ring');
    const title = this.container.querySelector('#pomo-phase-title');
    const sub = this.container.querySelector('#pomo-session-sub');
    const toggleBtn = this.container.querySelector('#pomo-toggle-btn') as HTMLButtonElement;

    if (!ring || !title || !sub || !toggleBtn) return;

    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = this.remainingSeconds % 60;
    ring.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    title.textContent = this.phase === 'work' ? 'Focus Session' : 'Rest Break';
    sub.textContent = `Session ${this.sessionsCompleted + 1} of 4 · ${this.sessionsCompleted * 25}m completed`;

    toggleBtn.textContent = this.active ? 'Pause' : 'Start';
    toggleBtn.classList.toggle('active', this.active);
  }

  public destroy(): void {
    this.active = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
