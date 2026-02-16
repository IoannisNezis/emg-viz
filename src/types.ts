export interface EMGData {
  samples: Float64Array;
  sampleRateHz: number;
  durationMs: number;
}

export interface ParsedCSV extends EMGData {
  channelNames: string[];
  selectedChannel: number;
}

export interface Activation {
  startMs: number;
  endMs: number;
  intensity: number;
}

export interface Contraction {
  onsetMs: number;
  offsetMs: number;
  durationMs: number;
  peakRms: number;
}

export interface Statistics {
  contractionCount: number;
  averageDurationMs: number;
  peakRms: number;
  meanRms: number;
  dutyCyclePercent: number;
}

export interface ChartData {
  timeAxis: Float64Array;
  samples: Float64Array;
  rmsValues: Float64Array;
  threshold: number;
  contractions: Contraction[];
  viewDomain: [number, number] | null;
}

export type ThresholdMethod = "median" | "mad" | "manual";

export type AppMode = "demo" | "file";
