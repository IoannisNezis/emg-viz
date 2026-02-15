import * as d3 from "d3";

export interface Scales {
  x: d3.ScaleLinear<number, number>;
  y: d3.ScaleLinear<number, number>;
  xAxis: d3.Axis<d3.NumberValue>;
  yAxis: d3.Axis<d3.NumberValue>;
  xGrid: d3.Axis<d3.NumberValue>;
  yGrid: d3.Axis<d3.NumberValue>;
}

/**
 * Create x/y scales and axis generators for the chart.
 */
export function createScales(
  width: number,
  height: number,
  timeExtent: [number, number],
  ampExtent: [number, number],
): Scales {
  const x = d3.scaleLinear().domain(timeExtent).range([0, width]);

  const y = d3.scaleLinear().domain(ampExtent).range([height, 0]);

  const xAxis = d3
    .axisBottom(x)
    .ticks(10)
    .tickFormat((d) => `${d} ms`);

  const yAxis = d3
    .axisLeft(y)
    .ticks(8)
    .tickFormat((d) => `${(d as number).toFixed(1)}`);

  const xGrid = d3.axisBottom(x).ticks(10).tickSize(-height).tickFormat(() => "");

  const yGrid = d3.axisLeft(y).ticks(8).tickSize(-width).tickFormat(() => "");

  return { x, y, xAxis, yAxis, xGrid, yGrid };
}
