/**
 * Synthetic EMG signal generator.
 *
 * Generates a realistic-looking EMG signal with controllable activation bursts
 * separated by low-amplitude baseline noise.
 */

import type { Activation, EMGData } from "../types.ts";

const EMG_FREQUENCIES = [20, 40, 70, 100, 150, 200]; // Hz

/** Box-Muller transform — returns a standard-normal random value. */
function randn(): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1 || 1e-30)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Half-Hann cosine ramp of length `n` samples.
 * rampUp=true  → 0→1,  rampUp=false → 1→0
 */
function hannRamp(n: number, rampUp: boolean): Float64Array {
  const ramp = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1 || 1);
    ramp[i] = rampUp
      ? 0.5 * (1 - Math.cos(Math.PI * t))
      : 0.5 * (1 + Math.cos(Math.PI * t));
  }
  return ramp;
}

/**
 * Generate a synthetic EMG signal.
 */
export function generateEMG({
  durationMs = 5000,
  sampleRateHz = 1000,
  activations,
}: {
  durationMs?: number;
  sampleRateHz?: number;
  activations?: Activation[];
} = {}): EMGData {
  const totalSamples = Math.round((durationMs / 1000) * sampleRateHz);
  const samples = new Float64Array(totalSamples);
  const rampSamples = Math.round(0.05 * sampleRateHz); // 50 ms ramp

  // Default activations: 4 bursts at varying intensities
  const acts = activations ?? defaultActivations(durationMs);

  // 1. Fill with low-amplitude baseline noise
  const baselineAmplitude = 0.05; // V
  for (let i = 0; i < totalSamples; i++) {
    samples[i] = randn() * baselineAmplitude;
  }

  // 2. Overlay each activation burst
  for (const act of acts) {
    const startSample = Math.round((act.startMs / 1000) * sampleRateHz);
    const endSample = Math.min(
      Math.round((act.endMs / 1000) * sampleRateHz),
      totalSamples,
    );
    const burstLength = endSample - startSample;
    if (burstLength <= 0) continue;

    const amplitude = 0.5 + act.intensity * 2.5; // 0.5-3 V range
    const phases = EMG_FREQUENCIES.map(() => Math.random() * 2 * Math.PI);

    // onset / offset ramps
    const rampLen = Math.min(rampSamples, Math.floor(burstLength / 2));
    const onset = hannRamp(rampLen, true);
    const offset = hannRamp(rampLen, false);

    for (let i = 0; i < burstLength; i++) {
      const idx = startSample + i;
      if (idx >= totalSamples) break;

      const t = idx / sampleRateHz; // time in seconds
      let signal = 0;
      for (let f = 0; f < EMG_FREQUENCIES.length; f++) {
        signal +=
          Math.sin(2 * Math.PI * EMG_FREQUENCIES[f] * t + phases[f]) *
          (1 / EMG_FREQUENCIES.length);
      }
      signal = (signal + randn() * 0.3) * amplitude;

      // apply ramp envelope
      let env = 1;
      if (i < rampLen) env = onset[i];
      else if (i >= burstLength - rampLen) env = offset[i - (burstLength - rampLen)];

      samples[idx] += signal * env;
    }
  }

  return { samples, sampleRateHz, durationMs };
}

function defaultActivations(durationMs: number): Activation[] {
  // Scale burst count so duty cycle stays ~25-35% regardless of duration
  const count = Math.max(2, Math.round(durationMs / 1500));
  const maxBurstMs = Math.min(400, durationMs / (count * 3)); // leave ≥2/3 as rest
  const minBurstMs = Math.min(120, maxBurstMs * 0.4);
  const gap = durationMs / (count + 1);

  const acts: Activation[] = [];
  for (let i = 0; i < count; i++) {
    const center = gap * (i + 1);
    const halfDur = minBurstMs + Math.random() * (maxBurstMs - minBurstMs);
    acts.push({
      startMs: Math.max(0, center - halfDur),
      endMs: Math.min(durationMs, center + halfDur),
      intensity: 0.3 + Math.random() * 0.7,
    });
  }
  return acts;
}

/**
 * Generate a time axis array in milliseconds.
 */
export function generateTimeAxis(sampleCount: number, sampleRateHz: number): Float64Array {
  const time = new Float64Array(sampleCount);
  const dtMs = 1000 / sampleRateHz;
  for (let i = 0; i < sampleCount; i++) {
    time[i] = i * dtMs;
  }
  return time;
}
