---
tags: [emg, data, formats]
---

# Data Formats

Every EMG system has its own native format, but **CSV is the universal interchange format** — every major system can export to it. This is why the parser in this project targets CSV.

## CSV Conventions Across Devices

There is no single CSV standard for EMG. However, most exports follow a common pattern:

```
[optional comment/metadata header lines]
[column name header row]
[data rows: timestamp/index, channel1, channel2, ...]
```

### Comment Headers

| Prefix | Used by |
|--------|---------|
| `#` | BITalino/OpenSignals, many scientific tools |
| `%` | MATLAB exports |
| `//` | Some custom systems |

Header comments typically contain:
- Device name / serial number
- Sample rate (the most important metadata)
- Channel names and units
- Recording date/time
- Firmware version

### Sample Rate Patterns in Headers

The parser needs to recognize several patterns:

```
# "sampling_rate": 1000      ← BITalino JSON-style
# Sample Rate = 1000          ← Delsys-style
# 1000 Hz                     ← Generic
# Fs = 1000                   ← MATLAB convention
```

### Delimiters

| Delimiter | Used by |
|-----------|---------|
| **Tab** | BITalino/OpenSignals, Delsys EMGworks, many lab systems |
| **Comma** | Generic CSV, OpenBCI GUI, most spreadsheet exports |
| **Semicolon** | Some European locale exports (where comma = decimal separator) |

### Column Structure Examples

#### BITalino / OpenSignals
```
# {json metadata with sample_rate, channels, etc.}
nSeq	DI0	DI1	DI2	DI3	AI1	AI2	AI3
0	0	0	1	0	512	489	501
1	0	0	1	0	515	492	498
```
- `nSeq` = sequence number (index)
- `DI0–DI3` = digital inputs
- `AI1–AI3` = analog channels (raw ADC values)

#### Delsys
```
X[s]	Trigno IM sensor 1: EMG 1 (V)	Trigno IM sensor 2: EMG 2 (V)
0.0000	0.000031	-0.000012
0.0005	0.000045	0.000008
```

#### OpenBCI GUI
```
Sample Index, EXG Channel 0, EXG Channel 1, ..., Timestamp
0, 0.00234, 0.00156, ..., 1623456789.123
1, 0.00267, 0.00178, ..., 1623456789.127
```

#### Generic / Hand-recorded
```
time_ms,emg_mv
0,0.05
1,0.12
2,0.45
```

## Other Formats

### EDF / EDF+ (European Data Format)

- Binary format, standardized for biosignals
- Stores header metadata + 16-bit integer samples
- Widely used in polysomnography, EEG, and some EMG systems
- Libraries: [pyEDFlib](https://github.com/holgern/pyedflib), [edflib](https://www.teuniz.net/edflib/)

### C3D

- Binary format from the motion capture world
- Stores analog (EMG, force plates) + 3D marker data together
- Used by Vicon, Qualisys, Noraxon
- Library: [c3d.org](https://www.c3d.org/)

### HDF5

- Hierarchical binary format
- Used by BITalino (optional export), some research labs
- Very efficient for large datasets
- Library: [h5py](https://www.h5py.org/)

### BDF / BDF+

- BioSemi Data Format (24-bit variant of EDF)
- Used by OpenBCI
- Higher resolution than EDF

### MATLAB (.mat)

- MATLAB's native binary format
- Very common in academic EMG research
- Can be read in Python via `scipy.io.loadmat()`

### LSL (Lab Streaming Layer)

- Not a file format but a **real-time streaming protocol**
- Many devices support LSL for live data
- Can be recorded to XDF files
- Library: [pylsl](https://github.com/labstreaminglayer/liblsl-Python)

> [!tip] Why CSV first
> Despite being less efficient than binary formats, CSV is the pragmatic choice for a web-based visualizer because:
> 1. Every device exports it
> 2. Trivially parseable in JavaScript (no binary decoding)
> 3. Users can inspect/edit it in a text editor
> 4. No library dependencies needed

## Related Pages

- [[Hardware and Devices]]
- [[Signal Characteristics]]

## References

- [EDF specification](https://www.edfplus.info/specs/edf.html)
- [C3D file format](https://www.c3d.org/HTML/default.htm)
- [OpenSignals file formats](http://bitalino.com/docs/)
- [Lab Streaming Layer](https://labstreaminglayer.readthedocs.io/)
- [OpenBCI data format docs](https://docs.openbci.com/Cyton/CytonDataFormat/)
