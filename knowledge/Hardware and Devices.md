---
tags: [emg, hardware]
---

# Hardware and Devices

EMG acquisition systems range from clinical-grade research equipment to hobbyist-friendly boards.

## Research / Clinical Grade

### Delsys Trigno

- **Type**: Wireless surface EMG
- **Channels**: up to 16 EMG + IMU per sensor
- **Sample rate**: up to 4000 Hz (EMG), 148 Hz (IMU)
- **Resolution**: 16-bit
- **Bandwidth**: 20–450 Hz (built-in filtering)
- **Software**: EMGworks, exports to CSV/C3D/MATLAB
- **Price range**: $10k–$50k+
- **Website**: [delsys.com](https://delsys.com)

> [!info] Delsys CSV format
> Exports typically have a multi-line header with metadata (sample rate, channel names, units), followed by tab-delimited data columns. First column is usually time in seconds.

### Noraxon

- **Type**: Wireless or wired
- **Channels**: up to 16
- **Sample rate**: 1000–3000 Hz
- **Software**: MR3 (myoMOTION, myoMUSCLE)
- **Export**: CSV, C3D
- **Website**: [noraxon.com](https://noraxon.com)

### OT Bioelettronica

- **Type**: High-density sEMG (HD-EMG) grids
- **Channels**: 64–256 channels
- **Sample rate**: up to 10240 Hz
- **Use case**: motor unit decomposition, muscle mapping
- **Website**: [otbioelettronica.it](https://www.otbioelettronica.it)

## Affordable / Education

### BITalino

- **Type**: Wired biosignal acquisition board
- **Channels**: up to 6 analog
- **Sample rate**: 1, 10, 100, or 1000 Hz (configurable)
- **Resolution**: 10-bit
- **Bandwidth**: 25–480 Hz
- **Software**: OpenSignals (r)evolution
- **Export**: CSV, HDF5, EDF
- **Price**: ~$200 (board + EMG sensor)
- **Website**: [bitalino.com](https://bitalino.com)

> [!info] BITalino/OpenSignals CSV format
> Header lines prefixed with `#` containing JSON metadata (device info, sample rate, channel labels). Tab-delimited data. First column is a sequence number (nSeq), followed by digital I/O, then analog channels. The EMG channel is typically one of the analog columns (A1–A6). Values are raw ADC counts (0–1023 for 10-bit), not voltage. Conversion: `EMG(mV) = (ADC / 2^n - 0.5) * VCC / Gain`.

### OpenBCI

- **Type**: Open-source EEG/EMG/ECG board
- **Models**: Cyton (8ch), Ganglion (4ch), Daisy (16ch)
- **Sample rate**: 250 Hz (Ganglion), 250 Hz (Cyton, configurable)
- **Resolution**: 24-bit (ADS1299 chip)
- **Software**: OpenBCI GUI, BrainFlow
- **Export**: CSV (via GUI), BDF, LSL stream
- **Price**: $200–$1000
- **Website**: [openbci.com](https://openbci.com)

> [!warning] OpenBCI for EMG
> OpenBCI's default sample rate of 250 Hz is below the recommended 1000 Hz for EMG. It works for slow/sustained contractions but misses high-frequency content. The 24-bit resolution partially compensates by giving excellent amplitude resolution.

### Myoware (SparkFun / Advancer Technologies)

- **Type**: Single-channel analog EMG sensor
- **Output**: Analog voltage (raw or rectified+filtered)
- **Interface**: Connect to any ADC (Arduino, etc.)
- **Sample rate**: determined by your ADC
- **Price**: ~$40
- **Website**: [myoware.com](https://myoware.com)
- **Good for**: learning, prototyping, simple on/off detection

## Consumer / Wearable

### Thalmic Myo Armband (discontinued)

- 8-channel dry electrode sEMG
- 200 Hz sample rate
- IMU included
- Was popular for gesture recognition research
- Raw EMG accessible via SDK

### CTRL-Labs / Meta Neural Interface

- High-density EMG wristband
- Not commercially available (acquired by Meta/Facebook in 2019)
- Research into neural interface for AR/VR input

## Electrode Types

| Type | Description | Pros | Cons |
|------|-------------|------|------|
| **Wet Ag/AgCl** | Gel-based, disposable | Low impedance, gold standard | Skin prep needed, dries out |
| **Dry** | Metal or conductive rubber | No gel, reusable | Higher impedance, motion artifact |
| **Textile** | Conductive fabric in garments | Comfortable for long wear | Variable contact, lower SNR |
| **HD-EMG grid** | Dense 2D array (4–8 mm spacing) | Spatial resolution | Expensive, complex setup |

## Related Pages

- [[Data Formats]]
- [[Signal Characteristics]]
- [[EMG Overview]]

## References

- [BITalino documentation](http://bitalino.com/docs/)
- [OpenBCI documentation](https://docs.openbci.com/)
- [Delsys Trigno system](https://delsys.com/trigno/)
- [BrainFlow — universal biosignal API](https://brainflow.org/)
- [SENIAM sensor placement guidelines](http://www.seniam.org/)
