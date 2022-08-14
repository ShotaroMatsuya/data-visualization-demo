const svg = d3.select('svg'),
  width = +svg.attr('width'),
  height = +svg.attr('height');

const fader = function (color) {
    return d3.interpolateRgb(color, '#fff')(0.2);
  },
  color = d3.scaleOrdinal(d3.schemeSet3.map(fader)),
  format = d3.format(',d');

const treemap = d3
  .treemap()
  .tile(d3.treemapResquarify)
  .size([width, height])
  .round(true)
  .paddingInner(1);

d3.json('data/treemap.json').then(data => {
  // Since we are dealing with hierarchical data, need to convert the data to the right format
  const root = d3
    .hierarchy(data)
    .eachBefore(function (d) {
      d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
    })
    .sum(sumBySize)
    .sort(function (a, b) {
      return b.height - a.height || b.value - a.value;
    });

  // Computes x0, x1, y0, and y1 for each node (where the rectangles should be)
  treemap(root);

  const cell = svg
    .selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('transform', function (d) {
      return 'translate(' + d.x0 + ',' + d.y0 + ')';
    });

  // Add rectanges for each of the boxes that were generated
  cell
    .append('rect')
    .attr('id', function (d) {
      return d.data.id;
    })
    .attr('width', function (d) {
      return d.x1 - d.x0;
    })
    .attr('height', function (d) {
      return d.y1 - d.y0;
    })
    .attr('fill', function (d) {
      return color(d.parent.data.id);
    });

  // Make sure that text labels don't overflow into adjacent boxes
  cell
    .append('clipPath')
    .attr('id', function (d) {
      return 'clip-' + d.data.id;
    })
    .append('use')
    .attr('xlink:href', function (d) {
      return '#' + d.data.id;
    });

  // Add text labels - each word goes on its own line
  cell
    .append('text')
    .attr('clip-path', function (d) {
      return 'url(#clip-' + d.data.id + ')';
    })
    .selectAll('tspan')
    .data(function (d) {
      return d.data.name.split(/(?=[A-Z][^A-Z])/g);
    })
    .enter()
    .append('tspan')
    .attr('x', 4)
    .attr('y', function (d, i) {
      return 13 + i * 10;
    })
    .text(function (d) {
      return d;
    });

  // Simple way to make tooltips
  cell.append('title').text(function (d) {
    return d.data.id + '\n' + format(d.value);
  });

  // Add an input to select between different summing methods
  d3.selectAll('input')
    .data([sumBySize, sumByCount], function (d) {
      return d ? d.name : this.value;
    })
    .on('change', changed);

  function changed(sum) {
    // Give the treemap a new root, which uses a different summing function
    treemap(root.sum(sum));

    // Update the size and position of each of the rectangles
    cell
      .transition()
      .duration(750)
      .attr('transform', function (d) {
        return 'translate(' + d.x0 + ',' + d.y0 + ')';
      })
      .select('rect')
      .attr('width', function (d) {
        return d.x1 - d.x0;
      })
      .attr('height', function (d) {
        return d.y1 - d.y0;
      });
  }
});

// Return the number of descendants that the node has
function sumByCount(d) {
  return d.children ? 0 : 1;
}

// Return the size of the node
function sumBySize(d) {
  return d.size;
}
