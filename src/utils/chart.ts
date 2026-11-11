// Santypes High-DPI Precision Charting Engine
// Custom zero-dependency Canvas charts tailored for dark themes
import { TelemetryPoint, LiveSample } from '../core/types.ts';
import { finiteNumber } from './html.ts';

function resetAndScaleCanvas(
  ctx: CanvasRenderingContext2D,
  dpr: number
): void {
  const safeDpr = finiteNumber(dpr, 1, 0.5, 4);
  if (typeof ctx.resetTransform === 'function') {
    ctx.resetTransform();
  } else if (typeof ctx.setTransform === 'function') {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.scale(safeDpr, safeDpr);
}

export interface TimelineChartOptions {
  tooltipElement?: HTMLElement | null;
  showWpm?: boolean;
  showRaw?: boolean;
  showErrors?: boolean;
  avgWpm?: number;
  peakWpm?: number;
  accentCyan?: string;
  accentAmber?: string;
  accentRose?: string;
  textMuted?: string;
  borderSubtle?: string;
}

export interface LiveSparklineOptions {
  currentWpm?: number;
  burstWpm?: number;
  peakBurstWpm?: number;
}

export interface DistributionSession {
  wpm: number;
}

/**
 * Renders an interactive WPM timeline performance chart on a canvas element.
 * @returns cleanup function to detach resize and hover listeners
 */
export function renderTimelineChart(
  canvas: HTMLCanvasElement,
  history: TelemetryPoint[] = [],
  options: TimelineChartOptions = {}
): () => void {
  if (!canvas || !history || history.length === 0) return () => {};

  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const tooltip = options.tooltipElement || null;

  // Configuration & display toggles
  const config = {
    showWpm: options.showWpm !== false,
    showRaw: options.showRaw !== false,
    showErrors: options.showErrors !== false,
    avgWpm: options.avgWpm || 0,
    peakWpm: options.peakWpm || 0,
    accentCyan: options.accentCyan || '#38bdf8',
    accentAmber: options.accentAmber || '#f59e0b',
    accentRose: options.accentRose || '#f43f5e',
    textMuted: options.textMuted || '#64748b',
    borderSubtle: options.borderSubtle || 'rgba(255, 255, 255, 0.08)',
  };

  let animationProgress = 0;
  let animationFrameId: number | null = null;
  let hoveredIndex = -1;
  let isDestroyed = false;

  // Normalized data coordinates (finite bounds guard against NaN/Infinity crashes)
  const data = history.map((pt, idx) => ({
    time: finiteNumber(pt?.time, idx + 1, 0, 86400),
    wpm: finiteNumber(pt?.wpm, 0, 0, 1000),
    rawWpm: finiteNumber(pt?.rawWpm, 0, 0, 1000),
    accuracy: finiteNumber(pt?.accuracy, 100, 0, 100),
    errors: Math.floor(finiteNumber(pt?.errors, 0, 0, 10000)),
  }));

  // Auto-scale bounds without stack-unsafe array spreads
  const maxTime = Math.max(5, data[data.length - 1]?.time ?? 5);
  const highestPointWpm = data.reduce((max, d) => Math.max(max, d.wpm, d.rawWpm), 0);
  const highestWpm = Math.max(finiteNumber(config.peakWpm, 0, 0, 1000), highestPointWpm);
  // Round up to nice 20 WPM boundary
  const maxY = Math.min(2000, Math.max(60, Math.ceil((highestWpm + 10) / 20) * 20));

  const margin = { top: 25, right: 30, bottom: 35, left: 45 };

  function resizeAndDraw(): void {
    if (isDestroyed || !ctx || !canvas.isConnected) return;
    const rect = canvas.getBoundingClientRect();
    if (!Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return;
    if (rect.width <= margin.left + margin.right || rect.height <= margin.top + margin.bottom) return;
    const dpr = finiteNumber(window.devicePixelRatio, 1, 0.5, 4);

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    resetAndScaleCanvas(ctx, dpr);

    drawChart(rect.width, rect.height);
  }

  function getX(time: number, width: number): number {
    const chartW = Math.max(1, width - margin.left - margin.right);
    return margin.left + (time / maxTime) * chartW;
  }

  function getY(val: number, height: number): number {
    const chartH = Math.max(1, height - margin.top - margin.bottom);
    return margin.top + chartH - (val / maxY) * chartH;
  }

  function drawChart(width: number, height: number): void {
    if (!ctx || width <= margin.left + margin.right || height <= margin.top + margin.bottom) return;
    ctx.clearRect(0, 0, width, height);

    // 1. Grid lines & Y-axis labels
    const yStep = maxY <= 80 ? 20 : maxY <= 140 ? 20 : 40;
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = config.textMuted;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let yVal = 0; yVal <= maxY; yVal += yStep) {
      const y = getY(yVal, height);

      // Grid line
      ctx.beginPath();
      ctx.strokeStyle = yVal === 0 ? 'rgba(255, 255, 255, 0.15)' : config.borderSubtle;
      ctx.lineWidth = 1;
      ctx.setLineDash(yVal === 0 ? [] : [4, 4]);
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillText(`${yVal}`, margin.left - 10, y);
    }

    // 2. X-axis labels (seconds)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const xStep = maxTime <= 15 ? 5 : maxTime <= 30 ? 5 : maxTime <= 60 ? 10 : 20;

    for (let t = 0; t <= maxTime; t += xStep) {
      const x = getX(t, width);

      // Grid vertical line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, height - margin.bottom);
      ctx.stroke();

      ctx.fillText(`${t}s`, x, height - margin.bottom + 8);
    }

    // 3. Average WPM Benchmark Reference Line
    if (config.avgWpm > 0 && config.avgWpm < maxY) {
      const avgY = getY(config.avgWpm, height);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.moveTo(margin.left, avgY);
      ctx.lineTo(width - margin.right, avgY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = config.accentCyan;
      ctx.textAlign = 'left';
      ctx.fillText(`avg ${config.avgWpm}`, width - margin.right - 45, avgY - 10);
    }

    // Calculate animated points count
    const activeCount = Math.max(1, Math.floor(data.length * animationProgress));
    const activeData = data.slice(0, activeCount);

    if (activeData.length === 0) return;

    // 4. Raw WPM Line (Amber dashed)
    if (config.showRaw && activeData.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = config.accentAmber;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      activeData.forEach((pt, i) => {
        const x = getX(pt.time, width);
        const y = getY(pt.rawWpm, height);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Net WPM Area Gradient Fill
    if (config.showWpm && activeData.length > 1) {
      const grad = ctx.createLinearGradient(0, margin.top, 0, height - margin.bottom);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.08)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

      ctx.beginPath();
      const firstX = getX(activeData[0].time, width);
      const firstY = getY(activeData[0].wpm, height);
      ctx.moveTo(firstX, height - margin.bottom);
      ctx.lineTo(firstX, firstY);

      // Smooth cubic bezier spline
      for (let i = 0; i < activeData.length - 1; i++) {
        const p1 = activeData[i];
        const p2 = activeData[i + 1];

        const x1 = getX(p1.time, width);
        const y1 = getY(p1.wpm, height);
        const x2 = getX(p2.time, width);
        const y2 = getY(p2.wpm, height);

        const cp1x = x1 + (x2 - x1) / 3;
        const cp1y = y1 + (y2 - y1) / 3;
        const cp2x = x2 - (x2 - x1) / 3;
        const cp2y = y2 - (y2 - y1) / 3;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      }

      const lastX = getX(activeData[activeData.length - 1].time, width);
      ctx.lineTo(lastX, height - margin.bottom);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // 6. Net WPM Solid Line with Glow
      ctx.beginPath();
      ctx.strokeStyle = config.accentCyan;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
      ctx.shadowBlur = 8;

      ctx.moveTo(firstX, firstY);
      for (let i = 0; i < activeData.length - 1; i++) {
        const p1 = activeData[i];
        const p2 = activeData[i + 1];

        const x1 = getX(p1.time, width);
        const y1 = getY(p1.wpm, height);
        const x2 = getX(p2.time, width);
        const y2 = getY(p2.wpm, height);

        const cp1x = x1 + (x2 - x1) / 3;
        const cp1y = y1 + (y2 - y1) / 3;
        const cp2x = x2 - (x2 - x1) / 3;
        const cp2y = y2 - (y2 - y1) / 3;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset glow
    }

    // 7. Error Markers (Scatter indicators)
    if (config.showErrors) {
      activeData.forEach((pt) => {
        if (pt.errors > 0) {
          const x = getX(pt.time, width);
          const y = getY(pt.wpm, height);

          // Soft rose glow ring
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
          ctx.fill();

          // Center solid error dot
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = config.accentRose;
          ctx.fill();

          // Error count indicator if > 1
          if (pt.errors > 1) {
            ctx.font = "bold 9px 'JetBrains Mono', monospace";
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(`×${pt.errors}`, x, y - 10);
          }
        }
      });
    }

    // 8. Hover Crosshair & Data Point Highlight
    if (hoveredIndex >= 0 && hoveredIndex < data.length) {
      const pt = data[hoveredIndex];
      const x = getX(pt.time, width);
      const y = getY(pt.wpm, height);

      // Vertical guideline
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, height - margin.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = config.accentCyan;
      ctx.shadowColor = config.accentCyan;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Hover & Tooltip Interaction
  function handlePointerMove(e: PointerEvent): void {
    if (isDestroyed || !canvas.isConnected || data.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    const chartW = rect.width - margin.left - margin.right;
    if (chartW <= 0) return;
    const relX = mouseX - margin.left;

    if (relX < 0 || relX > chartW) {
      hoveredIndex = -1;
      if (tooltip) tooltip.style.opacity = '0';
      drawChart(rect.width, rect.height);
      return;
    }

    const approxTime = (relX / chartW) * maxTime;
    let closestDist = Infinity;
    let closestIdx = 0;

    data.forEach((pt, idx) => {
      const dist = Math.abs(pt.time - approxTime);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    hoveredIndex = closestIdx;
    const pt = data[closestIdx];

    // Update Tooltip
    if (tooltip) {
      tooltip.innerHTML = `
        <div class="tooltip-row header"><span>${pt.time}s</span> <span>${pt.accuracy}% Acc</span></div>
        <div class="tooltip-row stat"><span class="badge-dot cyan"></span> Net WPM: <strong>${pt.wpm}</strong></div>
        <div class="tooltip-row stat"><span class="badge-dot amber"></span> Raw WPM: <strong>${pt.rawWpm}</strong></div>
        ${pt.errors > 0 ? `<div class="tooltip-row stat"><span class="badge-dot rose"></span> Errors: <strong>${pt.errors}</strong></div>` : ''}
      `;
      tooltip.style.opacity = '1';

      const x = getX(pt.time, rect.width);
      const y = getY(pt.wpm, rect.height);

      // Position tooltip safely inside bounds
      const tipWidth = 140;
      const leftPos = Math.min(rect.width - tipWidth - 10, Math.max(10, x - tipWidth / 2));
      tooltip.style.transform = `translate3d(${leftPos}px, ${Math.max(10, y - 90)}px, 0)`;
    }

    drawChart(rect.width, rect.height);
  }

  function handlePointerLeave(): void {
    if (isDestroyed || !canvas.isConnected) return;
    hoveredIndex = -1;
    if (tooltip) tooltip.style.opacity = '0';
    const rect = canvas.getBoundingClientRect();
    drawChart(rect.width, rect.height);
  }

  // Animation entrance
  function animateEntrance(): void {
    const startTime = performance.now();
    const duration = 650; // ms

    function frame(now: number): void {
      if (isDestroyed || !canvas.isConnected) {
        animationFrameId = null;
        return;
      }
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease out cubic
      animationProgress = 1 - Math.pow(1 - t, 3);

      const rect = canvas.getBoundingClientRect();
      drawChart(rect.width, rect.height);

      if (t < 1 && !isDestroyed) {
        animationFrameId = requestAnimationFrame(frame);
      } else {
        animationFrameId = null;
      }
    }

    animationFrameId = requestAnimationFrame(frame);
  }

  // Attach event listeners
  window.addEventListener('resize', resizeAndDraw);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerleave', handlePointerLeave);

  // Initial draw & animation
  resizeAndDraw();
  animateEntrance();

  // Return cleanup function
  return () => {
    isDestroyed = true;
    window.removeEventListener('resize', resizeAndDraw);
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };
}

/**
 * Renders a Speed Distribution Bar Chart (Histogram) on a canvas.
 */
export function renderDistributionChart(
  canvas: HTMLCanvasElement,
  tests: DistributionSession[] = []
): () => void {
  if (!canvas || !tests || tests.length === 0) return () => {};

  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let animationProgress = 0;
  let animationFrameId: number | null = null;
  let isDestroyed = false;

  function draw(): void {
    if (isDestroyed || !ctx || !canvas.isConnected) return;
    const rect = canvas.getBoundingClientRect();
    const margin = { top: 20, right: 20, bottom: 35, left: 35 };
    if (rect.width <= margin.left + margin.right || rect.height <= margin.top + margin.bottom) return;

    const dpr = finiteNumber(window.devicePixelRatio, 1, 0.5, 4);

    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    resetAndScaleCanvas(ctx, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    // Group into brackets: 0-39, 40-59, 60-79, 80-99, 100-119, 120+
    const brackets = [
      { label: '<40', min: 0, max: 39, count: 0 },
      { label: '40-59', min: 40, max: 59, count: 0 },
      { label: '60-79', min: 60, max: 79, count: 0 },
      { label: '80-99', min: 80, max: 99, count: 0 },
      { label: '100-119', min: 100, max: 119, count: 0 },
      { label: '120+', min: 120, max: 999, count: 0 },
    ];

    tests.forEach((t) => {
      const wpm = finiteNumber(t?.wpm, 0, 0, 500);
      const b = brackets.find((br) => wpm >= br.min && wpm <= br.max);
      if (b) b.count++;
    });

    const maxCount = Math.max(1, brackets.reduce((m, b) => Math.max(m, b.count), 1));
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const barWidth = Math.min(50, (chartW / brackets.length) * 0.7);
    const gap = chartW / brackets.length;

    // Grid lines
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let c = 0; c <= maxCount; c += Math.max(1, Math.ceil(maxCount / 4))) {
      const y = margin.top + chartH - (c / maxCount) * chartH;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.moveTo(margin.left, y);
      ctx.lineTo(width - margin.right, y);
      ctx.stroke();
      ctx.fillText(`${c}`, margin.left - 8, y);
    }

    // Draw Bars with smooth entrance animation
    brackets.forEach((b, i) => {
      const x = margin.left + i * gap + (gap - barWidth) / 2;
      const targetBarH = (b.count / maxCount) * chartH;
      const barH = targetBarH * animationProgress;
      const y = margin.top + chartH - barH;

      // Bar gradient
      const grad = ctx.createLinearGradient(0, y, 0, margin.top + chartH);
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.2)');

      ctx.fillStyle = b.count > 0 ? grad : 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, barWidth, Math.max(2, barH), [4, 4, 0, 0]);
      } else {
        ctx.rect(x, y, barWidth, Math.max(2, barH));
      }
      ctx.fill();

      // Bar top value
      if (b.count > 0 && animationProgress > 0.2) {
        const textAlpha = Math.min(1, (animationProgress - 0.2) / 0.8);
        ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
        ctx.textAlign = 'center';
        ctx.fillText(`${b.count}`, x + barWidth / 2, y - 8);
      }

      // X-axis label
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, x + barWidth / 2, height - margin.bottom + 14);
    });
  }

  function animateEntrance(): void {
    const startTime = performance.now();
    const duration = 650; // ms, synchronized with timeline chart

    function frame(now: number): void {
      if (isDestroyed || !canvas.isConnected) {
        animationFrameId = null;
        return;
      }
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Ease out cubic
      animationProgress = 1 - Math.pow(1 - t, 3);

      draw();

      if (t < 1 && !isDestroyed) {
        animationFrameId = requestAnimationFrame(frame);
      } else {
        animationFrameId = null;
      }
    }

    animationFrameId = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', draw);
  animateEntrance();

  return () => {
    isDestroyed = true;
    window.removeEventListener('resize', draw);
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };
}

/**
 * Renders a high-performance live real-time velocity sparkline wave during typing.
 */
export function renderLiveSparkline(
  canvas: HTMLCanvasElement,
  samples: LiveSample[] = [],
  options: LiveSparklineOptions = {}
): void {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const padding = { top: 6, bottom: 8, left: 6, right: 12 };
  if (rect.width <= padding.left + padding.right || rect.height <= padding.top + padding.bottom) return;

  const dpr = finiteNumber(window.devicePixelRatio, 1, 0.5, 4);
  const width = rect.width;
  const height = rect.height;
  if (!Number.isFinite(width) || !Number.isFinite(height)) return;

  if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
  }

  resetAndScaleCanvas(ctx, dpr);
  ctx.clearRect(0, 0, width, height);

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Background guide lines
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.moveTo(padding.left, height - padding.bottom);
  ctx.lineTo(width - padding.right, height - padding.bottom);
  ctx.moveTo(padding.left, padding.top + chartH / 2);
  ctx.lineTo(width - padding.right, padding.top + chartH / 2);
  ctx.stroke();

  if (!samples || samples.length === 0) {
    // Ambient breathing idle line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 4]);
    ctx.moveTo(padding.left, height - padding.bottom - 2);
    ctx.lineTo(width - padding.right, height - padding.bottom - 2);
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }

  // Normalize samples against NaN / Infinity
  const safeSamples = samples.map((s) => ({
    wpm: finiteNumber(s?.wpm, 0, 0, 1000),
    burst: finiteNumber(s?.burst, 0, 0, 1000),
  }));
  const maxSampleBurst = safeSamples.reduce((m, s) => Math.max(m, s.wpm, s.burst), 0);
  const maxBurst = Math.min(2000, Math.max(60, finiteNumber(options.peakBurstWpm, 60, 60, 1000), maxSampleBurst));
  const count = safeSamples.length;

  function getX(idx: number): number {
    if (count <= 1) return padding.left;
    return padding.left + (idx / (count - 1)) * chartW;
  }

  function getY(val: number): number {
    const norm = Math.min(1, Math.max(0, finiteNumber(val, 0, 0, 2000) / maxBurst));
    return padding.top + chartH - norm * chartH;
  }

  // 1. Draw smooth burst wave gradient
  const grad = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

  ctx.beginPath();
  ctx.moveTo(getX(0), height - padding.bottom);
  for (let i = 0; i < count; i++) {
    const x = getX(i);
    const y = getY(safeSamples[i].burst);
    if (i === 0) ctx.lineTo(x, y);
    else {
      const prevX = getX(i - 1);
      const prevY = getY(safeSamples[i - 1].burst);
      const cx = (prevX + x) / 2;
      ctx.bezierCurveTo(cx, prevY, cx, y, x, y);
    }
  }
  ctx.lineTo(getX(count - 1), height - padding.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // 2. Draw live burst line
  ctx.beginPath();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
  ctx.shadowBlur = 6;

  for (let i = 0; i < count; i++) {
    const x = getX(i);
    const y = getY(safeSamples[i].burst);
    if (i === 0) ctx.moveTo(x, y);
    else {
      const prevX = getX(i - 1);
      const prevY = getY(safeSamples[i - 1].burst);
      const cx = (prevX + x) / 2;
      ctx.bezierCurveTo(cx, prevY, cx, y, x, y);
    }
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 3. Draw Net WPM subtle dashed trend
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);
  for (let i = 0; i < count; i++) {
    const x = getX(i);
    const y = getY(safeSamples[i].wpm);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // 4. Glowing Head cursor dot
  const lastSample = safeSamples[count - 1];
  const headX = getX(count - 1);
  const headY = getY(lastSample.burst);

  // Outer glow halo
  ctx.beginPath();
  ctx.arc(headX, headY, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.fill();

  // Solid center dot
  ctx.beginPath();
  ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}
