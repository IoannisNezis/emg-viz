---
tags: [emg, signal]
---

# Signal Characteristics

Surface EMG has distinctive properties that differentiate it from other biosignals like ECG or EEG.

## Amplitude

| Condition | Typical range |
|-----------|---------------|
| Resting baseline (noise floor) | 5 – 50 µV |
| Light contraction | 50 – 200 µV |
| Moderate contraction | 200 µV – 1 mV |
| Maximal voluntary contraction (MVC) | 1 – 5 mV |

Amplitude depends heavily on:
- Electrode placement relative to the muscle belly
- Skin preparation (impedance)
- Subcutaneous fat layer thickness
- Inter-electrode distance

## Frequency Content

The useful EMG bandwidth is approximately **20 – 500 Hz**.

| Band | Content |
|------|---------|
| < 20 Hz | Movement artifact, DC drift — typically filtered out |
| 20 – 80 Hz | Dominant power band for many muscles |
| 50/60 Hz | Power line interference (notch-filtered) |
| 80 – 200 Hz | Still significant energy |
| 200 – 500 Hz | Low but measurable energy |
| > 500 Hz | Essentially noise — the Nyquist limit for 1 kHz sampling |

> [!important] Sampling rate
> The Nyquist theorem requires sampling at **>= 2x** the highest frequency of interest. For EMG with energy up to 500 Hz, a sample rate of **1000 Hz** is the standard minimum. Many systems use 2000 Hz for extra headroom. Going lower (e.g., 500 Hz) loses high-frequency content; going higher (e.g., 4000 Hz) adds no useful information for surface EMG.

## Statistical Properties

- **Zero-mean**: the signal fluctuates symmetrically around zero (after DC removal)
- **Non-stationary**: amplitude envelope changes with muscle activation
- **Approximately Gaussian** during sustained contractions (Central Limit Theorem applied to many overlapping MUAPs)
- **Amplitude-modulated noise**: the "carrier" is broadband noise, the "envelope" tracks muscle force

## Noise Sources

| Source | Frequency | Mitigation |
|--------|-----------|------------|
| Power line (50/60 Hz) | Narrowband | Notch filter, differential amplification |
| Motion artifact | < 20 Hz | High-pass filter at 20 Hz |
| Electrode contact noise | Broadband, intermittent | Good skin prep, secure electrode |
| Cable movement | Low frequency | Short cables, wireless systems |
| ECG crosstalk | ~1 Hz QRS complexes | High-pass filter, or ECG template subtraction for trunk muscles |
| Quantization noise | Broadband | Adequate ADC resolution (12+ bits) |

## References

- De Luca, C.J. (2002). "Surface Electromyography: Detection and Recording." DelSys Incorporated. [PDF](https://www.delsys.com/downloads/TUTORIAL/semg-detection-and-recording.pdf)
- [SENIAM recommendations](http://www.seniam.org/) for electrode placement
- Konrad, P. (2005). *The ABC of EMG*. Noraxon. [PDF](https://www.noraxon.com/wp-content/uploads/2014/12/ABC-EMG-ISBN.pdf)
