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
  {
    onThresholdChange,
    onZoom,
    onZoomReset,
  }: {
    onThresholdChange: (value: number) => void;
    onZoom: (start: number, end: number) => void;
    onZoomReset: () => void;
  },
): ChartAPI {
  const svg = d3
    .select(container)
    .append("svg")
    .attr("class", "w-full")
    .attr("preserveAspectRatio", "xMidYMid meet");

  // Clip path so zoomed data doesn't overflow into axes/margins
  const clipId = "chart-clip-" + Math.random().toString(36).slice(2, 8);
  const clipRect = svg
    .append("defs")
    .append("clipPath")
    .attr("id", clipId)
    .append("rect");

  // Layer groups in z-order
  const gRoot = svg.append("g").attr("class", "chart-root");
  const layers = {
    regions: gRoot.append("g").attr("class", "layer-regions").attr("clip-path", `url(#${clipId})`),
    grid: gRoot.append("g").attr("class", "layer-grid"),
    waveform: gRoot.append("g").attr("class", "layer-waveform").attr("clip-path", `url(#${clipId})`),
    envelope: gRoot.append("g").attr("class", "layer-envelope").attr("clip-path", `url(#${clipId})`),
    brush: gRoot.append("g").attr("class", "layer-brush"),
    threshold: gRoot.append("g").attr("class", "layer-threshold").attr("clip-path", `url(#${clipId})`),
    xAxis: gRoot.append("g").attr("class", "chart-axis x-axis"),
    yAxis: gRoot.append("g").attr("class", "chart-axis y-axis"),
    legend: gRoot.append("g").attr("class", "layer-legend"),
    backBtn: gRoot.append("g").attr("class", "zoom-reset-btn").style("cursor", "pointer").style("display", "none"),
  };

  // Build the reset-zoom button (SVG rect + text)
  layers.backBtn
    .append("rect")
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("fill", "oklch(0.30 0.01 260)")
    .attr("stroke", "oklch(0.45 0.02 260)")
    .attr("stroke-width", 1);
  layers.backBtn
    .append("text")
    .attr("fill", "oklch(0.82 0.01 260)")
    .attr("font-size", "11px")
    .attr("font-family", "ui-sans-serif, system-ui, sans-serif")
    .attr("font-weight", "500")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .text("\u2190 Reset Zoom");

  layers.backBtn.on("click", () => onZoomReset());

  let scales: Scales | null = null;
  let chartWidth = 0;
  let chartHeight = 0;

  // Brush for drag-to-zoom
  const brush = d3
    .brushX<unknown>()
    .on("end", (event: d3.D3BrushEvent<unknown>) => {
      if (!event.selection || !scales) return;
      const [x0, x1] = event.selection as [number, number];
      // Clear the brush visual immediately
      layers.brush.call(brush.move, null);
      // Ignore tiny drags (< 5px) to avoid accidental zooms
      if (Math.abs(x1 - x0) < 5) return;
      const tStart = scales.x.invert(x0);
      const tEnd = scales.x.invert(x1);
      onZoom(tStart, tEnd);
    });

  function computeDimensions() {
    const rect = container.getBoundingClientRect();
    const totalWidth = rect.width || 900;
    const totalHeight = Math.min(totalWidth * 0.45, 500);
    chartWidth = totalWidth - MARGIN.left - MARGIN.right;
    chartHeight = totalHeight - MARGIN.top - MARGIN.bottom;

    svg.attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
    gRoot.attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    layers.xAxis.attr("transform", `translate(0,${chartHeight})`);

    // Keep clip rect in sync
    clipRect.attr("width", chartWidth).attr("height", chartHeight);
  }

  const api: ChartAPI = {
    /**
     * Full redraw — call when data, RMS window, or view domain changes.
     */
    update({ timeAxis, samples, rmsValues, threshold, contractions, viewDomain }) {
      computeDimensions();

      const fullExtent: [number, number] = [timeAxis[0], timeAxis[timeAxis.length - 1]];
      const timeExtent: [number, number] = viewDomain ?? fullExtent;
      const isZoomed = viewDomain != null;

      // Auto-scale y to visible portion of the signal
      const totalDuration = fullExtent[1] - fullExtent[0];
      let startIdx = 0;
      let endIdx = samples.length - 1;
      if (totalDuration > 0) {
        startIdx = Math.max(0, Math.floor((timeExtent[0] - fullExtent[0]) / totalDuration * (samples.length - 1)));
        endIdx = Math.min(samples.length - 1, Math.ceil((timeExtent[1] - fullExtent[0]) / totalDuration * (samples.length - 1)));
      }
      let maxAmp = 0;
      for (let i = startIdx; i <= endIdx; i++) {
        const v = Math.abs(samples[i]);
        if (v > maxAmp) maxAmp = v;
      }
      maxAmp = (maxAmp || 1) * 1.15;
      const ampExtent: [number, number] = [-maxAmp, maxAmp];

      scales = createScales(chartWidth, chartHeight, timeExtent, ampExtent);

      // Axes
      layers.xAxis.call(scales.xAxis as unknown as (s: d3.Selection<SVGGElement, unknown, null, undefined>) => void);
      layers.yAxis.call(scales.yAxis as unknown as (s: d3.Selection<SVGGElement, unknown, null, undefined>) => void);

      // Grid
      layers.grid.selectAll("*").remove();
      layers.grid
        .append("g")
        .attr("class", "chart-grid")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(scales.xGrid as unknown as (s: d3.Selection<SVGGElement, unknown, null, undefined>) => void);
      layers.grid
        .append("g")
        .attr("class", "chart-grid")
        .call(scales.yGrid as unknown as (s: d3.Selection<SVGGElement, unknown, null, undefined>) => void);

      // Data layers
      renderWaveform(layers.waveform, timeAxis, samples, scales);
      renderEnvelope(layers.envelope, timeAxis, rmsValues, scales);
      renderThreshold(layers.threshold, threshold, scales, chartWidth, onThresholdChange);
      renderRegions(layers.regions, contractions, scales, chartHeight);
      renderLegend(layers.legend, chartWidth);

      // Brush
      brush.extent([[0, 0], [chartWidth, chartHeight]]);
      layers.brush.call(brush);

      // Reset-zoom button (top-left to avoid overlapping the legend)
      if (isZoomed) {
        const btnW = 98;
        const btnH = 24;
        layers.backBtn.style("display", null);
        layers.backBtn.select("rect").attr("x", 4).attr("y", 4).attr("width", btnW).attr("height", btnH);
        layers.backBtn.select("text").attr("x", 4 + btnW / 2).attr("y", 4 + btnH / 2);
      } else {
        layers.backBtn.style("display", "none");
      }
    },

    /**
     * Fast path — only update threshold line + contraction regions.
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
