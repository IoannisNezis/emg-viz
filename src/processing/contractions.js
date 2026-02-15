/**
 * Contraction detection and summary statistics.
 */

/**
 * Detect muscle contractions by thresholding the RMS envelope.
 *
 * @param {Float64Array} rmsValues    RMS envelope
 * @param {number}       threshold    Threshold in V
 * @param {number}       sampleRateHz Sample rate
 * @param {number}       minDurationMs Minimum contraction duration to keep (default 50)
 * @returns {Array<{onsetMs: number, offsetMs: number, durationMs: number, peakRms: number}>}
 */
export function detectContractions(
  rmsValues,
  threshold,
  sampleRateHz,
  minDurationMs = 50,
) {
  const contractions = [];
  const dtMs = 1000 / sampleRateHz;
  let inContraction = false;
  let onsetIdx = 0;
  let peakRms = 0;

  for (let i = 0; i < rmsValues.length; i++) {
    const v = rmsValues[i];
    if (!inContraction && v >= threshold) {
      inContraction = true;
      onsetIdx = i;
      peakRms = v;
    } else if (inContraction) {
      if (v > peakRms) peakRms = v;
      if (v < threshold || i === rmsValues.length - 1) {
        inContraction = false;
        const onsetMs = onsetIdx * dtMs;
        const offsetMs = i * dtMs;
        const durationMs = offsetMs - onsetMs;
        if (durationMs >= minDurationMs) {
          contractions.push({ onsetMs, offsetMs, durationMs, peakRms });
        }
        peakRms = 0;
      }
    }
  }

  return contractions;
}

/**
 * Compute summary statistics from detected contractions and the RMS envelope.
 */
export function computeStats(contractions, rmsValues) {
  const n = rmsValues.length;
  let sumRms = 0;
  let maxRms = 0;
  for (let i = 0; i < n; i++) {
    sumRms += rmsValues[i];
    if (rmsValues[i] > maxRms) maxRms = rmsValues[i];
  }
  const meanRms = sumRms / n;

  let totalDuration = 0;
  let peakRms = 0;
  for (const c of contractions) {
    totalDuration += c.durationMs;
    if (c.peakRms > peakRms) peakRms = c.peakRms;
  }

  const totalMs = (n / 1000) * 1000; // approximate
  const dutyCyclePercent =
    totalMs > 0 ? (totalDuration / totalMs) * 100 : 0;

  return {
    contractionCount: contractions.length,
    averageDurationMs:
      contractions.length > 0 ? totalDuration / contractions.length : 0,
    peakRms,
    meanRms,
    dutyCyclePercent,
  };
}
