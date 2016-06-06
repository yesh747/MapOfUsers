var userDataset = 'sampledata.json'
var topojsonFile = 'us-states-and-counties.json'
var maxUsersInState = 1000 //maximum number of users in a state
var maxUsers = 10000000

//global variables
var userLocationData = {} //contains users' GPS coordinates, state, and county
var stateId = {} //contains state name, ID, and number of runners in each state
var countyId = {} //contains county name, ID, and number of runners in each county

//boundaries and setup for svg object and map object
var w = 1000,
    h = 1000,
    r = 1,
    x = 0,
    y = 75
var svg = d3.select('body').append('svg')
  .attr('width', w)
  .attr('height', h)

//color and gradient properties
var gradient = ["#EFEFEF", "#D4E9E9", "#B9E3E4", "#9FDDDE", "#84D7D9", "#6AD1D3", "#4FCBCE", "#35C5C8", "#1ABFC3", "#00B9BE"]
var colorScale = d3.scale.linear()
  .domain([0,gradient.length-1])
  .range([0,maxUsersInState])
var gradientValues = []
  for (var i=0; i<gradient.length-1; i++){
    gradientValues[i] = Math.round(colorScale(i)/100)*100
    gradientValues[i+1] = maxUsers
  }
var tempcolor

//tooltip
var tooltip = d3.select('body').append('div')
  .attr('class','tooltip')

//create Raphael object to use isPointInside
var temp = svg.append('div').attr('id', 'extra');
var paper = new Raphael('extra');


//Projection type of map
var projection = d3.geo.albersUsa()
  .scale(1000);
var path = d3.geo.path()
  .projection(projection)

//Fill in global datasets with appropriate informations
d3.json(topojsonFile, function(us){
  var dataStates = topojson.feature(us, us.objects.states).features
  var dataCounties = topojson.feature(us, us.objects.counties).features

  //states
  d3.tsv("us-state-names.tsv", function(tsv){
    tsv.forEach(function(d, i){
      stateId[d.id] = {'name': d.name}
      stateId[d.id]['counties'] = {}
      for (var j=0; j < dataStates.length; j++){
        if (d.id == dataStates[j].id){
          //stateId[d.id]['geometry'] = dataStates[j].geometry
          stateId[d.id]['path'] = path(dataStates[j].geometry)
          stateId[d.id]['totalRunners'] = 0
        }
      }
    })
  })
  //counties
  d3.tsv("us-county-names.tsv", function(tsv){
    tsv.forEach(function(d, i){
      stateId[Math.floor(d.id/1000)]['counties'][d.name] = {'id': d.id}
      for (var j=0; j < dataCounties.length; j++){
        if (d.id == dataCounties[j].id){
          stateId[Math.floor(d.id/1000)]['counties'][d.name]['geometry'] = dataCounties[j].geometry
        }
      }
    })
    console.log(stateId)
  })

  //users
  d3.json(userDataset, function(d){
    for (var i = 0; i < d.user.length; i++) {
      var location = d.user[i].run[0].loc[0].map(Number);
      userLocationData[i] = {'location':{'latitude': location[0], 'longitude': location[1]}}
      for (key in stateId) {
        var pixelLocation = projection([userLocationData[i].location.longitude,userLocationData[i].location.latitude])
        var p = paper.path(stateId[key].path).attr('stroke', 'none')
        if (p.isPointInside(pixelLocation[0], pixelLocation[1])){
          //add state to user
          userLocationData[i]['state'] = stateId[key]['name']
          //add 1 to stateId[key]['Runners']
          stateId[key]['totalRunners'] = stateId[key]['totalRunners']+Math.round(Math.random()*1000)
        }
      }
    }
    console.log(userLocationData)
    drawMap()
  })
})

//Draw Map
function drawMap() {
  var state = svg.append('g')
    .attr('class', 'state')
    .attr('transform', 'translate('+x+','+y+')')
    .selectAll('path').data(d3.keys(stateId))
    .enter().append('path')
    .attr('d', function(d){
      return (stateId[d]['path'])
    })
    .attr('id', function(d){
      return stateId[d]['name'];
    })
    .attr('fill', function(d){
      for (var i=0; i<gradientValues.length; i++){
        if (stateId[d].totalRunners > gradientValues[i] && stateId[d].totalRunners <= gradientValues[i+1]){
          return gradient[i+1]
        }
      }
      return '#efefef'
    })
    .attr('stroke', 'white')
    .attr('stroke-width', '2px')
    .on('mouseover', function(d){
      tempcolor = this.style.fill
      d3.select(this).style('fill', '#000000')
      //tooltip to display county and state names
      var tooltipDisplay = stateId[d].name + '<br>' + stateId[d].totalRunners + ' Dream Runners'
      tooltip.transition()
        .style('opacity', 1)
      tooltip.html(tooltipDisplay)
        .style('left', '0px') //d3.event.pageX-40 + 'px')
        .style('top', '0px') //d3.event.pageY-30 + 'px')
        .style('font-size','30px')
        .style('padding', '15px')
    })
    .on('mouseout', function(){
      d3.select(this).style('fill', tempcolor)
    })
}
