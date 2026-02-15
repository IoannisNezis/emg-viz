import * as d3 from "d3";
import type { Scales } from "./scales.ts";

/**
 * Render the raw EMG waveform as a single <path>.
 */
export function renderWaveform(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  timeAxis: Float64Array,
  samples: Float64Array,
  scales: Scales,
): void {
  const { x, y } = scales;

  // Downsample for performance if > 10k points
  const step = Math.max(1, Math.floor(samples.length / 10000));

  const line = d3
    .line<number>()
    .x((_, i) => x(timeAxis[i * step]))
    .y((_, i) => y(samples[i * step]))
    .curve(d3.curveLinear);

  const data = Array.from({ length: Math.ceil(samples.length / step) }, (_, i) => i);

  const path = layer.selectAll<SVGPathElement, number[]>(".waveform-path").data([data]);

  path
    .join("path")
    .attr("class", "waveform-path")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "var(--color-emg-raw)")
    .attr("stroke-width", 0.8)
    .attr("opacity", 0.85);
}
