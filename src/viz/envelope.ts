import * as d3 from "d3";
import type { Scales } from "./scales.ts";

/**
 * Render the RMS envelope as a smoothed <path>.
 * Only emits points within the visible x-domain so zoom levels stay sharp.
 */
export function renderEnvelope(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  timeAxis: Float64Array,
  rmsValues: Float64Array,
  scales: Scales,
): void {
  const { x, y } = scales;
  const [t0, t1] = x.domain();

  // Visible index range (with 1-sample padding for edge continuity)
  const totalDuration = timeAxis[timeAxis.length - 1] - timeAxis[0];
  const startIdx = totalDuration > 0
    ? Math.max(0, Math.floor((t0 - timeAxis[0]) / totalDuration * (timeAxis.length - 1)) - 1)
    : 0;
  const endIdx = totalDuration > 0
    ? Math.min(timeAxis.length - 1, Math.ceil((t1 - timeAxis[0]) / totalDuration * (timeAxis.length - 1)) + 1)
    : timeAxis.length - 1;

  const visibleCount = endIdx - startIdx + 1;
  const step = Math.max(1, Math.floor(visibleCount / 5000));

  const line = d3
    .line<number>()
    .x((d) => x(timeAxis[d]))
    .y((d) => y(rmsValues[d]))
    .curve(d3.curveBasis);

  const data: number[] = [];
  for (let i = startIdx; i <= endIdx; i += step) {
    data.push(i);
  }

  const path = layer.selectAll<SVGPathElement, number[]>(".envelope-path").data([data]);

  path
    .join("path")
    .attr("class", "envelope-path")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "var(--color-emg-rms)")
    .attr("stroke-width", 2)
    .attr("opacity", 0.95);
}
