const svg = d3.select('svg'),
  width = +svg.attr('width'),
  height = +svg.attr('height');

const color = d3.scaleOrdinal(d3.schemePaired);

// Add "forces" to the simulation here
const simulation = d3
  .forceSimulation()
  .force('center', d3.forceCenter(width / 2, height / 2))
  .force('charge', d3.forceManyBody().strength(-50))
  .force('collide', d3.forceCollide(10).strength(0.9))
  .force(
    'link',
    d3.forceLink().id(function (d) {
      return d.id;
    })
  );

d3.json('data/force.json').then(graph => {
  console.log(graph);

  // Add lines for every link in the dataset
  const link = svg
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(graph.links)
    .enter()
    .append('line')
    .attr('stroke-width', function (d) {
      return Math.sqrt(d.value);
    });

  // Add circles for every node in the dataset
  const node = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(graph.nodes)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('fill', function (d) {
      return color(d.group);
    })
    .call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    );

  // Basic tooltips
  node.append('title').text(function (d) {
    return d.id;
  });

  // Attach nodes to the simulation, add listener on the "tick" event
  simulation.nodes(graph.nodes).on('tick', ticked);

  // Associate the lines with the "link" force
  simulation.force('link').links(graph.links);

  // Dynamically update the position of the nodes/links as time passes
  function ticked() {
    link
      .attr('x1', function (d) {
        return d.source.x;
      })
      .attr('y1', function (d) {
        return d.source.y;
      })
      .attr('x2', function (d) {
        return d.target.x;
      })
      .attr('y2', function (d) {
        return d.target.y;
      });

    node
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      });
  }
});

// Change the value of alpha, so things move around when we drag a node
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.7).restart();
  d.fx = d.x;
  d.fy = d.y;
}

// Fix the position of the node that we are looking at
function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

// Let the node do what it wants again once we've looked at it
function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
