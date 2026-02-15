/**
 * CSV parser for EMG data files.
 *
 * Handles common variations from EMG hardware exports:
 * - Comment headers (lines starting with #, %, //)
 * - Comma or tab delimiters
 * - Auto-detects sample rate from header comments
 * - Multi-channel support with channel name extraction
 */

import type { ParsedCSV } from "../types.ts";

/**
 * Parse CSV text into EMG data.
 */
export function parseCSV(text: string, channel = 0): ParsedCSV {
  const lines = text.split(/\r?\n/);

  // Separate header/comment lines from data lines
  const headerLines: string[] = [];
  const dataLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;

    if (isCommentLine(trimmed)) {
      headerLines.push(trimmed);
    } else {
      dataLines.push(trimmed);
    }
  }

  if (dataLines.length === 0) {
    throw new Error("CSV file contains no data rows");
  }

  // Auto-detect delimiter from first data line
  const delimiter = detectDelimiter(dataLines[0]);

  const splitLine = (line: string): string[] =>
    delimiter === " "
      ? line.trim().split(/\s+/)
      : line.split(delimiter).map((s) => s.trim());

  // Detect column header row: if the first "data" line has non-numeric cells, treat it as headers
  let columnHeaders: string[] | null = null;
  const firstFields = splitLine(dataLines[0]);
  const numericCount = firstFields.filter((f) => isNumeric(f)).length;

  if (numericCount < firstFields.length / 2) {
    // More non-numeric than numeric — it's a header row
    columnHeaders = firstFields;
    dataLines.shift();
  }

  if (dataLines.length === 0) {
    throw new Error("CSV file contains no data rows after header");
  }

  // Parse all data rows into columns
  const colCount = splitLine(dataLines[0]).length;
  const rows: number[][] = [];

  for (const line of dataLines) {
    const fields = splitLine(line);
    const values = fields.map(Number);
    if (values.some(isNaN)) continue; // skip malformed rows
    rows.push(values);
  }

  if (rows.length < 2) {
    throw new Error("CSV file has fewer than 2 valid data rows");
  }

  // Build column arrays
  const columns: number[][] = Array.from({ length: colCount }, () => []);
  for (const row of rows) {
    for (let c = 0; c < colCount; c++) {
      columns[c].push(row[c] ?? 0);
    }
  }

  // Identify which columns are numeric signal data vs index/timestamp
  const numericColIndices: number[] = [];
  for (let c = 0; c < colCount; c++) {
    if (!isSequentialIndex(columns[c])) {
      numericColIndices.push(c);
    }
  }

  // If all columns look like signals (none filtered), use all of them
  // If none remain (all sequential), fall back to all columns
  const signalIndices =
    numericColIndices.length > 0 ? numericColIndices : Array.from({ length: colCount }, (_, i) => i);

  // Build channel names
  const channelNames = signalIndices.map((c) => {
    if (columnHeaders && columnHeaders[c]) return columnHeaders[c];
    return `Channel ${c + 1}`;
  });

  // Clamp selected channel
  const selectedChannel = Math.min(channel, signalIndices.length - 1);
  const colIdx = signalIndices[selectedChannel];
  const samples = new Float64Array(columns[colIdx]);

  // Auto-detect sample rate: prefer header comment, then time column step, then default 1000 Hz
  const timeColIdx = Array.from({ length: colCount }, (_, i) => i).find((i) => !signalIndices.includes(i));
  const rateFromTimeCol =
    timeColIdx !== undefined && columns[timeColIdx].length >= 2
      ? Math.round(1 / (columns[timeColIdx][1] - columns[timeColIdx][0]))
      : null;
  const sampleRateHz = detectSampleRate(headerLines) || rateFromTimeCol || 1000;
  const durationMs = (samples.length / sampleRateHz) * 1000;

  return { samples, sampleRateHz, durationMs, channelNames, selectedChannel };
}

/** Check if a line is a comment/metadata header. */
function isCommentLine(line: string): boolean {
  return line.startsWith("#") || line.startsWith("%") || line.startsWith("//");
}

/** Detect whether the file uses commas, tabs, or whitespace. */
function detectDelimiter(line: string): string {
  const tabs = (line.match(/\t/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  if (tabs > 0 && tabs >= commas) return "\t";
  if (commas > 0) return ",";
  // Fall back to whitespace (e.g. PhysioNet plain-text files)
  return " ";
}

/** Check if a string is a valid number. */
function isNumeric(s: string): boolean {
  if (s === "") return false;
  return !isNaN(Number(s));
}

/**
 * Detect if a column is a time/index column and should be excluded from signal channels.
 * Catches two patterns:
 *  - Integer index: 0,1,2,... or 1,2,3,... (step exactly 1)
 *  - Float time:    0, 0.00025, 0.0005, ... (monotonically increasing, constant step, starts near 0)
 */
function isSequentialIndex(col: number[]): boolean {
  if (col.length < 3) return false;

  const checkLen = Math.min(col.length, 20);
  const start = col[0];
  const step = col[1] - col[0];

  if (step <= 0) return false; // must be increasing

  // Integer index starting at 0 or 1 with step 1
  if (start === 0 || start === 1) {
    if (step === 1) {
      let ok = true;
      for (let i = 1; i < checkLen; i++) {
        if (col[i] !== start + i) { ok = false; break; }
      }
      if (ok) return true;
    }
  }

  // Float time column: starts near 0 (< 1), constant positive step, monotonically increasing
  if (start >= 0 && start < 1) {
    const tol = Math.abs(step) * 0.01; // 1% tolerance for floating-point drift
    let ok = true;
    for (let i = 1; i < checkLen; i++) {
      if (Math.abs((col[i] - col[i - 1]) - step) > tol) { ok = false; break; }
    }
    if (ok) return true;
  }

  return false;
}

/**
 * Scan header comment lines for sample rate patterns.
 */
function detectSampleRate(headerLines: string[]): number | null {
  for (const line of headerLines) {
    // "sampling_rate": 1000  or  sampling_rate = 1000
    let m = line.match(/sampl(?:e|ing)[_ ]?rate[\s":=]+(\d+)/i);
    if (m) return Number(m[1]);

    // Fs = 1000  or  fs: 1000
    m = line.match(/\bfs[\s":=]+(\d+)/i);
    if (m) return Number(m[1]);

    // 1000 Hz  or  1000Hz
    m = line.match(/(\d+)\s*Hz/i);
    if (m) return Number(m[1]);
  }
  return null;
}
