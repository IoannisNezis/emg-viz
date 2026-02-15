# Sample EMG Data

Real EMG recordings for testing the analyzer. All files are open-access and require no registration.

---

## PhysioNet — Examples of Electromyograms (`emgdb`)

**Source:** https://physionet.org/content/emgdb/1.0.0/
**License:** [Open Data Commons Attribution License v1.0](https://opendatacommons.org/licenses/by/1-0/)
**Format:** Whitespace-separated, two columns: `time_s  amplitude_mV`
**Hardware:** Needle EMG of the tibialis anterior (lower leg)
**Sample rate:** 4 kHz (downsampled from 50 kHz), filtered 20 Hz HP / 5 kHz LP

| File | Subject | Condition |
|---|---|---|
| `emg_healthy.txt` | Male, 44 yo | Healthy |
| `emg_myopathy.txt` | Male, 57 yo | Polymyositis (myopathy) |
| `emg_neuropathy.txt` | Male, 62 yo | L5 radiculopathy (neuropathy) |

These three files show how EMG morphology differs across healthy, myopathic, and neuropathic muscle — a useful clinical contrast.

Contains information from the PhysioNet Examples of Electromyograms database, which is made available under the ODC Attribution License.

> Goldberger, A., Amaral, L., Glass, L., Hausdorff, J., Ivanov, P. C., Mark, R., ... & Stanley, H. E. (2000). PhysioBank, PhysioToolkit, and PhysioNet: Components of a new research resource for complex physiologic signals. *Circulation* [Online]. 101(23), pp. e215–e220. RRID:SCR_007345.

---

## UCI — EMG Data for Gestures (`emg_gestures_subject01.txt`)

**Source:** https://archive.ics.uci.edu/dataset/481/emg+data+for+gestures
**License:** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
**Format:** Tab-separated with header row
**Hardware:** Myo Thalmic armband (8 electrodes around the forearm), 200 Hz
**Columns:** `time`, `channel1`–`channel8`, `class`

This is one recording session from subject 01 of 36. The `class` column encodes the hand gesture being performed:

| Class | Gesture |
|---|---|
| 0 | Rest |
| 1 | Fist |
| 2 | Wrist flexion |
| 3 | Wrist extension |
| 4 | Radial deviation |
| 5 | Ulnar deviation |
| 6 | Extended palm |

The full dataset (all 36 subjects) is available at the UCI link above (16.9 MB ZIP).

> Krilova, N., Kastalskiy, I., Kazantsev, V., Makarov, V., & Lobov, S. (2018). EMG Data for Gestures [Dataset]. UCI Machine Learning Repository. https://doi.org/10.24432/C5ZP5C

---

## Loading in the App

The app's CSV parser handles both formats automatically:

- **PhysioNet files** — two-column, no header; the parser treats the first column as time and second as signal
- **Gestures file** — tab-separated with a header row; use the channel picker to select any of the 8 channels
