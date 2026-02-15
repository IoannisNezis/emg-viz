---
tags: [emg, pitfalls]
---

# Limitations and Pitfalls

Things that can go wrong with EMG, and what I'd flag as common misinterpretations.

## Signal Quality Issues

### Crosstalk

Adjacent muscles "bleed" signal into each other through volume conduction. A surface electrode over the biceps will also pick up some brachialis and brachioradialis activity.

**Mitigation**: Smaller electrodes, shorter inter-electrode distance, double-differential configurations, HD-EMG with spatial filtering.

**My belief**: For most practical applications (biofeedback, gesture recognition, ergonomics), crosstalk is an accepted limitation. It only becomes a serious problem when you need to isolate individual muscle contributions for biomechanical modeling.

### Movement Artifact

Large, low-frequency signals caused by electrode-skin interface shifting during movement. Can dwarf the actual EMG signal.

**Mitigation**: High-pass filter at 20 Hz (or even 30 Hz for dynamic activities), secure electrode attachment, skin preparation.

### Amplitude Normalization

Raw EMG amplitude is **not comparable** across:
- Different subjects (skin, fat, muscle size differ)
- Different sessions (electrode placement varies)
- Different muscles (signal amplitude varies widely)

**Solution**: Normalize to Maximum Voluntary Contraction (%MVC). Without this, you cannot say "subject A activated 50% harder than subject B."

> [!warning] Common mistake
> Comparing raw EMG amplitudes between subjects or sessions without normalization is one of the most frequent errors in EMG research. The numbers are meaningless without a reference.

## Analysis Pitfalls

### RMS Window Size

Too small → noisy envelope that crosses the threshold erratically → false contraction detections.
Too large → smears onset/offset timing → missed brief contractions.

There is no universally correct window size. It depends on the application.

### Threshold Sensitivity

A fixed threshold works poorly when:
- Baseline noise level changes during the recording (electrode dries out, subject shifts)
- Contraction intensity varies widely (a weak contraction may not cross the threshold set for strong ones)
- Multiple muscles are co-contracting

### Fatigue Effects

During sustained or repeated contractions:
- Amplitude may increase (recruitment of additional motor units) or decrease (peripheral fatigue)
- Frequency content shifts downward
- A threshold set at the start of a recording may be wrong by the end

### Stationarity Assumption

Most processing methods (FFT, fixed thresholds) assume the signal is stationary within analysis windows. EMG is fundamentally **non-stationary** — its statistical properties change as the muscle activates and fatigues. Short analysis windows (< 250 ms) help, but don't eliminate this issue.

## What This App Doesn't Do

Being explicit about limitations of the current implementation:

- **No filtering**: raw samples are used as-is. If the uploaded data has motion artifact or power line noise, it will be visible.
- **No MVC normalization**: amplitudes are absolute, not %MVC.
- **No frequency analysis**: no PSD, no median frequency, no fatigue tracking.
- **No multi-muscle analysis**: one channel at a time, no co-activation or synergy analysis.
- **No statistical export**: detected contractions aren't exportable to a file.

These are all reasonable future enhancements but are out of scope for the current version.

## Related Pages

- [[Signal Processing]]
- [[Contraction Detection]]
- [[Signal Characteristics]]

## References

- Farina, D., Merletti, R., & Enoka, R.M. (2004). "The extraction of neural strategies from the surface EMG." *Journal of Applied Physiology*, 96(4), 1486-1495.
- Burden, A. (2010). "How should we normalize electromyograms obtained from healthy participants?" *Clinical Biomechanics*, 25(2), 159-165.
- De Luca, C.J. (1997). "The use of surface electromyography in biomechanics." *Journal of Applied Biomechanics*.
