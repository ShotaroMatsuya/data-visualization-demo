const svg = d3.select('svg');
const MARGIN = { TOP: 20, RIGHT: 20, BOTTOM: 30, LEFT: 50 };
const WIDTH = +svg.attr('width') - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = +svg.attr('height') - MARGIN.TOP - MARGIN.BOTTOM;

const g = svg
  .append('g')
  .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

// time parser for x-scale
const parseDate = d3.timeParse('%Y %b %d');

// scales
const x = d3.scaleTime().range([0, WIDTH]);
const y = d3.scaleLinear().range([HEIGHT, 0]);
const z = d3.scaleOrdinal(d3.schemePaired);

const stack = d3.stack();

// area generator
const area = d3
  .area()
  .x(function (d) {
    return x(d.data.date);
  })
  .y0(function (d) {
    return y(d[0]);
  })
  .y1(function (d) {
    return y(d[1]);
  });

d3.tsv('data/stacked_area1.tsv', type).then(data => {
  const keys = data.columns.slice(1);

  x.domain(
    d3.extent(data, function (d) {
      return d.date;
    })
  );
  z.domain(keys);
  stack.keys(keys);

  console.log(data);
  console.log(stack(data));

  const layer = g
    .selectAll('.layer')
    .data(stack(data))
    .enter()
    .append('g')
    .attr('class', 'layer');

  layer
    .append('path')
    .attr('class', 'area')
    .style('fill', function (d) {
      return z(d.key);
    })
    .attr('d', area);

  // Only label the layers left at the end (if one browser disappears)
  layer
    .filter(function (d) {
      return d[d.length - 1][1] - d[d.length - 1][0] > 0.01;
    })
    .append('text')
    .attr('x', WIDTH - 6)
    .attr('y', function (d) {
      return y((d[d.length - 1][0] + d[d.length - 1][1]) / 2);
    })
    .attr('dy', '.35em')
    .style('font', '10px sans-serif')
    .style('text-anchor', 'end')
    .text(function (d) {
      return d.key;
    });

  g.append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + HEIGHT + ')')
    .call(d3.axisBottom(x));

  g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(y).ticks(10, '%'));
});

function type(d, i, columns) {
  d.date = parseDate(d.date);
  for (let i = 1, n = columns.length; i < n; ++i)
    d[columns[i]] = d[columns[i]] / 100;
  return d;
}
