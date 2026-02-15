import "./style.css";
import { generateEMG, generateTimeAxis } from "./data/emg-generator.js";
import { parseCSV } from "./data/csv-parser.js";
import { calculateRMS, msToSamples } from "./processing/rms.js";
import { detectContractions, computeStats } from "./processing/contractions.js";
import { createChart } from "./viz/chart.js";
import { buildLayout } from "./ui/layout.js";
import { buildControls } from "./ui/controls.js";
import { updateStats } from "./ui/stats.js";

// ── State ────────────────────────────────────────────────────────
const state = {
  mode: "demo", // "demo" | "file"
  emgData: null,
  timeAxis: null,
  rmsValues: null,
  threshold: 0,
  contractions: [],
  windowSizeMs: 100,
  durationMs: 5000,
  thresholdMethod: "median", // "median" | "mad" | "manual"
  thresholdValue: 2,         // multiplier for the chosen method
  fileText: null,             // raw CSV text for channel switching
  fileName: null,
};

// ── DOM ──────────────────────────────────────────────────────────
const app = document.getElementById("app");
const { controls, chartContainer, stats, subtitle } = buildLayout(app);

// ── Chart ────────────────────────────────────────────────────────
const chart = createChart(chartContainer, {
  onThresholdChange: handleThresholdDrag,
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

function handleThresholdDrag(newThreshold) {
  state.threshold = newThreshold;
  state.thresholdMethod = "manual";
  controlsApi.setMethod("manual");
  updateContractionsAndStats();
  chart.updateContractions({
    threshold: state.threshold,
    contractions: state.contractions,
  });
}

function handleWindowSizeChange(ms) {
  state.windowSizeMs = ms;
  recomputeRMS();
  applyThreshold();
  fullRedraw();
}

function handleThresholdSettingChange(method, value) {
  state.thresholdMethod = method;
  state.thresholdValue = value;
  applyThreshold();
  updateContractionsAndStats();
  chart.updateContractions({
    threshold: state.threshold,
    contractions: state.contractions,
  });
}

function handleDurationChange(ms) {
  state.durationMs = ms;
  regenerateSignal();
}

function handleRegenerate() {
  regenerateSignal();
}

function handleFileUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      state.fileText = e.target.result;
      state.fileName = file.name;
      const parsed = parseCSV(state.fileText);
      state.mode = "file";
      controlsApi.setMode("file");
      controlsApi.setChannels(parsed.channelNames);
      subtitle.textContent = file.name;
      loadSignal(parsed);
    } catch (err) {
      alert(`Failed to parse CSV: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

function handleChannelChange(channelIndex) {
  if (!state.fileText) return;
  try {
    const parsed = parseCSV(state.fileText, channelIndex);
    loadSignal(parsed);
  } catch (err) {
    alert(`Failed to parse channel: ${err.message}`);
  }
}

function handleBackToDemo() {
  state.mode = "demo";
  state.fileText = null;
  state.fileName = null;
  controlsApi.setMode("demo");
  subtitle.textContent = "Synthetic EMG";
  regenerateSignal();
}

// ── Processing ───────────────────────────────────────────────────

function loadSignal(emgData) {
  state.emgData = emgData;
  state.timeAxis = generateTimeAxis(
    emgData.samples.length,
    emgData.sampleRateHz,
  );
  recomputeRMS();
  applyThreshold();
  fullRedraw();
}

function regenerateSignal() {
  const emgData = generateEMG({
    durationMs: state.durationMs,
    sampleRateHz: 1000,
  });
  loadSignal(emgData);
}

function recomputeRMS() {
  const windowSamples = msToSamples(
    state.windowSizeMs,
    state.emgData.sampleRateHz,
  );
  state.rmsValues = calculateRMS(state.emgData.samples, windowSamples);
}

function applyThreshold() {
  if (state.thresholdMethod === "manual") return;

  const rms = state.rmsValues;
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

function updateContractionsAndStats() {
  state.contractions = detectContractions(
    state.rmsValues,
    state.threshold,
    state.emgData.sampleRateHz,
  );
  const s = computeStats(state.contractions, state.rmsValues);
  updateStats(stats, s, state.threshold);
}

function fullRedraw() {
  updateContractionsAndStats();
  chart.update({
    timeAxis: state.timeAxis,
    samples: state.emgData.samples,
    rmsValues: state.rmsValues,
    threshold: state.threshold,
    contractions: state.contractions,
  });
}

// ── Resize ───────────────────────────────────────────────────────
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    chart.resize({
      timeAxis: state.timeAxis,
      samples: state.emgData.samples,
      rmsValues: state.rmsValues,
      threshold: state.threshold,
      contractions: state.contractions,
    });
  }, 100);
});

// ── Init ─────────────────────────────────────────────────────────
regenerateSignal();
