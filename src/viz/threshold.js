import * as d3 from "d3";

/**
 * Render the draggable threshold line.
 */
export function renderThreshold(layer, threshold, scales, chartWidth, onThresholdChange) {
  const { y } = scales;

  let group = layer.selectAll(".threshold-group").data([threshold]);

  const groupEnter = group
    .enter()
    .append("g")
    .attr("class", "threshold-group");

  // Invisible wide hit area for easy grabbing
  groupEnter
    .append("line")
    .attr("class", "threshold-hit-area")
    .attr("stroke", "transparent")
    .attr("stroke-width", 16);

  // Visible dashed line
  groupEnter
    .append("line")
    .attr("class", "threshold-line")
    .attr("stroke", "var(--color-emg-threshold)")
    .attr("stroke-width", 1.8)
    .attr("stroke-dasharray", "8 4");

  // V label at right edge
  groupEnter
    .append("text")
    .attr("class", "threshold-label")
    .attr("fill", "var(--color-emg-threshold)")
    .attr("font-size", "11px")
    .attr("font-family", "ui-monospace, monospace")
    .attr("text-anchor", "end")
    .attr("dy", "-6px")
    .attr("opacity", 0.8);

  group = groupEnter.merge(group);

  const yPos = y(threshold);

  group
    .selectAll(".threshold-hit-area, .threshold-line")
    .attr("x1", 0)
    .attr("x2", chartWidth)
    .attr("y1", yPos)
    .attr("y2", yPos);

  group
    .selectAll(".threshold-label")
    .attr("x", chartWidth - 4)
    .attr("y", yPos)
    .text(`${threshold.toFixed(3)} V`);

  // Drag behavior
  const drag = d3
    .drag()
    .on("start", function () {
      d3.select(this).classed("dragging", true);
    })
    .on("drag", function (event) {
      const [yDomain0, yDomain1] = y.domain();
      const newThreshold = Math.max(
        Math.min(y.invert(event.y), yDomain1),
        Math.max(0, yDomain0),
      );
      onThresholdChange(newThreshold);
    })
    .on("end", function () {
      d3.select(this).classed("dragging", false);
    });

  group.call(drag);
}

/**
 * Quick positional update during drag (no re-bindind data/drag).
 */
export function updateThresholdPosition(layer, threshold, scales, chartWidth) {
  const { y } = scales;
  const yPos = y(threshold);

  layer
    .selectAll(".threshold-hit-area, .threshold-line")
    .attr("y1", yPos)
    .attr("y2", yPos);

  layer
    .selectAll(".threshold-label")
    .attr("y", yPos)
    .text(`${threshold.toFixed(3)} V`);
}
