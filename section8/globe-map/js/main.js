const width = 600,
  height = 400;

const projection = d3
  // .geoConicEqualArea() // 地図表示を帰る場合はここを変更する
  .geoMercator()
  .scale(153)
  .translate([width / 2, height / 2])
  .precision(0.1);

// d3.geoPath()は地図グラフのpath generatorで、他の折れ線グラフのline generatorなどと同じです
const path = d3.geoPath().projection(projection);

// 経緯線を作成するためのジオメトリジェネレータを構築します。投影の歪みを示すための子午線と緯線の均一なグリッドです。デフォルトの経緯線には子午線があり、緯度±80°の間で10°ごとに緯線があります。極地では、90°ごとに子午線があります。
const graticule = d3.geoGraticule();

const svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

d3.json('data/world-110m.json')
  .then(world => {
    console.log(world); // Topology
    console.log(topojson.feature(world, world.objects.land)); // topojson のデータをGeoJSONのフォーマットに変える
    console.log(graticule);

    // mesh . . . TopoJSONのデータを受け取って一本のパスストリング(svg/pathのd要素に渡す値)として返すメソッド
    svg
      .append('path')
      .datum(topojson.feature(world, world.objects.land))
      .attr('class', 'land')
      .attr('d', path);

    svg
      .append('path')
      .datum(
        topojson.mesh(world, world.objects.countries, function (a, b) {
          return a !== b;
        })
      )
      .attr('class', 'boundary')
      .attr('d', path);

    svg
      .append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path);
  })
  .catch(err => console.log(err));

d3.select(self.frameElement).style('height', height + 'px');
