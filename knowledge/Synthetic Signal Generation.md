---
tags: [emg, simulation, signal]
---

# Synthetic Signal Generation

Generating artificial EMG signals is useful for testing analysis pipelines, teaching, and UI development when real hardware isn't available. The goal is a signal that *looks and behaves* like real surface EMG — not a physically accurate simulation of motor unit physiology.

## Why Synthetic EMG?

- **No hardware needed** — anyone can explore the app immediately
- **Ground truth** — you know exactly when contractions occur, so you can verify that detection algorithms work
- **Controlled parameters** — vary duration, intensity, noise level independently
- **Reproducibility** — unlike real recordings, you can regenerate signals with known properties

## How Real EMG Arises (Simplified)

In a real muscle, many motor units fire asynchronously. Each produces a Motor Unit Action Potential (MUAP) that propagates along muscle fibers. The surface electrode picks up the superposition of hundreds of these overlapping waveforms, filtered by volume conduction through tissue.

The result is a **stochastic interference pattern** — broadband, zero-mean, roughly Gaussian during sustained contraction, with energy concentrated in the 20–500 Hz band.

## The Model Used in This App

The generator in `src/data/emg-generator.js` takes a pragmatic shortcut. Instead of simulating individual motor units, it builds a signal that has the right *statistical and spectral properties*:

```
signal(t) = baseline_noise(t) + Σ activation_burst(t)
```

### 1. Baseline Noise

A low-amplitude Gaussian noise floor present throughout the recording, representing the resting-state EMG + sensor noise.

```js
samples[i] = randn() * 0.05  // ~50 µV baseline
```

The Gaussian samples come from the **Box-Muller transform** — a method that converts two uniform random numbers into a standard normal value:

$$z = \sqrt{-2 \ln u_1} \cdot \cos(2\pi u_2)$$

This is a standard technique. It's used here because `Math.random()` only gives uniform distributions, and EMG baseline noise is approximately Gaussian.

### 2. Activation Bursts

Each contraction is modeled as a burst of structured noise with higher amplitude. The burst signal at each sample is:

```
burst(t) = (sinusoid_sum(t) + noise(t)) × amplitude × envelope(t)
```

#### Sinusoid Sum

Six sine waves at EMG-relevant frequencies — `[20, 40, 70, 100, 150, 200]` Hz — with random phases, summed with equal weight:

```js
signal += sin(2π × freq × t + phase) × (1/6)
```

This creates a signal with energy spread across the EMG bandwidth. It's a rough approximation — real EMG has a continuous power spectrum, not discrete lines — but after adding noise and windowing, the visual result is convincing.

> [!note] Why these frequencies?
> They span the dominant surface EMG range (20–200 Hz). The choice of 6 discrete frequencies is arbitrary but produces a waveform with enough structure to look like interference-pattern EMG rather than pure white noise.

#### Gaussian Noise Component

Additional Gaussian noise (`randn() * 0.3`) is mixed into each burst to break up the regularity of the sinusoids and make the signal look more stochastic — closer to real EMG.

#### Amplitude Scaling

Each burst has an `intensity` parameter (0–1) that maps to an amplitude range of 0.5–3 V:

```js
amplitude = 0.5 + intensity * 2.5
```

This mimics the variation you'd see in real contractions — some are gentle, some are forceful.

### 3. Onset/Offset Envelope (Hann Ramp)

Real muscle contractions don't switch on and off instantly. Force (and EMG amplitude) ramps up and ramps down over tens of milliseconds. The generator applies a **half-Hann window** as an envelope:

$$\text{ramp}(t) = \frac{1}{2}\left(1 - \cos\left(\pi \cdot \frac{t}{T}\right)\right)$$

- **Onset**: 0 → 1 over 50 ms (smooth fade-in)
- **Offset**: 1 → 0 over 50 ms (smooth fade-out)

The Hann window is chosen because it produces a smooth, natural-looking transition with no discontinuities — the same reason it's used in spectral analysis windowing.

### 4. Activation Timing

The default activation pattern distributes bursts evenly across the recording duration with some randomization:

- **Count**: scales with duration (~1 burst per 1.5 seconds)
- **Duty cycle**: targets 25–35% (realistic for cyclical tasks)
- **Duration**: randomized between ~120–400 ms per burst
- **Intensity**: randomized between 0.3–1.0

## Limitations of This Model

| Aspect | Real EMG | This model |
|--------|----------|------------|
| Spectral shape | Continuous, peaks 20–150 Hz, rolls off | Discrete lines at 6 frequencies + noise |
| Amplitude distribution | Approximately Gaussian | Sum of sinusoids + Gaussian — close enough |
| Motor unit recruitment | Progressive, rate-coded | Not modeled (flat amplitude within burst) |
| Fatigue effects | Amplitude and frequency shift over time | Not modeled |
| Crosstalk | Present from adjacent muscles | Not modeled |
| Motion artifact | Low-frequency bursts | Not modeled |

For the purpose of this app — testing visualization and threshold detection — these limitations don't matter. The synthetic signal has the right amplitude range, frequency content, and burst structure to exercise the analysis pipeline.

## More Realistic Approaches

For research requiring physiologically accurate synthetic EMG:

- **Motor unit models**: simulate individual motor units with recruitment curves, firing rate modulation, and MUAP shape libraries. See Fuglevand et al. (1993).
- **EMG from musculoskeletal simulation**: tools like OpenSim can generate EMG-like activation patterns from biomechanical models.
- **Recorded template replay**: take a real EMG recording and modify it (scale amplitude, shift timing) to create ground-truth variants.

## Related Pages

- [[EMG Overview]]
- [[Signal Characteristics]]
- [[Signal Processing]]

## References

- Fuglevand, A.J., Winter, D.A., & Patla, A.E. (1993). "Models of recruitment and rate coding organization in motor-unit pools." *Journal of Neurophysiology*, 70(6), 2470-2488.
- [Box-Muller transform — Wikipedia](https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform)
- [Hann window — Wikipedia](https://en.wikipedia.org/wiki/Hann_function)
- De Luca, C.J. (1979). "Physiology and Mathematics of Myoelectric Signals." *IEEE Transactions on Biomedical Engineering*, BME-26(6), 313-325.
