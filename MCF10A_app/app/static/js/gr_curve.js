
// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scale.log().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

var color = d3.scale.category10();

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(10, ",.1s");

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(10);

// Define the line
var line = d3.svg.line()
	.interpolate("basis")
    .x(function(d) { return x(d.concentration); })
    .y(function(d) { return y(d.GR); });
    
// Adds the svg canvas
var svg = d3.select(".gr-curve")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

d3.csv("../static/data/gr/curve_datapoints/Dasatinib_curve_datapoints.csv", function(error, data) {
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "concentration"; }));

  data.forEach(function(d) {
    d.concentration = +d.concentration;
  });

  var GR_values = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {concentration: d.concentration, GR: +d[name]};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.concentration; }));

  y.domain([
    d3.min(GR_values, function(c) { return d3.min(c.values, function(v) { return v.GR; }); }),
    d3.max(GR_values, function(c) { return d3.max(c.values, function(v) { return v.GR; }); })
  ]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  //x axis label
  svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Concentration");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  //y axis label
  svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("GR value");

  var GR_val = svg.selectAll(".GR_val")
      .data(GR_values)
    .enter().append("g")
      .attr("class", "GR_val");

  GR_val.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.name); })
      .append("title")
      .text(function(d) {
        return "Replicate: " + d.name;
       });
});

