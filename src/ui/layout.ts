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
        <a
          href="https://github.com/IoannisNezis/emg-viz"
          target="_blank"
          rel="noopener noreferrer"
          class="ml-auto text-slate-500 hover:text-slate-200 transition-colors"
          aria-label="View on GitHub"
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
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
