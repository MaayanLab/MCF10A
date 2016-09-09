// UTILITY FUNCTION defined in main.js
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


//"../static/data/gr/curve_datapoints/Trametinib_curve_datapoints.csv"
var grScales = {
  'xScale': NaN,
  'yScale': NaN,
  'colorScale': NaN,
}

// Set the dimensions of the graph
  var margin = {top: 30, right: 20, bottom: 100, left: 60},
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom,
      padding = 10,
      leftMidline = (margin.left - padding) / 2,
      bottomMidline = (margin.bottom - padding*4) / 2;

  var boxplotWidth = 20;

//drawGRCurve("../static/data/gr/curve_datapoints/Trametinib_curve_datapoints.csv");
drawGRCurve("../static/data/gr/curve_datapoints/" + window.drug.capitalize() + "_curve_datapoints.csv");

function drawGRCurve(datapointsFilename){
  console.log("drawing drawGRCurve()");

  // Set the ranges
  grScales.xScale = d3.scale.log().range([0, width]);
  grScales.yScale = d3.scale.linear().range([height, 0]);

  grScales.colorScale = d3.scale.category10();

  // Define the axes
  var xAxis = d3.svg.axis().scale(grScales.xScale)
      .orient("bottom").ticks(10, ",.1s");

  var yAxis = d3.svg.axis().scale(grScales.yScale)
      .orient("left").ticks(10);

  // Define the line
  var line = d3.svg.line()
    .interpolate("basis")
      .x(function(d) { return grScales.xScale(d.concentration); })
      .y(function(d) { return grScales.yScale(d.GR); });

  // Adds the svg canvas
  var svgCanvas = d3.select(".gr-curve")
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);
  var svg = svgCanvas.append("g")
          .attr("transform", 
                "translate(" + (margin.left + leftMidline * 2) + "," + margin.top + ")");
  var svgGRInf = svgCanvas.append("g")
          .attr("transform",
                "translate(10," + margin.top + ")");
  var svgGEC50 = svgCanvas.append("g")
          .attr("transform",
                "translate(110," + (height + margin.bottom- (boxplotWidth)) + ")");

/*  svg.append("text")
          .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom- (boxplotWidth*3.5)) + ")")
          .style("text-anchor", "middle")
          .text("Concentration");*/

  d3.csv(datapointsFilename, function(error, data) {
    if (error) throw error;

    grScales.colorScale.domain(d3.keys(data[0]).filter(function(key) { return key !== "concentration"; }));

    data.forEach(function(d) {
      d.concentration = +d.concentration;
    });

    var GR_values = grScales.colorScale.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {concentration: d.concentration, GR: +d[name]};
        })
      };
    });

    grScales.xScale.domain(d3.extent(data, function(d) { return d.concentration; }));

    /*y.domain([
      d3.min(GR_values, function(c) { return d3.min(c.values, function(v) { return v.GR; }); }),
      d3.max(GR_values, function(c) { return d3.max(c.values, function(v) { return v.GR; }); })
    ]);*/
    grScales.yScale.domain([
      -1.0,
      1.0
    ]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //x axis label
    svg.append("text")
          .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom- (boxplotWidth*3.5)) + ")")
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
        .style("stroke", function(d) { return grScales.colorScale(d.name); })
        .append("title")
        .text(function(d) {
          return "Replicate: " + d.name;
         });
  });

  drawVerticalBoxplot("../static/data/gr/metrics/MCF10A_" + window.drug + "_GR.tsv", 'GRinf', svgGRInf);
  drawHorizontalBoxplot("../static/data/gr/metrics/MCF10A_" + window.drug + "_GR.tsv", 'GEC50', svgGEC50);
}


    

//gr_boxplot("../static/data/gr/metrics/MCF10A_trametinib_GR.tsv");


var gr_boxplot = function(filename){
    drawBoxplot(filename, 'GEC50', 'gec50-boxplot')
    drawBoxplot(filename, 'GRinf', 'grinf-boxplot')
    drawBoxplot(filename, 'Hill', 'hill-boxplot')
}
//gr_boxplot("../static/data/gr/metrics/MCF10A_trametinib_GR.tsv");

function drawVerticalBoxplot(filename, parameter, svg){
/*  //initialize the dimensions
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 800 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom,
    padding = 20
    midline = (height - padding) / 2;*/

  var data = [],
    outliers = [],
    minVal = Infinity,
    lowerWhisker = Infinity,
    q1Val = Infinity,
    medianVal = 0,
    q3Val = -Infinity,
    iqr = 0,
    upperWhisker = -Infinity,
    maxVal = -Infinity;

  //hill
  d3.tsv(filename, function(csv) { // load the data
    
    data = csv.map(function(d) {
      return +d[parameter];
    });

    data = data.sort(d3.ascending);

    //calculate the boxplot statistics
    minVal = data[0],
    q1Val = d3.quantile(data, .25),
    medianVal = d3.quantile(data, .5),
    q3Val = d3.quantile(data, .75),
    iqr = q3Val - q1Val,
    maxVal = data[data.length - 1];
    lowerWhisker = d3.max([minVal, q1Val - iqr])
    upperWhisker = d3.min([maxVal, q3Val + iqr]);

    var index = 0;

    //search for the lower whisker, the mininmum value within q1Val - 1.5*iqr
    while (index < data.length && lowerWhisker == Infinity) {

      if (data[index] >= (q1Val - 1.5*iqr))
        lowerWhisker = data[index];
      else
        outliers.push(data[index]);
      index++;
    }

    index = data.length-1; // reset index to end of array

    //search for the upper whisker, the maximum value within q1Val + 1.5*iqr
    while (index >= 0 && upperWhisker == -Infinity) {

      if (data[index] <= (q3Val + 1.5*iqr))
        upperWhisker = data[index];
      else
        outliers.push(data[index]);
      index--;
    }
   
    //map the domain to the x scale +10%
    //xScale.domain([minVal*0.1,maxVal*1.10]);

/*    var svg = d3.select("." + boxplotClass)
                .append("svg")
                .attr("width", width)
                .attr("height", height);*/

    //draw horizontal line for lowerWhisker
    svg.append("line")
       .attr("class", "whisker")
       .attr("x1", leftMidline - boxplotWidth)
       .attr("x2", leftMidline + boxplotWidth)
       .attr("stroke", "black")
       .attr("y1", grScales.yScale(lowerWhisker))
       .attr("y2", grScales.yScale(lowerWhisker));

    //draw horizontal line for upperWhisker
    svg.append("line")  
       .attr("class", "whisker")
       .attr("x1", leftMidline - boxplotWidth)
       .attr("x2", leftMidline + boxplotWidth)
       .attr("stroke", "black")
       .attr("y1", grScales.yScale(upperWhisker))
       .attr("y2", grScales.yScale(upperWhisker) );

    //draw vertical line from lowerWhisker to upperWhisker
    svg.append("line")
       .attr("class", "whisker")
       .attr("x1",  leftMidline)
       .attr("x2",  leftMidline)
       .attr("stroke", "black")
       .attr("y1", grScales.yScale(lowerWhisker))
       .attr("y2", grScales.yScale(upperWhisker));


    //draw rect for iqr
    svg.append("rect")    
       .attr("class", "box")
       .attr("stroke", "black")
       .attr("fill", "white")
       .attr("x", leftMidline - boxplotWidth)
       .attr("y", grScales.yScale(q3Val))
       .attr("width", boxplotWidth*2)
       .attr("height", grScales.yScale(q1Val) - grScales.yScale(q3Val));

    //draw vertical line at median
    svg.append("line")
       .attr("class", "median")
       .attr("stroke", "black")
       .attr("x1", leftMidline - boxplotWidth)
       .attr("x2", leftMidline + boxplotWidth)
       .attr("y1", grScales.yScale(medianVal))
       .attr("y2", grScales.yScale(medianVal));

    //add label for median value
    svg.append("text")
        .attr("x", -boxplotWidth)
        .attr("y", grScales.yScale(medianVal) )
        .attr("dy", ".2em")
        .attr("style", "font-size:0.75em")
        .text(medianVal.toFixed(2));

    //draw data as points
    svg.selectAll("circle")
       .data(csv)     
       .enter()
       .append("circle")
       .attr("r", 2.5)
       .attr("class", function(d) {
        if (d[parameter] < lowerWhisker || d[parameter] > upperWhisker)
          return "outlier";
        else 
          return "point";
       })     
       .attr("cx", function(d) {
        return random_jitter(leftMidline);
       }) 
       .attr("cy", function(d) {
        return grScales.yScale(d[parameter]);   
       })
       .style("fill", function(d) { return grScales.colorScale(d.Replicate); })
       .append("title")
       .text(function(d) {
        return "Replicate: " + d.Replicate + ";" + parameter + ": " + d[parameter];
       }); 
})
}

function drawHorizontalBoxplot(filename, parameter, svg){
  var data = [],
    outliers = [],
    minVal = Infinity,
    lowerWhisker = Infinity,
    q1Val = Infinity,
    medianVal = 0,
    q3Val = -Infinity,
    iqr = 0,
    upperWhisker = -Infinity,
    maxVal = -Infinity;

  //hill
  d3.tsv(filename, function(csv) { // load the data
    
    data = csv.map(function(d) {
      return +d[parameter];
    });

    data = data.sort(d3.ascending);

    //calculate the boxplot statistics
    minVal = data[0],
    q1Val = d3.quantile(data, .25),
    medianVal = d3.quantile(data, .5),
    q3Val = d3.quantile(data, .75),
    iqr = q3Val - q1Val,
    maxVal = data[data.length - 1];
    lowerWhisker = d3.max([minVal, q1Val - iqr])
    upperWhisker = d3.min([maxVal, q3Val + iqr]);

    var index = 0;

    //search for the lower whisker, the mininmum value within q1Val - 1.5*iqr
    while (index < data.length && lowerWhisker == Infinity) {

      if (data[index] >= (q1Val - 1.5*iqr))
        lowerWhisker = data[index];
      else
        outliers.push(data[index]);
      index++;
    }

    index = data.length-1; // reset index to end of array

    //search for the upper whisker, the maximum value within q1Val + 1.5*iqr
    while (index >= 0 && upperWhisker == -Infinity) {

      if (data[index] <= (q3Val + 1.5*iqr))
        upperWhisker = data[index];
      else
        outliers.push(data[index]);
      index--;
    }
   
    //map the domain to the x scale +10%
    //xScale.domain([minVal*0.1,maxVal*1.10]);

/*    var svg = d3.select("." + boxplotClass)
                .append("svg")
                .attr("width", width)
                .attr("height", height);*/

    //draw horizontal line for lowerWhisker
    svg.append("line")
       .attr("class", "whisker")
       .attr("x1", grScales.xScale(lowerWhisker))
       .attr("x2", grScales.xScale(lowerWhisker))
       .attr("stroke", "black")
       .attr("y1", bottomMidline - boxplotWidth )
       .attr("y2", bottomMidline + boxplotWidth );

    //draw horizontal line for upperWhisker
    svg.append("line")  
       .attr("class", "whisker")
       .attr("x1", grScales.xScale(upperWhisker))
       .attr("x2", grScales.xScale(upperWhisker))
       .attr("stroke", "black")
       .attr("y1", bottomMidline - boxplotWidth)
       .attr("y2", bottomMidline + boxplotWidth);

    //draw vertical line from lowerWhisker to upperWhisker
    svg.append("line")
       .attr("class", "whisker")
       .attr("x1",  grScales.xScale(lowerWhisker))
       .attr("x2",  grScales.xScale(upperWhisker))
       .attr("stroke", "black")
       .attr("y1", bottomMidline)
       .attr("y2", bottomMidline);


    console.log("q1Val=" + q1Val + " iqr=" + iqr);
    //draw rect for iqr
    //iqr = q3Val - q1Val,
    svg.append("rect")    
       .attr("class", "box")
       .attr("stroke", "black")
       .attr("fill", "white")
       .attr("x", grScales.xScale(q1Val))
       .attr("y", bottomMidline - boxplotWidth )
       .attr("width", grScales.xScale(q3Val) - grScales.xScale(q1Val))
       .attr("height", boxplotWidth*2 );

    //draw vertical line at median
    svg.append("line")
       .attr("class", "median")
       .attr("stroke", "black")
       .attr("x1", grScales.xScale(medianVal))
       .attr("x2", grScales.xScale(medianVal))
       .attr("y1", bottomMidline - boxplotWidth)
       .attr("y2", bottomMidline + boxplotWidth);

    //add label for median value
    svg.append("text")
        .attr("x", grScales.xScale(medianVal)-20 )
        .attr("y", 0 )
        .attr("dy", ".2em")
        .attr("style", "font-size:0.75em")
        .text(medianVal);

    //draw data as points
    svg.selectAll("circle")
       .data(csv)     
       .enter()
       .append("circle")
       .attr("r", 2.5)
       .attr("class", function(d) {
        if (d[parameter] < lowerWhisker || d[parameter] > upperWhisker)
          return "outlier";
        else 
          return "point";
       })     
       .attr("cy", function(d) {
        return random_jitter(bottomMidline);
       }) 
       .attr("cx", function(d) {
        return grScales.xScale(d[parameter]);   
       })
       .style("fill", function(d) { return grScales.colorScale(d.Replicate); })
       .append("title")
       .text(function(d) {
        return "Replicate: " + d.Replicate + ";" + parameter + ": " + d[parameter];
       }); 
})
}