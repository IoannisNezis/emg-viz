import "./style.css";
import { generateEMG, generateTimeAxis } from "./data/emg-generator.ts";
import { parseCSV } from "./data/csv-parser.ts";
import { calculateRMS, msToSamples } from "./processing/rms.ts";
import { detectContractions, computeStats } from "./processing/contractions.ts";
import { createChart } from "./viz/chart.ts";
import { buildLayout } from "./ui/layout.ts";
import { buildControls } from "./ui/controls.ts";
import { updateStats } from "./ui/stats.ts";
import type { AppMode, EMGData, ThresholdMethod } from "./types.ts";

// ── State ────────────────────────────────────────────────────────
interface AppState {
  mode: AppMode;
  emgData: EMGData | null;
  timeAxis: Float64Array | null;
  rmsValues: Float64Array | null;
  threshold: number;
  contractions: ReturnType<typeof detectContractions>;
  windowSizeMs: number;
  durationMs: number;
  thresholdMethod: ThresholdMethod;
  thresholdValue: number;
  fileText: string | null;
  fileName: string | null;
  viewDomain: [number, number] | null;
}

const state: AppState = {
  mode: "demo",
  emgData: null,
  timeAxis: null,
  rmsValues: null,
  threshold: 0,
  contractions: [],
  windowSizeMs: 100,
  durationMs: 5000,
  thresholdMethod: "median",
  thresholdValue: 2,
  fileText: null,
  fileName: null,
  viewDomain: null,
};

// ── DOM ──────────────────────────────────────────────────────────
const app = document.getElementById("app")!;
const { controls, chartContainer, stats, subtitle } = buildLayout(app);

// ── Chart ────────────────────────────────────────────────────────
const chart = createChart(chartContainer, {
  onThresholdChange: handleThresholdDrag,
  onZoom: handleZoom,
  onZoomReset: handleZoomReset,
});

// ── Controls ─────────────────────────────────────────────────────
const controlsApi = buildControls(controls, {
  windowSizeMs: state.windowSizeMs,
  durationMs: state.durationMs,
  thresholdMethod: state.thresholdMethod,
  thresholdValue: state.thresholdValue,
  onWindowSizeChange: handleWindowSizeChange,
  onThresholdSettingChange: handleThresholdSettingChange,
  onDurationChange: handleDurationChange,
  onRegenerate: handleRegenerate,
  onFileUpload: handleFileUpload,
  onChannelChange: handleChannelChange,
  onBackToDemo: handleBackToDemo,
});

// ── Handlers ─────────────────────────────────────────────────────

function handleThresholdDrag(newThreshold: number): void {
  state.threshold = newThreshold;
  state.thresholdMethod = "manual";
  controlsApi.setMethod("manual");
  updateContractionsAndStats();
  chart.updateContractions({
    threshold: state.threshold,
    contractions: state.contractions,
  });
}

function handleWindowSizeChange(ms: number): void {
  state.windowSizeMs = ms;
  recomputeRMS();
  applyThreshold();
  fullRedraw();
}

function handleThresholdSettingChange(method: ThresholdMethod, value: number): void {
  state.thresholdMethod = method;
  state.thresholdValue = value;
  applyThreshold();
  updateContractionsAndStats();
  chart.updateContractions({
    threshold: state.threshold,
    contractions: state.contractions,
  });
}

function handleDurationChange(ms: number): void {
  state.durationMs = ms;
  regenerateSignal();
}

function handleRegenerate(): void {
  regenerateSignal();
}

function handleFileUpload(file: File): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      state.fileText = (e.target as FileReader).result as string;
      state.fileName = file.name;
      const parsed = parseCSV(state.fileText);
      state.mode = "file";
      controlsApi.setMode("file");
      controlsApi.setChannels(parsed.channelNames);
      subtitle.textContent = file.name;
      loadSignal(parsed);
    } catch (err) {
      alert(`Failed to parse CSV: ${(err as Error).message}`);
    }
  };
  reader.readAsText(file);
}

function handleChannelChange(channelIndex: number): void {
  if (!state.fileText) return;
  try {
    const parsed = parseCSV(state.fileText, channelIndex);
    loadSignal(parsed);
  } catch (err) {
    alert(`Failed to parse channel: ${(err as Error).message}`);
  }
}

function handleBackToDemo(): void {
  state.mode = "demo";
  state.fileText = null;
  state.fileName = null;
  state.viewDomain = null;
  controlsApi.setMode("demo");
  subtitle.textContent = "Synthetic EMG";
  regenerateSignal();
}

function handleZoom(start: number, end: number): void {
  state.viewDomain = [start, end];
  fullRedraw();
}

function handleZoomReset(): void {
  state.viewDomain = null;
  fullRedraw();
}

// ── Processing ───────────────────────────────────────────────────

function loadSignal(emgData: EMGData): void {
  state.emgData = emgData;
  state.viewDomain = null;
  state.timeAxis = generateTimeAxis(
    emgData.samples.length,
    emgData.sampleRateHz,
  );
  recomputeRMS();
  applyThreshold();
  fullRedraw();
}

function regenerateSignal(): void {
  const emgData = generateEMG({
    durationMs: state.durationMs,
    sampleRateHz: 1000,
  });
  loadSignal(emgData);
}

function recomputeRMS(): void {
  const windowSamples = msToSamples(
    state.windowSizeMs,
    state.emgData!.sampleRateHz,
  );
  state.rmsValues = calculateRMS(state.emgData!.samples, windowSamples);
}

function applyThreshold(): void {
  if (state.thresholdMethod === "manual") return;

  const rms = state.rmsValues!;
  const n = rms.length;

  // Median RMS — robust noise-floor estimate (unaffected by bursts)
  const sorted = Float64Array.from(rms).sort();
  const median = sorted[Math.floor(n / 2)];

  if (state.thresholdMethod === "median") {
    state.threshold = median * state.thresholdValue;
  } else if (state.thresholdMethod === "mad") {
    // MAD (Median Absolute Deviation) — robust spread of the noise
    const deviations = Float64Array.from(rms, (v) => Math.abs(v - median)).sort();
    const mad = deviations[Math.floor(n / 2)];
    state.threshold = median + state.thresholdValue * mad;
  }
}

function updateContractionsAndStats(): void {
  state.contractions = detectContractions(
    state.rmsValues!,
    state.threshold,
    state.emgData!.sampleRateHz,
  );
  const s = computeStats(state.contractions, state.rmsValues!);
  updateStats(stats, s, state.threshold);
}

function fullRedraw(): void {
  updateContractionsAndStats();
  chart.update({
    timeAxis: state.timeAxis!,
    samples: state.emgData!.samples,
    rmsValues: state.rmsValues!,
    threshold: state.threshold,
    contractions: state.contractions,
    viewDomain: state.viewDomain,
  });
}

// ── Resize ───────────────────────────────────────────────────────
let resizeTimer: ReturnType<typeof setTimeout>;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    chart.resize({
      timeAxis: state.timeAxis!,
      samples: state.emgData!.samples,
      rmsValues: state.rmsValues!,
      threshold: state.threshold,
      contractions: state.contractions,
      viewDomain: state.viewDomain,
    });
  }, 100);
});

// ── Init ─────────────────────────────────────────────────────────
regenerateSignal();
