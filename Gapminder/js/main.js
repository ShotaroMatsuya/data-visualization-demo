/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 2 - Gapminder Clone
 */

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;

let time = 0;

const svg = d3
  .select('#chart-area')
  .append('svg')
  .attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

const g = svg
  .append('g')
  .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

// x label
const xLabel = g
  .append('text')
  .attr('class', 'x axis-label')
  .attr('x', WIDTH / 2)
  .attr('y', HEIGHT + 60)
  .attr('font-size', '24px')
  .attr('text-anchor', 'middle')
  .text('GDP Per Capita ($)');

// y label
const yLabel = g
  .append('text')
  .attr('class', 'y axis-label')
  .attr('x', -(HEIGHT / 2))
  .attr('y', -60)
  .attr('font-size', '24px')
  .attr('text-anchor', 'middle')
  .attr('transform', 'rotate(-90)')
  .text('Life Expectancy (Year)');

const timeLabel = g
  .append('text')
  .attr('class', 'time-label')
  .attr('x', WIDTH - 40)
  .attr('y', HEIGHT - 10)
  .attr('font-size', '44px')
  .attr('opacity', '0.4')
  .attr('text-anchor', 'middle')
  .text('1800');

// Scales
const x = d3.scaleLog().base(10).range([0, WIDTH]).domain([142, 150000]);

const y = d3.scaleLinear().range([HEIGHT, 0]).domain([0, 90]);

const area = d3
  .scaleLinear()
  .range([25 * Math.PI, 1500 * Math.PI])
  .domain([2000, 1400000000]);

const continentColor = d3.scaleOrdinal(d3.schemePastel1);

// X Axis
const xAxisCall = d3
  .axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format('$'));
g.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${HEIGHT})`)
  .call(xAxisCall);

// Y Axis
const yAxisCall = d3.axisLeft(y);
g.append('g').attr('class', 'y axis').call(yAxisCall);

d3.json('data/data.json').then(function (data) {
  // clean data (nullを取り除く)
  const formattedData = data.map(year => {
    return year['countries']
      .filter(country => {
        return country.income && country.life_exp;
      })
      .map(country => {
        country.income = Number(country.income);
        country.life_exp = Number(country.life_exp);
        return country;
      });
  });

  // run the code every 0.1 second
  d3.interval(() => {
    // at the end of our data, loop back
    time = time < 214 ? time + 1 : 0;
    update(formattedData[time]);
  }, 100);
  // first run of the visualization
  update(formattedData[0]);
});

function update(data) {
  // standard transition time for the visualization
  const t = d3.transition().duration(100);

  // 今回はdataのupdateのみ（axisのupdateは不要）
  // JOIN new data with old
  const circles = g.selectAll('circle').data(data, d => d.country);

  // EXIT old elements not present in new data.
  circles.exit().remove();

  // ENTER new elements present in new data.
  circles
    .enter()
    .append('circle')
    .attr('fill', d => continentColor(d.continent))
    .merge(circles)
    .transition(t)
    .attr('cx', d => x(d.income))
    .attr('cy', d => y(d.life_exp))
    .attr('r', d => Math.sqrt(area(d.population), Math.PI));

  timeLabel.text(String(time + 1800));
}
