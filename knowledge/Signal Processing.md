---
tags: [emg, processing, dsp]
---

# Signal Processing

Raw EMG is difficult to interpret visually — it looks like noise with varying intensity. Signal processing extracts meaningful features from the raw signal.

## Typical Processing Pipeline

```
Raw EMG
  → DC offset removal (mean subtraction or high-pass filter)
    → Bandpass filter (20–500 Hz)
      → Notch filter (50/60 Hz, optional)
        → Feature extraction (RMS, envelope, frequency)
          → Threshold / classification
```

## Amplitude Estimation

### Full-Wave Rectification

The simplest step: take `|x(t)|`. Converts bipolar EMG into unipolar. By itself not very useful, but it's a prerequisite for linear envelope detection.

### RMS (Root Mean Square)

The gold standard for EMG amplitude estimation.

$$\text{RMS}(t) = \sqrt{\frac{1}{N} \sum_{i=0}^{N-1} x(t-i)^2}$$

- **Window size matters**: too short (< 20 ms) → noisy envelope; too long (> 500 ms) → smears out fast contractions
- **Typical window**: 50 – 200 ms, depending on the application
- **Why RMS over MAV?** RMS has a direct physical interpretation (signal power) and is less sensitive to outliers than peak detection

> [!tip] Window size tradeoff
> The window size in this app defaults to 100 ms, which is a good balance. For fast, twitchy movements (e.g., finger tapping), go down to 30–50 ms. For sustained contractions (e.g., grip force), 150–300 ms is smoother.

### Mean Absolute Value (MAV)

$$\text{MAV}(t) = \frac{1}{N} \sum_{i=0}^{N-1} |x(t-i)|$$

Computationally cheaper than RMS. Highly correlated with RMS for EMG signals. Sometimes preferred in embedded/real-time systems.

### Linear Envelope

Rectify → low-pass filter (Butterworth, 2nd–4th order, cutoff 3–10 Hz). Produces a smooth amplitude envelope. Used extensively in gait analysis and biomechanics.

## Frequency Domain

### Power Spectral Density (PSD)

Computed via FFT or Welch's method. Useful for:
- Verifying signal quality (should peak 20–150 Hz)
- Detecting **muscle fatigue** — the median frequency shifts downward during sustained contraction

### Median Frequency (MDF) and Mean Power Frequency (MPF)

- **MDF**: frequency that divides the power spectrum into two equal halves
- **MPF**: centroid of the power spectrum
- Both decrease during fatigue due to reduced motor unit firing rates and increased synchronization

## Filtering

### Bandpass (20–500 Hz)
Removes DC offset, motion artifact (low-end), and high-frequency noise above the EMG bandwidth.

### Notch Filter (50 or 60 Hz)
Removes power line interference. Use a narrow notch (Q=30–50) to minimize signal distortion. Some modern systems have sufficient CMRR to not need this.

### High-Pass Only
Some pipelines use only a high-pass at 20 Hz (4th-order Butterworth) and let the ADC's anti-aliasing filter handle the top end.

## Related Pages

- [[EMG Overview]]
- [[Contraction Detection]]
- [[Signal Characteristics]]

## References

- Phinyomark, A., Phukpattaranont, P., & Limsakul, C. (2012). "Feature Reduction and Selection for EMG Signal Classification." *Expert Systems with Applications*, 39(8), 7420-7431.
- De Luca, C.J. (2002). "Surface Electromyography: Detection and Recording." [DelSys tutorial](https://www.delsys.com/downloads/TUTORIAL/semg-detection-and-recording.pdf)
- [BioSPPy — Biosignal Processing in Python](https://biosppy.readthedocs.io/en/latest/biosppy.signals.html#module-biosppy.signals.emg)
- [OpenSignals documentation on EMG processing](http://bitalino.com/docs/)
