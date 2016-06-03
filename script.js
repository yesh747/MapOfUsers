var userLocationData = [];

d3.json('sampledata.json', function(d){
  for (var i = 0; i < d.user.length; i++) {
    var location = d.user[i].run[0].loc[0].map(Number);
    for (var x = 0; x<location.length; x++) {
      location[x] = location[x].toFixed(2);
    }
    console.log(location)
    userLocationData.push(location);
  };
})

var w = 960,
    h = 500,
    r = 1;
var tempcolor;
var gradient = ["#00F2FF", "#0AE8F5", "#14DFEB", "#1ED5E1", "#28CCD7", "#32C2CD", "#3CB9C3", "#46AFB9", "#50A6AE", "#5A9CA5", "#64939B", "#6E8991", "#788087", "#82767D", "#8C6D72", "#966369", "#A05A5F", "#AA5054", "#B4474B", "#BE3D41", "#C83436", "#D22A2D", "#DC2123", "#E61718", "#F00E0F", "#FA0505", "#EF0F05", "#E51906", "#DA2307", "#D02D07", "#C53708", "#BB4109", "#B14B09", "#A6550A", "#9C5F0B", "#91690B", "#87730C", "#7D7E0D", "#72880D", "#68920E", "#5D9C0F", "#53A60F", "#48B010", "#3EBA11", "#34C411", "#29CE12", "#1FD813", "#14E213", "#0AEC14", "#00F715"]
var svg = d3.select('body').append('svg')
  .attr('width', w)
  .attr('height', h)

var projection = d3.geo.albersUsa()
  .scale(1000)

var path = d3.geo.path()
  .projection(projection)

d3.json('counties.json', function(error, us){
  if (error) throw error;

  var counties = svg.append('g')
    .attr('class', 'counties-boundary')
    .selectAll('path').data(topojson.feature(us, us.objects.counties).features)
    .enter().append('path')
    .attr('d', path)
    .attr('fill', '#efefef')
    .attr('stroke','#ffffff').attr('stroke-width', '.5')
    .on('mouseover', function(){
      d3.select(this).attr('fill', 'red');
    })
    .on('mouseout', function(){
      d3.select(this).attr('fill', '#efefef');
    });

  var state = svg.append('g')
    .attr('class', 'state-boundary')
    .selectAll('path').data(topojson.feature(us, us.objects.states).features)
    .enter().append('path')
    .attr('d', path)
    .attr('fill', 'none').attr('stroke','#ffffff').attr('stroke-width', '2');

  var users = svg.append('g').attr('class', 'users')
  .selectAll('circle').data(userLocationData)
  .enter().append('circle')
  .attr('fill', 'red')
  .attr('opacity', .5)
  .attr('r', r)
  .attr('transform', function(d){
    console.log([d[1], d[0]])
    console.log(projection([d[1], d[0]]))
    return 'translate('+projection([d[1], d[0]])+')';
  })
})
