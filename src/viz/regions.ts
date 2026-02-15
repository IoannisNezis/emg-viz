import type { Contraction } from "../types.ts";
import type { Scales } from "./scales.ts";

/**
 * Render contraction highlight regions.
 */
export function renderRegions(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  contractions: Contraction[],
  scales: Scales,
  chartHeight: number,
): void {
  const { x } = scales;

  // Rectangles
  const rects = layer.selectAll<SVGRectElement, Contraction>(".contraction-rect").data(contractions, (d) => String(d.onsetMs));

  rects
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("class", "contraction-rect")
          .attr("opacity", 0)
          .call((el) =>
            el.transition().duration(200).attr("opacity", 0.15),
          ),
      (update) => update.transition().duration(200),
      (exit) =>
        exit
          .transition()
          .duration(200)
          .attr("opacity", 0)
          .remove(),
    )
    .attr("x", (d) => x(d.onsetMs))
    .attr("y", 0)
    .attr("width", (d) => Math.max(0, x(d.offsetMs) - x(d.onsetMs)))
    .attr("height", chartHeight)
    .attr("fill", "var(--color-emg-contraction)")
    .attr("stroke", "var(--color-emg-contraction)")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.4)
    .attr("opacity", 0.15);

  // Duration labels
  const labels = layer
    .selectAll<SVGTextElement, Contraction>(".contraction-label")
    .data(contractions, (d) => String(d.onsetMs));

  labels
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("class", "contraction-label")
          .attr("opacity", 0)
          .call((el) =>
            el.transition().duration(200).attr("opacity", 0.8),
          ),
      (update) => update,
      (exit) =>
        exit.transition().duration(200).attr("opacity", 0).remove(),
    )
    .attr("x", (d) => x(d.onsetMs) + (x(d.offsetMs) - x(d.onsetMs)) / 2)
    .attr("y", 16)
    .attr("text-anchor", "middle")
    .attr("fill", "var(--color-emg-contraction)")
    .attr("font-size", "10px")
    .attr("font-family", "ui-monospace, monospace")
    .attr("opacity", 0.8)
    .text((d) => `${Math.round(d.durationMs)}ms`);
}
