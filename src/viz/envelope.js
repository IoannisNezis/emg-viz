import * as d3 from "d3";

/**
 * Render the RMS envelope as a smoothed <path>.
 */
export function renderEnvelope(layer, timeAxis, rmsValues, scales) {
  const { x, y } = scales;

  // Downsample for performance
  const step = Math.max(1, Math.floor(rmsValues.length / 5000));

  const line = d3
    .line()
    .x((_, i) => x(timeAxis[i * step]))
    .y((_, i) => y(rmsValues[i * step]))
    .curve(d3.curveBasis);

  const data = Array.from({ length: Math.ceil(rmsValues.length / step) }, (_, i) => i);

  const path = layer.selectAll(".envelope-path").data([data]);

  path
    .join("path")
    .attr("class", "envelope-path")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "var(--color-emg-rms)")
    .attr("stroke-width", 2)
    .attr("opacity", 0.95);
}
