// Santypes Performance Analytics View Controller
// Persistent lifetime telemetry, progress charts, and speed distribution
// 100% Framework-Free Pure TypeScript

import { renderTimelineChart, renderDistributionChart } from '../utils/chart.ts';
import { getTestHistory, clearTestHistory, loadSeedData } from '../stubs/storage-stub.ts';
import { SessionResult, TelemetryPoint } from '../core/types.ts';
import { showNotificationToast } from '../components/celebration-toast.ts';
import { confirmActionDialog } from '../utils/dialog-host.ts';
import { escapeHTML, finiteNumber, safeDateLabel } from '../utils/html.ts';

interface LegacySessionResult extends SessionResult {
  errors?: number;
}

/**
 * Renders the full Analytics Dashboard into the given container.
 * Returns a teardown/cleanup function to remove chart resize & interaction listeners.
 */
export function renderAnalytics(
  container: HTMLElement,
  onNavigateToTest: (() => void) | null = null
): () => void {
  let timelineCleanup: (() => void) | null = null;
  let distCleanup: (() => void) | null = null;
  let numberAnimId: number | null = null;
  let isDestroyed = false;

  function cleanupNumbers(): void {
    if (numberAnimId !== null) {
      cancelAnimationFrame(numberAnimId);
      numberAnimId = null;
    }
  }

  function cleanupCharts(): void {
    if (timelineCleanup) {
      timelineCleanup();
      timelineCleanup = null;
    }
    if (distCleanup) {
      distCleanup();
      distCleanup = null;
    }
    cleanupNumbers();
  }

  function renderView(): void {
    cleanupCharts();
    const rawTests = getTestHistory();
    const tests: SessionResult[] = (Array.isArray(rawTests) ? rawTests : []).filter(t => t && typeof t === 'object');

    // If no tests recorded, render dedicated empty state
    if (!tests || tests.length === 0) {
      container.innerHTML = `
        <div class="analytics-container">
          <div class="analytics-header">
            <div>
              <h1 class="analytics-title">Performance Analytics</h1>
              <p class="analytics-subtitle">Track typing velocity, biomechanical consistency, and accuracy trends over time.</p>
            </div>
            <div class="analytics-actions">
              <button class="btn-secondary analytics-action-btn" id="btn-load-demo" title="Load sample benchmark data">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31"></path><path d="M14 9.3V2"></path><path d="M8.5 2h7"></path><path d="M14 9.3a6.5 6.5 0 1 1-4 0"></path><path d="M5.52 16h12.96"></path></svg>
                <span>Load Sample Data</span>
              </button>
              <button class="btn-primary analytics-action-btn" id="btn-analytics-new-test">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <span>Take Test</span>
              </button>
            </div>
          </div>

          <div class="analytics-empty-card">
            <div class="empty-icon-halo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            </div>
            <h2 class="empty-title">No Typing Sessions Recorded Yet</h2>
            <p class="empty-desc">Complete your first typing test to unlock lifetime telemetry, speed progression trends, and biometric consistency scoring.</p>
            <div class="empty-actions-row">
              <button class="btn-primary" id="btn-empty-start" style="padding:10px 20px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <span>Start Your First Test</span>
              </button>
              <button class="btn-secondary" id="btn-empty-load-demo" style="padding:10px 20px;">
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      `;

      const handleStart = (): void => {
        if (onNavigateToTest) onNavigateToTest();
      };
      const handleDemo = (): void => {
        loadSeedData();
        renderView();
      };

      const btnNew = container.querySelector('#btn-analytics-new-test');
      const btnEmptyStart = container.querySelector('#btn-empty-start');
      const btnLoadDemo = container.querySelector('#btn-load-demo');
      const btnEmptyDemo = container.querySelector('#btn-empty-load-demo');

      if (btnNew) btnNew.addEventListener('click', handleStart);
      if (btnEmptyStart) btnEmptyStart.addEventListener('click', handleStart);
      if (btnLoadDemo) btnLoadDemo.addEventListener('click', handleDemo);
      if (btnEmptyDemo) btnEmptyDemo.addEventListener('click', handleDemo);
      return;
    }

    // Compute lifetime metrics safely
    const totalTests = tests.length;
    const peakWpm = tests.reduce((max, t) => Math.max(max, finiteNumber(t?.wpm, 0, 0, 500)), 0);
    const avgWpm = totalTests > 0 ? Math.round(tests.reduce((sum, t) => sum + finiteNumber(t?.wpm, 0, 0, 500), 0) / totalTests) : 0;
    const avgAcc = totalTests > 0 ? Math.round(tests.reduce((sum, t) => sum + finiteNumber(t?.accuracy, 100, 0, 100), 0) / totalTests) : 100;
    const totalSeconds = tests.reduce((sum, t) => sum + finiteNumber(t?.elapsedSeconds, 0, 0, 86400), 0);
    const timeFormatted = formatDuration(totalSeconds);

    container.innerHTML = `
      <div class="analytics-container">
        <!-- Analytics Header -->
        <div class="analytics-header">
          <div>
            <h1 class="analytics-title">Performance Analytics</h1>
            <p class="analytics-subtitle">Track typing velocity, biomechanical consistency, and accuracy trends over time.</p>
          </div>
          <div class="analytics-actions">
            <button class="btn-secondary analytics-action-btn" id="btn-export-data" title="Export typing telemetry as JSON">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Export JSON</span>
            </button>
            <button class="btn-secondary analytics-action-btn" id="btn-clear-history" title="Clear recorded tests">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Clear Data</span>
            </button>
            <button class="btn-primary analytics-action-btn" id="btn-analytics-new-test" title="Launch a new typing test session">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Take Test</span>
            </button>
          </div>
        </div>

        <!-- Lifetime KPIs Grid -->
        <div class="kpi-grid">
          <div class="kpi-card highlight-cyan">
            <span class="kpi-label">Personal Best</span>
            <span class="kpi-val" id="kpi-peak-wpm">0 <small>WPM</small></span>
            <span class="kpi-meta">All-time top speed</span>
          </div>

          <div class="kpi-card">
            <span class="kpi-label">Average Speed</span>
            <span class="kpi-val" id="kpi-avg-wpm">0 <small>WPM</small></span>
            <span class="kpi-meta">Across all completed tests</span>
          </div>

          <div class="kpi-card">
            <span class="kpi-label">Average Accuracy</span>
            <span class="kpi-val" id="kpi-avg-acc" style="color: var(--accent-emerald);">0%</span>
            <span class="kpi-meta">Precision rating</span>
          </div>

          <div class="kpi-card">
            <span class="kpi-label">Tests Taken</span>
            <span class="kpi-val" id="kpi-total-tests">0</span>
            <span class="kpi-meta">Recorded sessions</span>
          </div>

          <div class="kpi-card">
            <span class="kpi-label">Total Time</span>
            <span class="kpi-val" id="kpi-total-time">0s</span>
            <span class="kpi-meta">Time in typing flow</span>
          </div>
        </div>

        <!-- Analytics Charts Section -->
        <div class="analytics-charts-grid">
          <!-- Speed Progression Over Time -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">Speed Progression Trend</div>
                <div class="chart-card-subtitle">WPM and Raw speed across your last tests</div>
              </div>
              <div class="chart-legend">
                <span class="legend-item"><span class="legend-dot cyan"></span> Net WPM</span>
                <span class="legend-item"><span class="legend-dot amber"></span> Raw WPM</span>
              </div>
            </div>
            <div class="chart-canvas-wrapper" style="height: 220px; position: relative;">
              <canvas id="trend-chart" style="width: 100%; height: 100%;"></canvas>
              <div id="trend-tooltip" class="chart-tooltip"></div>
            </div>
          </div>

          <!-- Speed Distribution Histogram -->
          <div class="chart-card">
            <div class="chart-card-header">
              <div>
                <div class="chart-card-title">Speed Distribution</div>
                <div class="chart-card-subtitle">Count of tests grouped by WPM brackets</div>
              </div>
            </div>
            <div class="chart-canvas-wrapper" style="height: 220px; position: relative;">
              <canvas id="dist-chart" style="width: 100%; height: 100%;"></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Sessions History Table -->
        <div class="history-table-card">
          <div class="history-header">
            <div class="chart-card-title">Session History</div>
            <div class="chart-card-subtitle">Detailed breakdown of recent typing sessions</div>
          </div>
          <div class="table-responsive">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Mode</th>
                  <th>Net WPM</th>
                  <th>Raw WPM</th>
                  <th>Accuracy</th>
                  <th>Consistency</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                ${tests.map((t) => {
                  const safeMode = escapeHTML(String(typeof t.mode === 'string' && t.mode ? t.mode : 'time').toUpperCase());
                  const safeWpm = Math.round(finiteNumber(t.wpm, 0, 0, 500));
                  const safeRaw = Math.round(finiteNumber(t.rawWpm, 0, 0, 500));
                  const safeAcc = Math.round(finiteNumber(t.accuracy, 100, 0, 100));
                  const safeCons = Math.round(finiteNumber(t.consistency, 100, 0, 100));
                  const safeSec = Math.round(finiteNumber(t.elapsedSeconds, 0, 0, 86400));
                  return `
                  <tr>
                    <td>${escapeHTML(safeDateLabel(t.completedAt, 'Just now'))}</td>
                    <td><span class="mode-pill">${safeMode}</span></td>
                    <td><strong style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 15px;">${safeWpm}</strong></td>
                    <td style="font-family: var(--font-mono); color: var(--accent-amber);">${safeRaw}</td>
                    <td style="font-family: var(--font-mono); color: var(--accent-emerald);">${safeAcc}%</td>
                    <td style="font-family: var(--font-mono);">${safeCons}%</td>
                    <td style="font-family: var(--font-mono); color: var(--text-muted);">${safeSec}s</td>
                  </tr>
                `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Render Charts
    const trendCanvas = container.querySelector<HTMLCanvasElement>('#trend-chart');
    const trendTooltip = container.querySelector<HTMLElement>('#trend-tooltip');
    const distCanvas = container.querySelector<HTMLCanvasElement>('#dist-chart');

    if (trendCanvas) {
      // Transform tests into progression points
      const progressionData: TelemetryPoint[] = tests
        .slice()
        .reverse()
        .map((t: LegacySessionResult, i) => ({
          time: i + 1,
          wpm: t.wpm || 0,
          rawWpm: t.rawWpm || 0,
          accuracy: t.accuracy || 100,
          errors: t.incorrectChars ?? (t.errors || 0),
        }));

      timelineCleanup = renderTimelineChart(trendCanvas, progressionData, {
        tooltipElement: trendTooltip,
        avgWpm: avgWpm,
        peakWpm: peakWpm,
      });
    }

    if (distCanvas) {
      distCleanup = renderDistributionChart(distCanvas, tests);
    }

    // Animate KPI numbers from 0 up to their target values
    const kpiPeak = container.querySelector<HTMLElement>('#kpi-peak-wpm');
    const kpiAvg = container.querySelector<HTMLElement>('#kpi-avg-wpm');
    const kpiAcc = container.querySelector<HTMLElement>('#kpi-avg-acc');
    const kpiTests = container.querySelector<HTMLElement>('#kpi-total-tests');
    const kpiTime = container.querySelector<HTMLElement>('#kpi-total-time');

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (kpiPeak) kpiPeak.innerHTML = `${peakWpm} <small>WPM</small>`;
      if (kpiAvg) kpiAvg.innerHTML = `${avgWpm} <small>WPM</small>`;
      if (kpiAcc) kpiAcc.textContent = `${avgAcc}%`;
      if (kpiTests) kpiTests.textContent = `${totalTests}`;
      if (kpiTime) kpiTime.textContent = timeFormatted;
    } else {
      const duration = 650; // synchronized with chart entrance transition
      const startTime = performance.now();

      const step = (now: number): void => {
        if (isDestroyed || !container.isConnected) {
          numberAnimId = null;
          return;
        }
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const progress = 1 - Math.pow(1 - t, 3); // cubic ease-out

        const currPeak = Math.round(peakWpm * progress);
        const currAvg = Math.round(avgWpm * progress);
        const currAcc = Math.round(avgAcc * progress);
        const currTests = Math.round(totalTests * progress);
        const currSec = Math.round(totalSeconds * progress);

        if (kpiPeak) kpiPeak.innerHTML = `${currPeak} <small>WPM</small>`;
        if (kpiAvg) kpiAvg.innerHTML = `${currAvg} <small>WPM</small>`;
        if (kpiAcc) kpiAcc.textContent = `${currAcc}%`;
        if (kpiTests) kpiTests.textContent = `${currTests}`;
        if (kpiTime) kpiTime.textContent = formatDuration(currSec);

        if (t < 1) {
          numberAnimId = requestAnimationFrame(step);
        } else {
          numberAnimId = null;
        }
      };

      numberAnimId = requestAnimationFrame(step);
    }

    // Bind Header Button Actions
    const btnNewTest = container.querySelector<HTMLElement>('#btn-analytics-new-test');
    if (btnNewTest && onNavigateToTest) {
      btnNewTest.addEventListener('click', () => {
        onNavigateToTest();
      });
    }

    const btnClear = container.querySelector<HTMLElement>('#btn-clear-history');
    if (btnClear) {
      btnClear.addEventListener('click', async () => {
        const confirmed = await confirmActionDialog({
          title: 'Clear Typing History?',
          message: 'Are you sure you want to reset and clear your typing history?',
          confirmLabel: 'Clear History',
          dangerous: true,
        });
        if (confirmed) {
          clearTestHistory();
          renderView();
        }
      });
    }

    const btnExport = container.querySelector<HTMLElement>('#btn-export-data');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        try {
          const blob = new Blob([JSON.stringify(tests, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute('href', url);
          downloadAnchor.setAttribute('download', `santypes_history_${Date.now()}.json`);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          showNotificationToast('Telemetry data exported successfully!');
        } catch {
          showNotificationToast('Unable to export data in this environment.');
        }
      });
    }
  }

  // Initial render
  renderView();

  // Return comprehensive cleanup function
  return () => {
    isDestroyed = true;
    cleanupCharts();
  };
}

function formatDuration(totalSec: number): string {
  const safeTotal = finiteNumber(totalSec, 0, 0, 86400000);
  const m = Math.floor(safeTotal / 60);
  const s = Math.round(safeTotal % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}
