//http://bl.ocks.org/mattbrehmer/12ea86353bc807df2187




var gr_boxplot = function(filename){
  //initialize the dimensions
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 800 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom,
    padding = 20
    midline = (height - padding) / 2;

//initialize the x scale
var xScale = d3.scale.linear()
               .range([padding, width - padding]);  

//initialize the x axis
var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom");

    //initialize boxplot statistics
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

  //GEC50
  console.log("GEC50");
  d3.tsv(filename, function(csv) { // load the data
    
    data = csv.map(function(d) {
      return +d.GEC50;
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
    xScale.domain([minVal*0.1,maxVal*1.10]);

    var svg = d3.select(".gec50-boxplot")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

    //draw verical line for lowerWhisker
    svg.append("line")
       .attr("class", "whisker")
       .attr("x1", xScale(lowerWhisker))
       .attr("x2", xScale(lowerWhisker))
       .attr("stroke", "black")
       .attr("y1", midline - 10)
       .attr("y2", midline + 10);

    //draw vertical line for upperWhisker
    svg.append("line")  
       .attr("class", "whisker")
       .attr("x1", xScale(upperWhisker))
       .attr("x2", xScale(upperWhisker))
       .attr("stroke", "black")
       .attr("y1", midline - 10)
       .attr("y2", midline + 10);

    //draw horizontal line from lowerWhisker to upperWhisker
    svg.append("line")
       .attr("class", "whisker")
       .attr("x1",  xScale(lowerWhisker))
       .attr("x2",  xScale(upperWhisker))
       .attr("stroke", "black")
       .attr("y1", midline)
       .attr("y2", midline);

    //draw rect for iqr
    svg.append("rect")    
       .attr("class", "box")
       .attr("stroke", "black")
       .attr("fill", "white")
       .attr("x", xScale(q1Val))
       .attr("y", padding)
       .attr("width", xScale(iqr) - padding)
       .attr("height", 20);

    //draw vertical line at median
    svg.append("line")
       .attr("class", "median")
       .attr("stroke", "black")
       .attr("x1", xScale(medianVal))
       .attr("x2", xScale(medianVal))
       .attr("y1", midline - 10)
       .attr("y2", midline + 10);

    //add label for median value
    svg.append("text")
        .attr("x", xScale(medianVal)-15)
        .attr("y", midline - 20)
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
        if (d.GEC50 < lowerWhisker || d.GEC50 > upperWhisker)
          return "outlier";
        else 
          return "point";
       })     
       .attr("cy", function(d) {
        return random_jitter();
       }) 
       .attr("cx", function(d) {
        return xScale(d.GEC50);   
       })
       .style("fill", function(d) { return color(d.Replicate); })
       .append("title")
       .text(function(d) {
        return "Replicate: " + d.Replicate + "; GEC50: " + d.GEC50;
       }); 

  })

    //initialize boxplot statistics
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

  //GRinf
  d3.tsv(filename, function(csv) { // load the data
    
    data = csv.map(function(d) {
      return +d.GRinf;
    });

    data = data.sort(d3.ascending);
    var orig_min = data[0];
    var orig_max = data[data.length - 1];
    var orig_medianVal = d3.quantile(data, .5);

    var scale_for_neg = false;

    if (orig_min < 0) {
      data.forEach(
        function absValueElements(element, index, array){
          array[index] = element + Math.abs(orig_min)
        })
      data = data.sort(d3.ascending);
      scale_for_neg = true;
    }

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
    xScale.domain([minVal*0.1,maxVal*1.10]);

    var svg = d3.select(".grinf-boxplot")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

    //append the axis
/*    svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0, " + (height - padding) + ")")
       .call(xAxis);*/

    //draw verical line for lowerWhisker
    svg.append("line")
       .attr("class", "whisker")
       .attr("x1", xScale(lowerWhisker))
       .attr("x2", xScale(lowerWhisker))
       .attr("stroke", "black")
       .attr("y1", midline - 10)
       .attr("y2", midline + 10);

    //draw vertical line for upperWhisker
    svg.append("line")  
       .attr("class", "whisker")
       .attr("x1", xScale(upperWhisker))
       .attr("x2", xScale(upperWhisker))
       .attr("stroke", "black")
       .attr("y1", midline - 10)
       .attr("y2", midline + 10);

    //draw horizontal line from lowerWhisker to upperWhisker
    svg.append("line")
       .attr("class", "whisker")
       .attr("x1",  xScale(lowerWhisker))
       .attr("x2",  xScale(upperWhisker))
       .attr("stroke", "black")
       .attr("y1", midline)
       .attr("y2", midline);

    //draw rect for iqr
    svg.append("rect")    
       .attr("class", "box")
       .attr("stroke", "black")
       .attr("fill", "white")
       .attr("x", xScale(q1Val))
       .attr("y", padding)
       .attr("width", xScale(iqr) - padding)
       .attr("height", 20);

    //draw vertical line at median
    svg.append("line")
       .attr("class", "median")
       .attr("stroke", "black")
       .attr("x1", xScale(medianVal))
       .attr("x2", xScale(medianVal))
       .attr("y1", midline - 10)
       .attr("y2", midline + 10);

    //add label for median value
    svg.append("text")
        .attr("x", xScale(medianVal)-15)
        .attr("y", midline - 20)
        .attr("dy", ".2em")
        .attr("style", "font-size:0.75em")
        .text(orig_medianVal.toFixed(2));

    //draw data as points
    svg.selectAll("circle")
       .data(csv)     
       .enter()
       .append("circle")
       .attr("r", 2.5)
       .attr("class", function(d) {
        var val = d.GRinf;
        if (scale_for_neg){
          val = +d.GRinf + Math.abs(orig_min);
        }
        if (val < lowerWhisker || val > upperWhisker)
          return "outlier";
        else 
          return "point";
       })     
       .attr("cy", function(d) {
        return random_jitter();
       }) 
       .attr("cx", function(d) {
        var val = d.GRinf;
        if (scale_for_neg){
          val = +d.GRinf + Math.abs(orig_min)
        }
        return xScale(val);   
       })
       .style("fill", function(d) { return color(d.Replicate); })
       .append("title")
       .text(function(d) {
        return "Replicate: " + d.Replicate + "; GRinf: " + d.GRinf;
       }); 
})


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
      return +d.Hill;
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
    xScale.domain([minVal*0.1,maxVal*1.10]);

    var svg = d3.select(".hill-boxplot")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

    //draw verical line for lowerWhisker
    svg.append("line")
       .attr("class", "whisker")
       .attr("x1", xScale(lowerWhisker))
       .attr("x2", xScale(lowerWhisker))
       .attr("stroke", "black")
       .attr("y1", midline - 10)
       .attr("y2", midline + 10);

    //draw vertical line for upperWhisker
    svg.append("line")  
       .attr("class", "whisker")
       .attr("x1", xScale(upperWhisker))
       .attr("x2", xScale(upperWhisker))
       .attr("stroke", "black")
       .attr("y1", midline - 10)
       .attr("y2", midline + 10);

    //draw horizontal line from lowerWhisker to upperWhisker
    svg.append("line")
       .attr("class", "whisker")
       .attr("x1",  xScale(lowerWhisker))
       .attr("x2",  xScale(upperWhisker))
       .attr("stroke", "black")
       .attr("y1", midline)
       .attr("y2", midline);

    //draw rect for iqr
    svg.append("rect")    
       .attr("class", "box")
       .attr("stroke", "black")
       .attr("fill", "white")
       .attr("x", xScale(q1Val))
       .attr("y", padding)
       .attr("width", xScale(iqr) - padding)
       .attr("height", 20);

    //draw vertical line at median
    svg.append("line")
       .attr("class", "median")
       .attr("stroke", "black")
       .attr("x1", xScale(medianVal))
       .attr("x2", xScale(medianVal))
       .attr("y1", midline - 10)
       .attr("y2", midline + 10);

    //add label for median value
    svg.append("text")
        .attr("x", xScale(medianVal)-15)
        .attr("y", midline - 20)
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
        if (d.Hill < lowerWhisker || d.Hill > upperWhisker)
          return "outlier";
        else 
          return "point";
       })     
       .attr("cy", function(d) {
        return random_jitter();
       }) 
       .attr("cx", function(d) {
        return xScale(d.Hill);   
       })
       .style("fill", function(d) { return color(d.Replicate); })
       .append("title")
       .text(function(d) {
        return "Replicate: " + d.Replicate + "; Hill: " + d.Hill;
       }); 
})



}

/*function init(){
  gr_boxplot("MCF10A_trametinib_GR.tsv", "GR50");
  grmax_boxplot("MCF10A_trametinib_GR.tsv", "GR50");
}*/

/*gr_boxplot("MCF10A_paclitaxel_GR.tsv", ".gr50-boxplot");
grmax_boxplot("MCF10A_paclitaxel_GR.tsv", "grmax-boxplot");*/

//gr_boxplot("data/gr/metrics/MCF10A_dasatinib_GR.tsv");
gr_boxplot("../static/data/gr/metrics/MCF10A_dasatinib_GR.tsv");

//grmax_boxplot("MCF10A_neratinib_GR.tsv", ".gr50-boxplot");

function random_jitter() {
  if (Math.round(Math.random() * 1) == 0)
    var seed = -5;
  else
    var seed = 5; 
  return midline + Math.floor((Math.random() * seed) + 1);
}
