import * as d3 from "d3";

/**
 * Create x/y scales and axis generators for the chart.
 */
export function createScales(width, height, timeExtent, ampExtent) {
  const x = d3.scaleLinear().domain(timeExtent).range([0, width]);

  const y = d3.scaleLinear().domain(ampExtent).range([height, 0]);

  const xAxis = d3
    .axisBottom(x)
    .ticks(10)
    .tickFormat((d) => `${d} ms`);

  const yAxis = d3
    .axisLeft(y)
    .ticks(8)
    .tickFormat((d) => `${d.toFixed(1)}`);

  const xGrid = d3.axisBottom(x).ticks(10).tickSize(-height).tickFormat("");

  const yGrid = d3.axisLeft(y).ticks(8).tickSize(-width).tickFormat("");

  return { x, y, xAxis, yAxis, xGrid, yGrid };
}
