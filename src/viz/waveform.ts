import * as d3 from "d3";
import type { Scales } from "./scales.ts";

/**
 * Render the raw EMG waveform as a single <path>.
 * Only emits points within the visible x-domain so zoom levels stay sharp.
 */
export function renderWaveform(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  timeAxis: Float64Array,
  samples: Float64Array,
  scales: Scales,
): void {
  const { x, y } = scales;
  const [t0, t1] = x.domain();

  // Visible index range (with 1-sample padding on each side for edge continuity)
  const totalDuration = timeAxis[timeAxis.length - 1] - timeAxis[0];
  const startIdx = totalDuration > 0
    ? Math.max(0, Math.floor((t0 - timeAxis[0]) / totalDuration * (timeAxis.length - 1)) - 1)
    : 0;
  const endIdx = totalDuration > 0
    ? Math.min(timeAxis.length - 1, Math.ceil((t1 - timeAxis[0]) / totalDuration * (timeAxis.length - 1)) + 1)
    : timeAxis.length - 1;

  const visibleCount = endIdx - startIdx + 1;
  const step = Math.max(1, Math.floor(visibleCount / 10000));

  const line = d3
    .line<number>()
    .x((d) => x(timeAxis[d]))
    .y((d) => y(samples[d]))
    .curve(d3.curveLinear);

  const data: number[] = [];
  for (let i = startIdx; i <= endIdx; i += step) {
    data.push(i);
  }

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
