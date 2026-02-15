---
tags: [emg, fundamentals]
---

# Electromyography (EMG)

Electromyography is the measurement of electrical activity produced by skeletal muscles. When a motor neuron fires, it triggers an action potential that propagates along muscle fibers, producing a measurable voltage change at the skin surface or within the muscle tissue.

## Two Modalities

| Type | Method | Amplitude | Use case |
|------|--------|-----------|----------|
| **Surface EMG (sEMG)** | Electrodes on the skin | 0.05 – 5 mV | Biomechanics, rehab, HCI, prosthetics |
| **Intramuscular EMG** | Needle or fine-wire inserted into muscle | up to 10 mV | Clinical diagnosis (neuropathy, myopathy) |

This project deals exclusively with **surface EMG**.

## What the Signal Represents

A surface EMG electrode picks up the superposition of many **Motor Unit Action Potentials (MUAPs)** from motor units within its detection volume. The result is a stochastic interference pattern — not a clean periodic waveform. This is why EMG looks like "structured noise" rather than a sine wave.

> [!info] Key insight
> EMG amplitude is roughly proportional to muscle force, but the relationship is non-linear and muscle-dependent. RMS amplitude is the most common proxy for force.

## Signal Chain

```
Muscle contraction
  → Motor unit action potentials
    → Volume conduction through tissue
      → Voltage at skin surface (µV–mV)
        → Amplification + ADC
          → Digital samples (what we visualize)
```

## Related Pages

- [[Signal Characteristics]]
- [[Signal Processing]]
- [[Contraction Detection]]
- [[Hardware and Devices]]
- [[Data Formats]]
- [[Synthetic Signal Generation]]
- [[Applications]]

## References

- De Luca, C.J. (1997). "The Use of Surface Electromyography in Biomechanics." *Journal of Applied Biomechanics*, 13(2), 135-163.
- [SENIAM project](http://www.seniam.org/) — European standards for sEMG sensor placement and signal processing
- Merletti, R. & Parker, P. (2004). *Electromyography: Physiology, Engineering, and Non-Invasive Applications*. Wiley-IEEE Press.
- [Wikipedia: Electromyography](https://en.wikipedia.org/wiki/Electromyography)
