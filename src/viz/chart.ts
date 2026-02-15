import * as d3 from "d3";
import { createScales, type Scales } from "./scales.ts";
import { renderWaveform } from "./waveform.ts";
import { renderEnvelope } from "./envelope.ts";
import { renderThreshold, updateThresholdPosition } from "./threshold.ts";
import { renderRegions } from "./regions.ts";
import { renderLegend } from "./legend.ts";
import type { ChartData, Contraction } from "../types.ts";

const MARGIN = { top: 24, right: 60, bottom: 40, left: 55 };

export interface ChartAPI {
  update(data: ChartData): void;
  updateContractions(data: { threshold: number; contractions: Contraction[] }): void;
  resize(data: ChartData): void;
}

/**
 * Create the chart and return an API object for updates.
 */
export function createChart(
  container: HTMLElement,
  { onThresholdChange }: { onThresholdChange: (value: number) => void },
): ChartAPI {
  const svg = d3
    .select(container)
    .append("svg")
    .attr("class", "w-full")
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Layer groups in z-order
  const gRoot = svg.append("g").attr("class", "chart-root");
  const layers = {
    regions: gRoot.append("g").attr("class", "layer-regions"),
    grid: gRoot.append("g").attr("class", "layer-grid"),
    waveform: gRoot.append("g").attr("class", "layer-waveform"),
    envelope: gRoot.append("g").attr("class", "layer-envelope"),
    threshold: gRoot.append("g").attr("class", "layer-threshold"),
    xAxis: gRoot.append("g").attr("class", "chart-axis x-axis"),
    yAxis: gRoot.append("g").attr("class", "chart-axis y-axis"),
    legend: gRoot.append("g").attr("class", "layer-legend"),
  };

  let scales: Scales | null = null;
  let chartWidth = 0;
  let chartHeight = 0;

  function computeDimensions() {
    const rect = container.getBoundingClientRect();
    const totalWidth = rect.width || 900;
    const totalHeight = Math.min(totalWidth * 0.45, 500);
    chartWidth = totalWidth - MARGIN.left - MARGIN.right;
    chartHeight = totalHeight - MARGIN.top - MARGIN.bottom;

    svg.attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
    gRoot.attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    layers.xAxis.attr("transform", `translate(0,${chartHeight})`);
  }

  const api: ChartAPI = {
    /**
     * Full redraw — call when data or RMS window changes.
     */
    update({ timeAxis, samples, rmsValues, threshold, contractions }) {
      computeDimensions();

      const timeExtent: [number, number] = [timeAxis[0], timeAxis[timeAxis.length - 1]];
      const maxAmp = (d3.max(samples, (d) => Math.abs(d)) ?? 1) * 1.15;
      const ampExtent: [number, number] = [-maxAmp, maxAmp];

      scales = createScales(chartWidth, chartHeight, timeExtent, ampExtent);

      // Axes
      layers.xAxis.call(scales.xAxis as unknown as (selection: d3.Selection<SVGGElement, unknown, null, undefined>) => void);
      layers.yAxis.call(scales.yAxis as unknown as (selection: d3.Selection<SVGGElement, unknown, null, undefined>) => void);

      // Grid
      layers.grid.selectAll("*").remove();
      layers.grid
        .append("g")
        .attr("class", "chart-grid")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(scales.xGrid as unknown as (selection: d3.Selection<SVGGElement, unknown, null, undefined>) => void);
      layers.grid
        .append("g")
        .attr("class", "chart-grid")
        .call(scales.yGrid as unknown as (selection: d3.Selection<SVGGElement, unknown, null, undefined>) => void);

      // Data layers
      renderWaveform(layers.waveform, timeAxis, samples, scales);
      renderEnvelope(layers.envelope, timeAxis, rmsValues, scales);
      renderThreshold(
        layers.threshold,
        threshold,
        scales,
        chartWidth,
        onThresholdChange,
      );
      renderRegions(layers.regions, contractions, scales, chartHeight);
      renderLegend(layers.legend, chartWidth);
    },

    /**
     * Fast path — only update threshold line + contraction regions + legend.
     * Called during drag for responsiveness.
     */
    updateContractions({ threshold, contractions }) {
      if (!scales) return;
      updateThresholdPosition(layers.threshold, threshold, scales, chartWidth);
      renderRegions(layers.regions, contractions, scales, chartHeight);
    },

    /**
     * Resize handler.
     */
    resize(data) {
      api.update(data);
    },
  };

  return api;
}
