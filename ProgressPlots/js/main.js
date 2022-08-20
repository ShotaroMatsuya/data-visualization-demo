/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    5.8 - Scatter plots in D3
 */

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 };
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;

const svg = d3
  .select('#chart-area')
  .append('svg')
  .attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

const g = svg
  .append('g')
  .attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

let time = 0;
let interval;
let formattedData;

// Tooltip
const tip = d3
  .tip()
  .attr('class', 'd3-tip')
  .html(d => {
    let text = `<strong>UserId :</strong> <span style='color:red;text-transform:capitalize'>${d.userId}</span><br>`;
    text += `<strong>Progression :</strong> <span style='color:red;text-transform:capitalize'>${d.progress}</span><br>`;
    text += `<strong>correct_rate:</strong> <span style='color:red'>${d3.format(
      '.2f'
    )(d.rate)}</span><br>`;
    return text;
  });
g.call(tip);

// Scales
const x = d3.scaleLinear().range([0, WIDTH]).domain([0, 5000]);
const y = d3.scaleLinear().range([HEIGHT, 0]).domain([0, 100]);
const area = d3
  .scaleLinear()
  .range([25 * Math.PI, 1500 * Math.PI])
  .domain([2000, 1400000000]);
const markedStudentColor = d3.scaleOrdinal(d3.schemePastel1);

// Labels
const xLabel = g
  .append('text')
  .attr('y', HEIGHT + 50)
  .attr('x', WIDTH / 2)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .text('Progress(count)');
const yLabel = g
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('y', -40)
  .attr('x', -170)
  .attr('font-size', '20px')
  .attr('text-anchor', 'middle')
  .text('CorrectRate (%)');

// 日付
const timeLabel = g
  .append('text')
  .attr('y', HEIGHT - 10)
  .attr('x', WIDTH - 40)
  .attr('font-size', '40px')
  .attr('opacity', '0.4')
  .attr('text-anchor', 'middle')
  .text('2019-0331');

// X Axis
const xAxisCall = d3.axisBottom(x).tickValues([1000, 2000, 3000, 4000]);
g.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${HEIGHT})`)
  .call(xAxisCall);
// Y Axis
const yAxisCall = d3.axisLeft(y);
g.append('g').attr('class', 'y axis').call(yAxisCall);
const students = [5185, 101528, 94245, 102557];

const legend = g
  .append('g')
  .attr('transform', `translate(${WIDTH - 10}, ${HEIGHT - 125})`);

students.forEach((student, i) => {
  const legendRow = legend
    .append('g')
    .attr('transform', `translate(0, ${i * 20})`);

  legendRow
    .append('rect')
    .attr('width', 10)
    .attr('height', 10)
    .attr('fill', markedStudentColor(student));

  legendRow
    .append('text')
    .attr('x', -10)
    .attr('y', 10)
    .attr('text-anchor', 'end')
    .style('text-transform', 'capitalize')
    .text(student);
});

d3.json('data/progress-data.json').then(data => {
  // clean data
  formattedData = data.map(time => {
    return time['students']
      .filter(student => {
        const dataExists = student.userId && student.progress && student.rate;
        return dataExists;
      })
      .map(student => {
        student.userId = Number(student.userId);
        student.progress = Number(student.progress);
        student.rate = Number(student.rate);
        return student;
      });
  });
  console.log(formattedData);
  update(formattedData[0]);
});

function step() {
  // at the end of data , loop back
  time = time < 9 ? time + 1 : 0;
  update(formattedData[time]);
}

// Register EventListener
$('#play-button').on('click', function () {
  const button = $(this);
  if (button.text() === 'Play') {
    button.text('Pause');
    interval = setInterval(step, 1000);
  } else {
    button.text('Play');
    clearInterval(interval);
  }
});

$('#reset-button').on('click', () => {
  time = 0;
  update(formattedData[0]);
});

$('#continent-select').on('change', () => {
  update(formattedData[time]);
});

// FIXME: JQueryUI setting
$('#date-slider').slider({
  min: 0,
  max: 9,
  step: 1,
  slide: (event, ui) => {
    time = ui.value;
    update(formattedData[time]);
  },
});

function update(data) {
  // standard transition time for the visualization
  const t = d3.transition().duration(300);

  const student = $('#student-select').val();

  const filteredData = data.filter(d => {
    if (student === 'all') return true;
    else {
      return d.userId == student;
    }
  });

  // JOIN new data with old elements.
  const circles = g.selectAll('circle').data(filteredData, d => d.student);

  // EXIT old elements not present in new data.
  circles.exit().remove();

  // ENTER new elements present in new data.
  circles
    .enter()
    .append('circle')
    .attr('fill', d => markedStudentColor(d.userId))
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .merge(circles)
    .transition(t)
    .attr('cy', d => y(d.rate))
    .attr('cx', d => x(d.progress))
    .attr('r', 4);

  // update the time label
  timeLabel.text(String(time));

  $('#year')[0].innerHTML = String(time);
  $('#date-slider').slider('value', Number(time));
}
