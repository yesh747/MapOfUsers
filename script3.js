//global variables
var userLocationData = []; //contains users GPS coordiantes
var stateId = {}; //contains state name and ID
var countyId = {}; //contains county name and ID

//boundaries and setup for svg object and map object
var w = 960,
    h = 500,
    r = 1;
var tempcolor;
var svg = d3.select('body').append('svg')
  .attr('width', w)
  .attr('height', h);

//tooltip
var tooltip = d3.select('body').append('div')
  .attr('class','tooltip');

//Projection type of map
var projection = d3.geo.albersUsa()
  .scale(1000);
var path = d3.geo.path()
  .projection(projection);

  //get state and county names for id numbers of the counties.json file
function getIdData() {
  d3.json('counties.json', function(d){
    var dataState = topojson.feature(d, d.objects.states).features;
    var dataCounties = topojson.feature(d, d.objects.counties).features;

    //states
    d3.tsv("us-state-names.tsv", function(tsv){
      tsv.forEach(function(d, i){
        stateId[d.id] = [d.name, 0];
      });
    });

    //counties
    d3.tsv("us-county-names.tsv", function(tsv){
      tsv.forEach(function(d, i){
        countyId[d.id] = [d.name, 0];
      });
    });
    console.log(countyId)
  });
}

//get location data from user data
function getUserLocationData() {
  d3.json('sampledata.json', function(d){
    for (var i = 0; i < d.user.length; i++) {
      var location = d.user[i].run[0].loc[0].map(Number);
      userLocationData.push(location);
    };
  console.log(userLocationData.length)
  });
}

//Create Promise
var combinedPromise = $.when(getIdData(), getUserLocationData())


//Execute once promise is complete
//Creating map from json file
combinedPromise.done(function(){
  d3.json('counties.json', function(error, us){
    if (error) throw error;

    //create div for extra stuff
    var temp = svg.append('div').attr('id', 'extra');

    //display counties
    var counties = svg.append('g')
      .attr('class', 'county-boundary')
      .selectAll('path').data(topojson.feature(us, us.objects.counties).features)
      .enter().append('path')
      .attr('d', path)
      .attr('fill', function(d){
        var paper = new Raphael('extra');
        var countyPath = path(d);
        var fill = '#efefef'
        function colorFill(){
          for (var j = 0; j < userLocationData.length; j++){
            var pixelLocation = projection([userLocationData[j][1], userLocationData[j][0]])
            var p = paper.path(countyPath).attr('stroke', 'none')
            if (p.isPointInside(pixelLocation[0], pixelLocation[1])){
              countyId[d.id][1] = countyId[d.id][1]+1
              console.log('user ' +(j)+ ' run in the county of ' +countyId[d.id][0]+ ' in the state of '+stateId[Math.floor(d.id/1000)][0]+ '.')
              fill = 'red';
            }
          }
        }
        var colorPromise = $.when(colorFill())
        colorPromise.done(function(){
          return fill;
        });
      })
      .attr('stroke','#ffffff').attr('stroke-width', '.25')
      .on('mouseover', function(d){
        tempcolor = this.style.fill;
        d3.select(this).style('fill', 'blue');
        //tooltip to display county and state names
        var tooltipDisplay =  countyId[d.id][1]+ ' Runners in '+countyId[d.id][0] + ', ' + stateId[Math.floor(d.id/1000)][0]
        tooltip.transition()
          .style('opacity', .7);
        tooltip.html(tooltipDisplay)
          .style('left', d3.event.pageX-40 + 'px')
          .style('top', d3.event.pageY-30 + 'px')
          .style('font-size','8px')
          .style('padding', '2px');
      })
      .on('mouseout', function(){
        d3.select(this).style('fill', tempcolor);
      });

    //display states
    var state = svg.append('g')
      .attr('class', 'state-boundary')
      .attr('id', 'state-boundary')
      .selectAll('path').data(topojson.feature(us, us.objects.states).features)
      .enter().append('path')
      .attr('d', path)
      .attr('id', function(d){
        return stateId[d.id][0];
      })
      .attr('fill', function(d){
        // var paper = new Raphael('extra');
        // var statePath = path(d);
        // for (var j = 0; j < userLocationData.length; j++){
        //   var pixelLocation = projection([userLocationData[j][1], userLocationData[j][0]])
        //   var p = paper.path(statePath).attr('stroke', 'black')
        //   if (p.isPointInside(pixelLocation[0], pixelLocation[1])){
        //     stateId[d.id].push(statePath)
        //     console.log('user ' +(j)+ ' is inside county of ' +countyId[d.id][0]+ ' in the state of '+stateId[Math.floor(d.id/1000)][0]+ '.')
        //     return 'red';
        //   }
        // }
        return 'none';
      })
      .attr('stroke','#ffffff').attr('stroke-width', '1');

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
})

combinedPromise.fail(function(ex){
  alert("oops, some problem occured: " + ex);
});
