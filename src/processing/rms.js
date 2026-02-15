/**
 * RMS (Root Mean Square) envelope calculation.
 * Uses an O(N) running-sum algorithm instead of naive O(N*W).
 */

/**
 * Convert a window size in ms to samples.
 */
export function msToSamples(ms, sampleRateHz) {
  return Math.max(1, Math.round((ms / 1000) * sampleRateHz));
}

/**
 * Calculate the RMS envelope of a signal using a sliding window.
 *
 * @param {Float64Array} samples       Input signal
 * @param {number}       windowSamples Window width in samples
 * @returns {Float64Array} RMS values (same length as input)
 */
export function calculateRMS(samples, windowSamples) {
  const n = samples.length;
  const rms = new Float64Array(n);
  const w = Math.min(windowSamples, n);
  const halfW = Math.floor(w / 2);

  // Initial sum of squares for the first window position
  let sumSq = 0;
  const firstEnd = Math.min(w, n);
  for (let i = 0; i < firstEnd; i++) {
    sumSq += samples[i] * samples[i];
  }

  // Centered sliding window
  for (let center = 0; center < n; center++) {
    const left = center - halfW;
    const right = left + w;

    // For the very first position, use the pre-computed sum
    if (center === 0) {
      // Adjust if the centered window doesn't start at 0
      // For center=0, the ideal window is [-halfW, -halfW+w)
      // but we clamp to [0, min(w, n)), which we already computed
      const clampedLeft = Math.max(0, left);
      const clampedRight = Math.min(n, right);
      const count = clampedRight - clampedLeft;
      // Recompute for first centered window
      sumSq = 0;
      for (let i = clampedLeft; i < clampedRight; i++) {
        sumSq += samples[i] * samples[i];
      }
      rms[0] = Math.sqrt(sumSq / count);
      continue;
    }

    // Slide: remove the sample leaving the window, add the sample entering
    const prevLeft = Math.max(0, (center - 1) - halfW);
    const prevRight = Math.min(n, prevLeft + w);
    const curLeft = Math.max(0, left);
    const curRight = Math.min(n, right);

    // Remove samples that left
    for (let i = prevLeft; i < curLeft; i++) {
      sumSq -= samples[i] * samples[i];
    }
    // Add samples that entered
    for (let i = prevRight; i < curRight; i++) {
      sumSq += samples[i] * samples[i];
    }

    // Guard against floating point drift
    if (sumSq < 0) sumSq = 0;

    const count = curRight - curLeft;
    rms[center] = Math.sqrt(sumSq / count);
  }

  return rms;
}
