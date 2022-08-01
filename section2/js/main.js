/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    2.8 - Adding SVGs with D3
 */

d3.csv('data/ages.csv')
  .then(data => {
    data.forEach(d => {
      d.age = Number(d.age);
    });
    const svg = d3
      .select('#chart-area')
      .append('svg')
      .attr('width', 400)
      .attr('height', 400);

    const circles = svg.selectAll('circle').data(data);

    circles
      .enter()
      .append('circle')
      .attr('cx', (d, i) => i * 50 + 50)
      .attr('cy', 250)
      .attr('r', d => 2 * d.age)
      .attr('fill', d => {
        if (d.name === 'Tony') {
          return 'blue';
        } else {
          return 'red';
        }
      });
  })
  .catch(error => {
    console.log(error);
  });

// homework
d3.json('data/buildings.json').then(data => {
  data.forEach(d => {
    d.height = Number(d.height);
  });
  const svg = d3
    .select('#chart-area2')
    .append('svg')
    .attr('width', 500)
    .attr('height', 500);

  const rects = svg.selectAll('rect').data(data);

  rects
    .enter()
    .append('rect')
    .attr('x', (d, i) => i * 50 + 50)
    .attr('y', 5)
    .attr('width', 40)
    .attr('height', d => d.height)
    .attr('fill', 'gray');
});
