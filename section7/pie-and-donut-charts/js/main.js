const width = 600,
  height = 400,
  radius = Math.min(width, height) / 2;

const color = d3
  .scaleOrdinal()
  .range([
    '#98abc5',
    '#8a89a6',
    '#7b6888',
    '#6b486b',
    '#a05d56',
    '#d0743c',
    '#ff8c00',
  ]);

const arc = d3
  .arc()
  .outerRadius(radius - 20)
  .innerRadius(radius - 80);

const pie = d3
  .pie()
  .sort(null)
  .value(function (d) {
    return d.population;
  });

const svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

d3.csv('data/donut1.csv', type).then(data => {
  console.log(data);
  console.log(pie(data));

  const g = svg
    .selectAll('.arc')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'arc');

  g.append('path')
    .attr('d', arc)
    .style('fill', function (d) {
      return color(d.data.age);
    });
});

function type(d) {
  d.population = +d.population;
  return d;
}
