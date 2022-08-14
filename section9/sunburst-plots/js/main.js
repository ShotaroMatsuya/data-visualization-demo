const width = 960,
  height = 700,
  radius = Math.min(width, height) / 2 - 10;

const formatNumber = d3.format(',d');

const x = d3.scaleLinear().range([0, 2 * Math.PI]);

const y = d3.scaleSqrt().range([0, radius]);

const color = d3.scaleOrdinal(d3.schemeSet3);

const partition = d3.partition();

// These values will be provided by d3.partition()
const arc = d3
  .arc()
  .startAngle(function (d) {
    return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
  })
  .endAngle(function (d) {
    return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
  })
  .innerRadius(function (d) {
    return Math.max(0, y(d.y0));
  })
  .outerRadius(function (d) {
    return Math.max(0, y(d.y1));
  });

const svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

d3.json('data/sunburst.json').then(root => {
  root = d3.hierarchy(root).sum(function (d) {
    return d.size;
  });

  // Add an arc for each of the nodes in our hierarchy. partition(root) adds x0, x1, y0, and y1 values to each node.
  svg
    .selectAll('path')
    .data(partition(root).descendants())
    .enter()
    .append('path')
    .attr('d', arc)
    .style('fill', function (d) {
      return color((d.children ? d : d.parent).data.name);
    })
    .on('click', click)
    .append('title')
    .text(function (d) {
      return d.data.name + '\n' + formatNumber(d.value);
    });
});

function click(d) {
  // Redraw the arcs when one of them is clicked to zoom in on a section
  svg
    .transition()
    .duration(750)
    .tween('scales', function () {
      const xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
        yd = d3.interpolate(y.domain(), [d.y0, 1]),
        yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
      return function (t) {
        x.domain(xd(t));
        y.domain(yd(t)).range(yr(t));
      };
    })
    .selectAll('path')
    .attrTween('d', function (d) {
      return function () {
        return arc(d);
      };
    });
}
