const svg = d3.select('svg');
const MARGIN = { TOP: 20, RIGHT: 20, BOTTOM: 30, LEFT: 50 };
const WIDTH = +svg.attr('width') - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = +svg.attr('height') - MARGIN.TOP - MARGIN.BOTTOM;

const g = svg
  .append('g')
  .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

// time parser for x-scale
const parseTime = d3.timeParse('%d-%b-%y');

// scales
const x = d3.scaleTime().rangeRound([0, WIDTH]);
const y = d3.scaleLinear().rangeRound([HEIGHT, 0]);

// area generator
const area = d3
  .area()
  .x(function (d) {
    return x(d.date);
  })
  .y0(y(0))
  .y1(function (d) {
    return y(d.close);
  });

d3.tsv('data/area.tsv')
  .then(data => {
    // clean data
    data.forEach(d => {
      d.date = parseTime(d.date);
      d.close = +d.close;
    });

    // set scale domains
    x.domain(
      d3.extent(data, function (d) {
        return d.date;
      })
    );
    y.domain([
      0,
      d3.max(data, function (d) {
        return d.close;
      }),
    ]);
    g.append('path').attr('fill', 'steelblue').attr('d', area(data));

    g.append('g')
      .attr('transform', 'translate(0,' + HEIGHT + ')')
      .call(d3.axisBottom(x));

    g.append('g')
      .call(d3.axisLeft(y))
      .append('text')
      .attr('fill', '#000')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Price ($)');
  })
  .catch(error => {
    console.log(error);
  });
