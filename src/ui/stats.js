/**
 * Render summary statistics card grid.
 */

const STAT_DEFS = [
  { key: "contractionCount", label: "Contractions", format: (v) => String(v) },
  { key: "averageDurationMs", label: "Avg Duration", format: (v) => `${Math.round(v)} ms` },
  { key: "peakRms", label: "Peak RMS", format: (v) => `${v.toFixed(3)} V` },
  { key: "meanRms", label: "Mean RMS", format: (v) => `${v.toFixed(3)} V` },
  { key: "dutyCyclePercent", label: "Duty Cycle", format: (v) => `${v.toFixed(1)}%` },
  { key: "threshold", label: "Threshold", format: (v) => `${v.toFixed(3)} V` },
];

export function updateStats(container, stats, threshold) {
  const data = { ...stats, threshold };

  container.innerHTML = STAT_DEFS.map(
    (def) => `
    <div class="rounded-lg bg-slate-800/80 border border-slate-700/50 px-3 py-3 text-center">
      <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">${def.label}</div>
      <div class="text-lg font-semibold text-slate-100">${def.format(data[def.key])}</div>
    </div>
  `,
  ).join("");
}
