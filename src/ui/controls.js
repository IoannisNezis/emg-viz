/**
 * Build the control bar UI.
 */

const METHODS = {
  median: { label: "× Median", min: 1.2, max: 5, step: 0.1, default: 2 },
  mad: { label: "Median + k·MAD", min: 1, max: 10, step: 0.5, default: 3 },
  manual: { label: "Manual (drag)", min: 0, max: 0, step: 0, default: 0 },
};

export function buildControls(
  container,
  { windowSizeMs, durationMs, thresholdMethod, thresholdValue, onWindowSizeChange, onThresholdSettingChange, onDurationChange, onRegenerate },
) {
  container.innerHTML = `
    <div class="flex items-center gap-2">
      <label class="text-xs text-slate-400" for="rms-window">RMS Window</label>
      <input
        id="rms-window"
        type="range"
        min="20"
        max="500"
        step="10"
        value="${windowSizeMs}"
        class="w-28 accent-amber-500"
      />
      <span id="rms-window-val" class="text-xs text-slate-300 w-12">${windowSizeMs} ms</span>
    </div>

    <div class="flex items-center gap-2">
      <label class="text-xs text-slate-400" for="threshold-method">Threshold</label>
      <select
        id="threshold-method"
        class="rounded bg-slate-700 text-xs text-slate-200 px-2 py-1 border border-slate-600"
      >
        <option value="median" ${thresholdMethod === "median" ? "selected" : ""}>× Median</option>
        <option value="mad" ${thresholdMethod === "mad" ? "selected" : ""}>Median + k·MAD</option>
        <option value="manual" ${thresholdMethod === "manual" ? "selected" : ""}>Manual (drag)</option>
      </select>
    </div>

    <div id="threshold-slider-group" class="flex items-center gap-2">
      <input
        id="threshold-value"
        type="range"
        min="${METHODS[thresholdMethod].min}"
        max="${METHODS[thresholdMethod].max}"
        step="${METHODS[thresholdMethod].step}"
        value="${thresholdValue}"
        class="w-32 accent-red-500"
      />
      <span id="threshold-value-label" class="text-xs text-slate-300 w-16"></span>
    </div>

    <div class="flex items-center gap-2">
      <label class="text-xs text-slate-400" for="duration-select">Duration</label>
      <select
        id="duration-select"
        class="rounded bg-slate-700 text-xs text-slate-200 px-2 py-1 border border-slate-600"
      >
        <option value="3000" ${durationMs === 3000 ? "selected" : ""}>3 s</option>
        <option value="5000" ${durationMs === 5000 ? "selected" : ""}>5 s</option>
        <option value="10000" ${durationMs === 10000 ? "selected" : ""}>10 s</option>
      </select>
    </div>

    <button
      id="btn-regenerate"
      class="rounded bg-sky-600 hover:bg-sky-500 text-xs font-medium text-white px-3 py-1.5 transition-colors"
    >
      Generate New Signal
    </button>
  `;

  const methodSelect = container.querySelector("#threshold-method");
  const sliderGroup = container.querySelector("#threshold-slider-group");
  const slider = container.querySelector("#threshold-value");
  const label = container.querySelector("#threshold-value-label");

  function updateSliderVisibility(method) {
    if (method === "manual") {
      sliderGroup.classList.add("hidden");
    } else {
      sliderGroup.classList.remove("hidden");
      const cfg = METHODS[method];
      slider.min = cfg.min;
      slider.max = cfg.max;
      slider.step = cfg.step;
      slider.value = cfg.default;
    }
  }

  function updateLabel(method, value) {
    if (method === "median") {
      label.textContent = `${value}×`;
    } else if (method === "mad") {
      label.textContent = `k = ${value}`;
    }
  }

  // Initial state
  updateSliderVisibility(thresholdMethod);
  updateLabel(thresholdMethod, thresholdValue);

  // RMS window
  const rmsSlider = container.querySelector("#rms-window");
  const rmsVal = container.querySelector("#rms-window-val");
  rmsSlider.addEventListener("input", (e) => {
    const v = Number(e.target.value);
    rmsVal.textContent = `${v} ms`;
    onWindowSizeChange(v);
  });

  // Threshold method change
  methodSelect.addEventListener("change", (e) => {
    const method = e.target.value;
    updateSliderVisibility(method);
    const value = method === "manual" ? 0 : METHODS[method].default;
    updateLabel(method, value);
    onThresholdSettingChange(method, value);
  });

  // Threshold value slider
  slider.addEventListener("input", (e) => {
    const value = Number(e.target.value);
    const method = methodSelect.value;
    updateLabel(method, value);
    onThresholdSettingChange(method, value);
  });

  // Duration
  container.querySelector("#duration-select").addEventListener("change", (e) => {
    onDurationChange(Number(e.target.value));
  });

  // Regenerate
  container.querySelector("#btn-regenerate").addEventListener("click", onRegenerate);

  return {
    setMethod(method) {
      methodSelect.value = method;
      updateSliderVisibility(method);
    },
  };
}
