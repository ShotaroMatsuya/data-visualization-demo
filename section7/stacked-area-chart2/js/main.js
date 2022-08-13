var tsvData = null;

const svg = d3.select('svg');
const MARGIN = { TOP: 20, RIGHT: 20, BOTTOM: 30, LEFT: 50 };
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;

// time parser for x-scale
const parseDate = d3.timeParse('%Y');

// fix for format values
const formatSi = d3.format('.3s');
const formatNumber = d3.format('.1f'),
  formatBillion = function (x) {
    return formatNumber(x / 1e9);
  };

// scales
const x = d3.scaleTime().range([0, WIDTH]);
const y = d3.scaleLinear().range([HEIGHT, 0]);

const color = d3.scaleOrdinal(d3.schemePaired);

const xAxis = d3.axisBottom().scale(x);

const yAxis = d3.axisLeft().scale(y).tickFormat(formatBillion);

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
const stack = d3.stack();

d3.csv('data/stacked_area2.csv')
  .then(data => {
    color.domain(
      d3.keys(data[0]).filter(function (key) {
        return key !== 'date';
      })
    );

    const keys = data.columns.filter(function (key) {
      return key !== 'date';
    });

    data.forEach(function (d) {
      d.date = parseDate(d.date);
    });

    tsvData = (function () {
      return data;
    })();

    const maxDateVal = d3.max(data, function (d) {
      const vals = d3.keys(d).map(function (key) {
        return key !== 'date' ? d[key] : 0;
      });
      return d3.sum(vals);
    });

    // Set domains for axes
    x.domain(
      d3.extent(data, function (d) {
        return d.date;
      })
    );
    y.domain([0, maxDateVal]);

    stack.keys(keys);

    stack.order(d3.stackOrderNone);
    stack.offset(d3.stackOffsetNone);

    const browser = svg
      .selectAll('.browser')
      .data(stack(data))
      .enter()
      .append('g')
      .attr('class', function (d) {
        return 'browser ' + d.key;
      })
      .attr('fill-opacity', 0.5);

    browser
      .append('path')
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', function (d) {
        return color(d.key);
      });

    browser
      .append('text')
      .datum(function (d) {
        return d;
      })
      .attr('transform', function (d) {
        return 'translate(' + x(data[13].date) + ',' + y(d[13][1]) + ')';
      })
      .attr('x', -6)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text(function (d) {
        return d.key;
      })
      .attr('fill-opacity', 1);

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + HEIGHT + ')')
      .call(xAxis);

    svg.append('g').attr('class', 'y axis').call(yAxis);

    svg
      .append('text')
      .attr('x', 0 - MARGIN.LEFT)
      .text('Billions of liters');
  })
  .catch(error => {
    console.log(error);
  });
