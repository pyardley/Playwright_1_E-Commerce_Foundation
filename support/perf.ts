export interface WebVitalEntry {
  url: string;
  ttfbMs: number;
  domContentLoadedMs: number;
  loadMs: number;
  lcpMs: number | null; // null on firefox/webkit (unsupported) or if no LCP fired yet
  cls: number | null; // null on firefox/webkit (unsupported)
}

// Installed via page.addInitScript() so it re-runs fresh before every new
// document (including ones reached by clicking a link, not just goto()).
// LCP/CLS entry types are Chromium-only - feature-detected so firefox/webkit
// just leave those fields null instead of throwing. hadRecentInput excludes
// shifts within 500ms of user input from the CLS sum, per spec.
export const PERF_INIT_SCRIPT = `(() => {
  const metrics = { lcpMs: null, cls: null };
  window.__perfMetrics = metrics;
  const supported = (t) => typeof PerformanceObserver !== 'undefined'
    && PerformanceObserver.supportedEntryTypes?.includes(t);
  if (supported('largest-contentful-paint')) {
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) metrics.lcpMs = last.renderTime || last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {}
  }
  if (supported('layout-shift')) {
    metrics.cls = 0;
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) metrics.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}
  }
})();`;
