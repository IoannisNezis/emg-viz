# EMG Analyzer

A browser-based tool for visualizing and analyzing EMG (electromyography) signals. Load a CSV recording from real hardware or explore with synthetic generated data — the app computes the RMS envelope in real time, detects muscle contractions via adaptive thresholding, and shows summary statistics.

> **This is an experimental project built with AI assistance (Claude).** It is not professionally developed medical or research software. Do not use it for clinical decisions. It exists for learning, prototyping, and exploring EMG signal processing concepts.

<img width="1272" height="744" alt="20260215_23h14m37s_grim" src="https://github.com/user-attachments/assets/eb70625a-5990-4710-bae8-f5c51cd94385" />

## What is EMG?

When you flex a muscle, your motor neurons fire electrical impulses that travel along muscle fibers. An EMG sensor on the skin picks up the combined electrical activity as a noisy, burst-like voltage signal. Analyzing that signal tells you *when* a muscle contracted, *how hard*, and *for how long*.

This app takes that raw signal — either from a file or generated synthetically — and runs a basic but functional analysis pipeline on it, entirely in the browser.

## Features

**Signal input**
- Synthetic EMG generator with configurable duration (3/5/10 s) and randomized contraction patterns
- CSV file upload supporting common EMG hardware exports (Delsys, BITalino, OpenBCI, etc.)
- Auto-detects sample rate, delimiter (comma/tab), and column structure from uploaded files
- Multi-channel support with a channel picker dropdown

**Processing**
- RMS (Root Mean Square) envelope with adjustable window size (20–500 ms)
- Three threshold modes for contraction detection: multiplier of median, median + k*MAD, or manual drag
- Contraction segmentation with onset/offset detection

**Visualization**
- Raw EMG waveform overlaid with the RMS envelope (D3.js)
- Threshold line — draggable for manual adjustment
- Highlighted contraction regions
- Interactive legend to toggle layers
- Responsive layout, resizes with the window

**Statistics panel**
- Number of detected contractions
- Mean and max contraction duration
- Mean and peak RMS amplitude
- Current threshold value

## Quick Start

```sh
npm install
npm run dev
```

Opens at `http://localhost:5173`. The app loads immediately with a synthetic EMG signal. Click **Upload CSV** to load your own data.

## CSV Format

The parser handles the common variations across EMG hardware:

- **Comment headers** prefixed with `#`, `%`, or `//` (metadata like sample rate)
- **Comma or tab** delimiters (auto-detected)
- **Column headers** (auto-detected from first non-numeric row)
- **Sample rate** extracted from headers when present, defaults to 1000 Hz
- **Index columns** (sequential 0,1,2,... or 1,2,3,...) are automatically excluded from channel selection

Works out of the box with exports from BITalino/OpenSignals, Delsys EMGworks, OpenBCI GUI, and generic CSV files from any recording system.

## Project Structure

```
src/
  main.ts              App entry, state management, event wiring
  types.ts             Shared TypeScript type definitions
  data/
    emg-generator.ts   Synthetic EMG signal generation
    csv-parser.ts      CSV file parser with format auto-detection
  processing/
    rms.ts             RMS envelope computation
    contractions.ts    Threshold-based contraction detection + statistics
  viz/
    chart.ts           Main chart controller (D3.js)
    waveform.ts        Raw EMG trace rendering
    envelope.ts        RMS envelope overlay
    threshold.ts       Draggable threshold line
    regions.ts         Contraction highlight regions
    scales.ts          D3 scale construction
    legend.ts          Interactive legend
  ui/
    layout.ts          Page structure
    controls.ts        Control bar (sliders, buttons, dropdowns)
    stats.ts           Statistics cards
```

## `knowledge/` Directory

The [`knowledge/`](./knowledge/) folder contains structured notes on EMG analysis written in Obsidian-flavored markdown. It covers the domain knowledge behind this project:

- **[EMG Overview](./knowledge/EMG%20Overview.md)** — what electromyography is and how it works
- **[Signal Characteristics](./knowledge/Signal%20Characteristics.md)** — amplitude, frequency content, noise sources
- **[Signal Processing](./knowledge/Signal%20Processing.md)** — RMS, filtering, frequency analysis
- **[Contraction Detection](./knowledge/Contraction%20Detection.md)** — thresholding methods, advanced approaches
- **[Hardware and Devices](./knowledge/Hardware%20and%20Devices.md)** — Delsys, BITalino, OpenBCI, electrode types
- **[Data Formats](./knowledge/Data%20Formats.md)** — CSV conventions, EDF, C3D, and others
- **[Muscle Anatomy for EMG](./knowledge/Muscle%20Anatomy%20for%20EMG.md)** — common muscles, electrode placement
- **[Synthetic Signal Generation](./knowledge/Synthetic%20Signal%20Generation.md)** — how the demo signal is built and why
- **[Limitations and Pitfalls](./knowledge/Limitations%20and%20Pitfalls.md)** — crosstalk, normalization, common mistakes

These notes are useful both as project documentation and as a standalone reference for anyone learning about EMG.

## Docker

Build and run the app in a container:

```sh
docker build -t emg-viz .
docker run -p 8080:80 emg-viz
```

Opens at `http://localhost:8080`.

## Built With

- [D3.js](https://d3js.org/) — charting and data visualization
- [Vite](https://vite.dev/) — build tooling
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [TypeScript](https://www.typescriptlang.org/) — no framework

## License

Experimental project. No license specified.
