//global variables
var userLocationData = [];
var stateId = {};
var countyId = {};


//get location data from user data
d3.json('sampledata.json', function(d){
  for (var i = 0; i < d.user.length; i++) {
    var location = d.user[i].run[0].loc[0].map(Number);
    // //reduce precision of GPS coordinates for grouping effect
    // for (var x = 0; x<location.length; x++) {
    //   location[x] = location[x].toFixed(2);
    // }
    userLocationData.push(location);
  };
})

//get state and county names for id numbers of the counties.json file
d3.json('counties.json', function(d){
  var dataState = topojson.feature(d, d.objects.states).features;
  var dataCounties = topojson.feature(d, d.objects.counties).features;

  d3.tsv("us-state-names.tsv", function(tsv){
      tsv.forEach(function(d, i){
        stateId[d.id] = d.name;
      })
    })
  d3.tsv("us-county-names.tsv", function(tsv){
    tsv.forEach(function(d, i){
      countyId[d.id] = d.name;
    })
  })
})

//boundaries and setup for svg object and map object
var w = 960,
    h = 500,
    r = 1;
var tempcolor;
var svg = d3.select('body').append('svg')
  .attr('width', w)
  .attr('height', h)

//tooltip
var tooltip = d3.select('body').append('div')
  .attr('class','tooltip');

//Projection type of map
var projection = d3.geo.albersUsa()
  .scale(1000)
var path = d3.geo.path()
  .projection(projection)

//Creating map from json file
d3.json('counties.json', function(error, us){
  if (error) throw error;

//display counties
  var counties = svg.append('g')
    .attr('class', 'county-boundary')
    .selectAll('path').data(topojson.feature(us, us.objects.counties).features)
    .enter().append('path')
    .attr('d', path)
    .attr('fill', '#efefef')
    .attr('stroke','#ffffff').attr('stroke-width', '.5')
    .on('mouseover', function(d){
      d3.select(this).attr('fill', 'blue');
//tooltip to display county and state names
      tooltip.transition()
        .style('opacity', .7)
      tooltip.html(countyId[d.id] + ', ' + stateId[Math.round(d.id/1000)])
        .style('left', d3.event.pageX-40 + 'px')
        .style('top', d3.event.pageY-30 + 'px')
        .style('font-size','8px')
        .style('padding', '2px')
    })
    .on('mouseout', function(){
      d3.select(this).attr('fill', '#efefef');
    });

//display states
  var state = svg.append('g')
    .attr('class', 'state-boundary')
    .selectAll('path').data(topojson.feature(us, us.objects.states).features)
    .enter().append('path')
    .attr('d', path)
    .attr('fill', 'none').attr('stroke','#ffffff').attr('stroke-width', '2');

//display user-locations on map
  var users = svg.append('g').attr('class', 'users')
  .selectAll('circle').data(userLocationData)
  .enter().append('circle')
  .attr('fill', 'red')
  .attr('opacity', .2)
  .attr('r', r)
  .attr('transform', function(d){
    return 'translate('+projection([d[1], d[0]])+')';
  })
})
