---
tags: [emg, processing, detection]
---

# Contraction Detection

Detecting when a muscle is "on" vs "off" is one of the most common EMG analysis tasks. It amounts to a binary segmentation problem: find the onset and offset times of muscle activations.

## Threshold-Based Methods

The simplest and most widely used approach. Compare a smoothed amplitude signal (usually RMS) against a threshold.

### Single Threshold

```
contraction = RMS(t) > threshold
```

The challenge is choosing the threshold. Common strategies:

#### Multiplier of Median RMS

```
threshold = k × median(RMS)
```

- **k = 2–3** is typical
- Median is robust to activation bursts (unlike mean)
- Works well when signal has a clear noise floor
- This is the "× Median" method in this app

#### Median + k·MAD (Median Absolute Deviation)

```
MAD = median(|RMS - median(RMS)|)
threshold = median(RMS) + k × MAD
```

- **k = 3–5** is typical
- More statistically principled — MAD is a robust measure of spread
- Adapts to the noise distribution, not just its center
- Better for signals with variable noise levels

#### Fixed Percentage of MVC

```
threshold = p × RMS_mvc
```

- Requires a calibration contraction (Maximum Voluntary Contraction)
- **p = 5–15%** of MVC is common for onset detection
- Standard in clinical research but requires per-session calibration

#### Visual / Manual

The researcher eyeballs the signal and sets a threshold by dragging. Surprisingly common in practice. This app supports it via drag interaction on the chart.

### Double Threshold

Uses two thresholds to prevent chattering:
- **Onset**: signal must exceed `T_high` for at least `t_min` milliseconds
- **Offset**: signal must fall below `T_low` for at least `t_min` milliseconds

This hysteresis approach is more robust but adds latency.

## Advanced Methods

### Teager-Kaiser Energy Operator (TKEO)

$$\Psi[x(n)] = x(n)^2 - x(n-1) \cdot x(n+1)$$

- Sensitive to both amplitude and frequency changes simultaneously
- Better temporal resolution than RMS for sharp onsets
- Used as a preprocessor before thresholding

### Statistical Change-Point Detection

- **CUSUM** (Cumulative Sum): detects shifts in the mean of a signal
- **MOSUM** (Moving Sum): variant with a sliding window
- **Bayesian online changepoint detection**: probabilistic, handles multiple changepoints

### Machine Learning

- **HMM** (Hidden Markov Models): model rest/active as hidden states
- **SVM / Random Forest**: classify windows as active/rest using feature vectors
- **Deep learning (CNN/LSTM)**: end-to-end onset detection, requires labeled training data

> [!note] Practical reality
> For most applications, threshold-on-RMS with a median-based threshold works well enough. The fancier methods help when dealing with low SNR signals, co-contracting muscles, or when millisecond-level timing precision matters (e.g., reaction time studies).

## Post-Processing

After initial detection, common cleanup steps:

1. **Minimum duration**: reject activations shorter than ~30–50 ms (likely noise)
2. **Minimum gap**: merge activations separated by less than ~30–50 ms (likely a single contraction with a brief dip)
3. **Debouncing / hysteresis**: prevent rapid on/off toggling near the threshold

## Metrics Extracted from Contractions

| Metric | Description |
|--------|-------------|
| **Onset time** | When the contraction begins |
| **Offset time** | When the contraction ends |
| **Duration** | Offset - onset |
| **Peak RMS** | Maximum amplitude during the contraction |
| **Mean RMS** | Average amplitude during the contraction |
| **Time to peak** | Onset to peak amplitude |
| **Area under curve** | Integral of RMS over contraction duration (impulse) |
| **Duty cycle** | Total active time / total recording time |

## Related Pages

- [[Signal Processing]]
- [[Signal Characteristics]]
- [[Applications]]

## References

- Hodges, P.W. & Bui, B.H. (1996). "A comparison of computer-based methods for the determination of onset of muscle contraction using electromyography." *Electroencephalography and Clinical Neurophysiology*, 101(6), 511-519.
- Solnik, S., Rider, P., Steinweg, K., DeVita, P., & Hortobagyi, T. (2010). "Teager-Kaiser energy operator signal conditioning improves EMG onset detection." *European Journal of Applied Physiology*, 110(3), 489-498.
- Staude, G. & Wolf, W. (1999). "Objective motor response onset detection in surface myoelectric signals." *Medical Engineering & Physics*, 21(6-7), 449-467.
