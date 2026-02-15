/**
 * Build the app DOM structure.
 */

export interface LayoutRefs {
  controls: HTMLElement;
  chartContainer: HTMLElement;
  stats: HTMLElement;
  subtitle: HTMLElement;
}

export function buildLayout(root: HTMLElement): LayoutRefs {
  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-5">
      <header class="flex items-center gap-3">
        <h1 class="text-xl font-bold tracking-tight text-slate-100">
          EMG Analyzer
        </h1>
        <span id="subtitle" class="text-xs text-slate-500 mt-0.5">Synthetic EMG</span>
      </header>

      <div id="controls" class="flex flex-wrap items-center gap-4 rounded-lg bg-slate-800 px-4 py-3"></div>

      <div id="chart-container" class="rounded-lg bg-slate-800 p-3 overflow-hidden"></div>

      <div id="stats" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"></div>
    </div>
  `;

  return {
    controls: root.querySelector("#controls")!,
    chartContainer: root.querySelector("#chart-container")!,
    stats: root.querySelector("#stats")!,
    subtitle: root.querySelector("#subtitle")!,
  };
}
