const margin = { top: 30, right: 50, bottom: 30, left: 50 },
  width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

const g = d3
  .select('svg')
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

d3.csv('data/wordcloud.csv').then(data => {
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const categories = d3.keys(
    d3
      .nest()
      .key(function (d) {
        return d.State;
      })
      .map(data)
  );

  const fontSize = d3.scalePow().exponent(5).domain([0, 1]).range([40, 80]);

  // Adds a set of variables to each element in the data (we will use x and y later)
  const layout = d3.layout
    .cloud()
    .size([width, height])
    .timeInterval(20)
    .words(data)
    //.rotate(function(d) { return 0; })
    .rotate(function () {
      return ~~(Math.random() * 2) * 90;
    })
    .fontSize(function (d, i) {
      return fontSize(Math.random());
    })
    .fontWeight(['bold'])
    .text(function (d) {
      return d.Team_EN;
    })
    .on('end', draw)
    .start();

  console.log(data);

  function draw(words) {
    var wordcloud = g
      .append('g')
      .attr('class', 'wordcloud')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    wordcloud
      .selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .attr('class', 'word')
      .style('fill', function (d, i) {
        return color(i);
      })
      .style('font-size', function (d) {
        return d.size + 'px';
      })
      .style('font-family', function (d) {
        return d.font;
      })
      .attr('text-anchor', 'middle')
      .attr('transform', function (d) {
        return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
      })
      .text(function (d) {
        return d.text;
      });
  }
});
