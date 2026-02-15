/**
 * CSV parser for EMG data files.
 *
 * Handles common variations from EMG hardware exports:
 * - Comment headers (lines starting with #, %, //)
 * - Comma or tab delimiters
 * - Auto-detects sample rate from header comments
 * - Multi-channel support with channel name extraction
 */

/**
 * Parse CSV text into EMG data.
 *
 * @param {string} text  Raw CSV file contents
 * @param {number} [channel=0]  Index into numeric columns (0-based) to use as the signal
 * @returns {{ samples: Float64Array, sampleRateHz: number, durationMs: number, channelNames: string[], selectedChannel: number }}
 */
export function parseCSV(text, channel = 0) {
  const lines = text.split(/\r?\n/);

  // Separate header/comment lines from data lines
  const headerLines = [];
  const dataLines = [];

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

  // Detect column header row: if the first "data" line has non-numeric cells, treat it as headers
  let columnHeaders = null;
  const firstFields = dataLines[0].split(delimiter).map((s) => s.trim());
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
  const colCount = dataLines[0].split(delimiter).length;
  const rows = [];

  for (const line of dataLines) {
    const fields = line.split(delimiter).map((s) => s.trim());
    const values = fields.map(Number);
    if (values.some(isNaN)) continue; // skip malformed rows
    rows.push(values);
  }

  if (rows.length < 2) {
    throw new Error("CSV file has fewer than 2 valid data rows");
  }

  // Build column arrays
  const columns = Array.from({ length: colCount }, () => []);
  for (const row of rows) {
    for (let c = 0; c < colCount; c++) {
      columns[c].push(row[c] ?? 0);
    }
  }

  // Identify which columns are numeric signal data vs index/timestamp
  const numericColIndices = [];
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

  // Auto-detect sample rate
  const sampleRateHz = detectSampleRate(headerLines) || 1000;
  const durationMs = (samples.length / sampleRateHz) * 1000;

  return { samples, sampleRateHz, durationMs, channelNames, selectedChannel };
}

/** Check if a line is a comment/metadata header. */
function isCommentLine(line) {
  return line.startsWith("#") || line.startsWith("%") || line.startsWith("//");
}

/** Detect whether the file uses commas or tabs. */
function detectDelimiter(line) {
  const tabs = (line.match(/\t/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  return tabs > commas ? "\t" : ",";
}

/** Check if a string is a valid number. */
function isNumeric(s) {
  if (s === "") return false;
  return !isNaN(Number(s));
}

/**
 * Detect if a column is a sequential integer index (0,1,2,... or 1,2,3,...).
 * Only filters it out if it's strictly sequential with step 1.
 */
function isSequentialIndex(col) {
  if (col.length < 3) return false;

  // Check first few values for integer + sequential pattern
  const checkLen = Math.min(col.length, 20);
  const start = col[0];

  // Must start at 0 or 1
  if (start !== 0 && start !== 1) return false;

  for (let i = 1; i < checkLen; i++) {
    if (col[i] !== start + i) return false;
  }
  return true;
}

/**
 * Scan header comment lines for sample rate patterns.
 * Looks for common patterns like:
 *   "sampling_rate": 1000
 *   Sample Rate = 1000
 *   1000 Hz
 *   Fs = 1000
 */
function detectSampleRate(headerLines) {
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
