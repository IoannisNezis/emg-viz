import * as d3 from "d3";

interface LegendItem {
  label: string;
  color: string;
  type: "line" | "line-thick" | "dashed" | "rect";
}

/**
 * Render chart legend in the top-right corner.
 */
export function renderLegend(
  layer: d3.Selection<SVGGElement, unknown, null, undefined>,
  chartWidth: number,
): void {
  const items: LegendItem[] = [
    { label: "Raw EMG", color: "var(--color-emg-raw)", type: "line" },
    { label: "RMS Envelope", color: "var(--color-emg-rms)", type: "line-thick" },
    { label: "Threshold", color: "var(--color-emg-threshold)", type: "dashed" },
    { label: "Contraction", color: "var(--color-emg-contraction)", type: "rect" },
  ];

  let group = layer.selectAll<SVGGElement, number>(".legend-group").data([0]);
  group = group
    .enter()
    .append("g")
    .attr("class", "legend-group")
    .merge(group);

  group.attr("transform", `translate(${chartWidth - 150}, 8)`);

  // Background
  group
    .selectAll(".legend-bg")
    .data([0])
    .join("rect")
    .attr("class", "legend-bg")
    .attr("x", -8)
    .attr("y", -4)
    .attr("width", 155)
    .attr("height", items.length * 20 + 8)
    .attr("rx", 4)
    .attr("fill", "oklch(0.21 0.01 260 / 0.85)");

  const rows = group.selectAll<SVGGElement, LegendItem>(".legend-row").data(items, (d) => (d as LegendItem).label);

  const rowEnter = rows.enter().append("g").attr("class", "legend-row");

  // Swatch — line or rect depending on type
  rowEnter.each(function (d) {
    const g = d3.select(this);
    if (d.type === "rect") {
      g.append("rect")
        .attr("class", "legend-swatch")
        .attr("width", 14)
        .attr("height", 10)
        .attr("y", -5)
        .attr("rx", 2)
        .attr("fill", d.color)
        .attr("opacity", 0.3);
    } else {
      g.append("line")
        .attr("class", "legend-swatch")
        .attr("x1", 0)
        .attr("x2", 14)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", d.color)
        .attr("stroke-width", d.type === "line-thick" ? 2 : d.type === "dashed" ? 1.5 : 1)
        .attr("stroke-dasharray", d.type === "dashed" ? "4 2" : "none");
    }
  });

  rowEnter
    .append("text")
    .attr("x", 20)
    .attr("y", 4)
    .attr("fill", "oklch(0.65 0.01 260)")
    .attr("font-size", "10px")
    .attr("font-family", "ui-monospace, monospace")
    .text((d) => d.label);

  rowEnter
    .merge(rows)
    .attr("transform", (_, i) => `translate(0, ${i * 20 + 8})`);
}
