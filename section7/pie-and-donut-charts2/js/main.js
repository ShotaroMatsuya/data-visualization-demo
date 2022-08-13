const width = 600,
  height = 400,
  radius = Math.min(width, height) / 2;

//d3.scale.category20()
const color = d3.scaleOrdinal(d3.schemeSet3);

//d3.layout.pie()
const pie = d3
  .pie()
  .value(function (d) {
    return d.count;
  })
  .sort(null);

const arc = d3
  .arc()
  .innerRadius(radius - 80)
  .outerRadius(radius - 20);

const svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

d3.tsv('data/donut2.tsv', type).then(data => {
  console.log(data);

  const regionsByFruit = d3
    .nest()
    .key(function (d) {
      return d.fruit;
    })
    .entries(data)
    .reverse();

  console.log(regionsByFruit);

  const label = d3
    .select('form')
    .selectAll('label')
    .data(regionsByFruit)
    .enter()
    .append('label');

  label
    .append('input')
    .attr('type', 'radio')
    .attr('name', 'fruit')
    .attr('value', function (d) {
      return d.key;
    })
    .on('change', change)
    .filter(function (d, i) {
      return !i;
    })
    .each(change)
    .property('checked', true);

  label.append('span').text(function (d) {
    return d.key;
  });

  function change(region) {
    let path = svg.selectAll('path');

    const data0 = path.data(),
      data1 = pie(region.values);

    // JOIN elements with new data.
    path = path.data(data1, key);

    // EXIT old elements from the screen.
    path
      .exit()
      .datum(function (d, i) {
        return findNeighborArc(i, data1, data0, key) || d;
      })
      .transition()
      .duration(750)
      .attrTween('d', arcTween)
      .remove();

    // UPDATE elements still on the screen.
    path.transition().duration(750).attrTween('d', arcTween);

    // ENTER new elements in the array.
    path
      .enter()
      .append('path')
      .each(function (d, i) {
        this._current = findNeighborArc(i, data0, data1, key) || d;
      })
      .attr('fill', function (d) {
        return color(d.data.region);
      })
      .transition()
      .duration(750)
      .attrTween('d', arcTween);
  }
});

function key(d) {
  return d.data.region;
}

function type(d) {
  d.count = +d.count;
  return d;
}

function findNeighborArc(i, data0, data1, key) {
  let d;
  return (d = findPreceding(i, data0, data1, key))
    ? { startAngle: d.endAngle, endAngle: d.endAngle }
    : (d = findFollowing(i, data0, data1, key))
    ? { startAngle: d.startAngle, endAngle: d.startAngle }
    : null;
}

// Find the element in data0 that joins the highest preceding element in data1.
function findPreceding(i, data0, data1, key) {
  const m = data0.length;
  while (--i >= 0) {
    const k = key(data1[i]);
    for (var j = 0; j < m; ++j) {
      if (key(data0[j]) === k) return data0[j];
    }
  }
}

// Find the element in data0 that joins the lowest following element in data1.
function findFollowing(i, data0, data1, key) {
  const n = data1.length,
    m = data0.length;
  while (++i < n) {
    const k = key(data1[i]);
    for (var j = 0; j < m; ++j) {
      if (key(data0[j]) === k) return data0[j];
    }
  }
}

function arcTween(d) {
  const i = d3.interpolate(this._current, d);
  this._current = i(1);
  return function (t) {
    return arc(i(t));
  };
}
