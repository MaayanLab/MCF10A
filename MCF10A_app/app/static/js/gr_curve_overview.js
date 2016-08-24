//GLOBAL VARIABLES
// Set the dimensions of the canvas / graph
var widthRange = 120;
var heightRange = 10;

var margin = {top: 10, right: 10, bottom: 10, left: 20},
width = widthRange - margin.left - margin.right,
height = 100 - margin.top - margin.bottom;

var marginSlider = {top: 10, right: 10, bottom: 10, left: 10},
widthSlider = widthRange - marginSlider.left - marginSlider.right,
heightSlider = 20 - marginSlider.top - marginSlider.bottom;


var grDatapoints = {};

function between(val, min, max){
  return val >= min && val <= max;
}

function getMedianCurve(data){
  var csvLines = data.split(/\r\n|\n/);
  var headerArray = csvLines[0].split(',');

  var medianIndex = headerArray.indexOf("Median");
  var medianData = [];
  // iterate through each line of TSV file
  for (var i = 2; i < csvLines.length-1; i++){
    var lineArray = csvLines[i].split(",");
    var dataObj = {};
    dataObj.concentration = +lineArray[0];
    dataObj.GR = +lineArray[medianIndex];
    medianData.push(dataObj);
  }
  return medianData;
}

// returns object with keys as px range that map to a concentration
// {[min, max]: concentration, [min, max]: concentration, ...}
function defineBuckets(doseArray, xFunction, min, max){
  var buckets = {};

  var increment = (xFunction(max) - xFunction(min)) / doseArray.length;
  var start = xFunction(min);

  for(var i = 0; i < doseArray.length; i++){
    buckets[[start, start + increment]] = doseArray[i];
    start += increment;
  }

  return buckets;
}

// returns object with keys as px range that map to a concentration
// {[min, max]: concentration, [min, max]: concentration, ...}
function drawBuckets(buckets, svgElem){
  for (key in buckets){
    var start = key.split(",")[0];
    // draw white line for bucket barriers
    svgElem.append("line")
          .attr("x1", start)
          .attr("x2", start)
          .attr("y1", 0)
          .attr("y2", 5)
          .style("stroke", "white");
  }
}
/*function defineAddBuckets(doseArray, svgElem, xFunction){
  var buckets = {};
  var min = Math.min.apply(Math, doseArray);
  var max = Math.max.apply(Math, doseArray);
  var increment = (xFunction(max) - xFunction(min)) / doseArray.length;
  var start = xFunction(min);
  for(var i = 0; i < doseArray.length; i++){
    buckets[[start, start + increment]] = doseArray[i];
    start += increment;
    // draw white line for bucket barriers
    svgElem.append("line")
          .attr("x1", start)
          .attr("x2", start)
          .attr("y1", 0)
          .attr("y2", 5)
          .style("stroke", "white");
  }
  return buckets;
}*/

// add bar to indicate where concentrations lie on x axis, also include divisions for each "bucket"
// example of svgId = "drug1-l1000-dose"
function addConcentrationTrack(svgId, doseArray, color, curDrugSelected, curLibSelected, curTimeSelected){
  var xFunction = grDatapoints[curDrugSelected]['x'];

  //addConcentrationTrack(drugNum + "-l1000-dose", L1000dose, "red", grDatapoints[curDrugSelected]['x']);

  // remove previous track
  d3.select("#" + svgId).remove();

  // add track
    var svgDose = d3.select('#' + svgId + "-container")
    .append("svg")
      .attr("width", widthRange)
      .attr("height", heightRange)
      .attr("id", svgId)
    .append("g")
      .attr("transform", 
      "translate(" + margin.left + ",0)");

  // no concentrations available, but still include empty white bar for parallel comparison
  if (!(doseArray.length > 0)){
    svgDose.append("line")
    .attr("x1", 0)
    .attr("x2", 0)
    .style("stroke", color)
    .style("stroke-width", "10px");

    return;
  }

  var min = Math.min.apply(Math, doseArray);
  var max = Math.max.apply(Math, doseArray);  

  // Define the div for the tooltip
/*  var div = d3.select("body").append("div") 
      .attr("class", "tooltip")       
      .style("opacity", 0);*/

    svgDose.append("line")
    .attr("x1", xFunction(min))
    .attr("x2", xFunction(max))
    .style("stroke", color)
    .style("stroke-width", "10px")
    .on("mouseover", function() {    
                      var div = d3.select("body").append("div") 
                            .attr("class", "tooltip")       
                            .style("opacity", 0);

                    div.transition()    
                        .duration(200)    
                        .style("opacity", .9);    
                    div.html(curLibSelected + ": " + doseArray)  
                        .style("left", (d3.event.pageX + 5) + "px")   
                        .style("top", (d3.event.pageY - 28) + "px");  
                    })          
                .on("mouseout", function(d) {   
                    /*div.transition()    
                        .duration(300)    
                        .style("opacity", 0); */
                    $( ".tooltip" ).remove();
                });

    //add buckets

    // check if buckets have already been defined for the library
    var buckets = NaN;
    if (curLibSelected in grDatapoints[curDrugSelected]){
      if (curTimeSelected in grDatapoints[curDrugSelected]['buckets'][curLibSelected]){
        buckets = grDatapoints[curDrugSelected]['buckets'][curLibSelected][curTimeSelected][0];
      } else {
        buckets = defineBuckets(doseArray, xFunction, min, max);
        grDatapoints[curDrugSelected]['buckets'][curLibSelected][curTimeSelected] = [];
        grDatapoints[curDrugSelected]['buckets'][curLibSelected][curTimeSelected][0] = buckets;
        grDatapoints[curDrugSelected]['buckets'][curLibSelected][curTimeSelected][1] = [min, max];
      }
    } else {
      buckets = defineBuckets(doseArray, xFunction, min, max);
      grDatapoints[curDrugSelected]['buckets'][curLibSelected] = {};
      grDatapoints[curDrugSelected]['buckets'][curLibSelected][curTimeSelected] = [];
      grDatapoints[curDrugSelected]['buckets'][curLibSelected][curTimeSelected][0] = buckets;
      grDatapoints[curDrugSelected]['buckets'][curLibSelected][curTimeSelected][1] = [min, max];
    }

    drawBuckets(buckets, svgDose);

    return;
}

function getConcentrationArray(curLibSelected, curTimeSelected, curDrugSelected){
  var concentrationArray = NaN;
  if (curTimeSelected in all_values[curLibSelected]){
    if(curDrugSelected in all_values[curLibSelected][curTimeSelected]){
      /*var concentrationArray = Object.keys(all_values[curLibSelected][curTimeSelected][curDrugSelected]).map(Number);*/
      var concentrationArray = Object.keys(all_values[curLibSelected][curTimeSelected][curDrugSelected]);
      concentrationArray.sort(function(a,b) { return a - b; }); // sort the concentrations from smallest to largest
    }
  }
  return concentrationArray;
}
  

//function to update GR curve (redraw curve, tracks, slider)
function defineGRCurve(){
  // remove previous svg
  d3.select("#" + svgId).remove();

  // add GR curve with y-axis, concentration tracks, and slider
  addGRCurve(curDrugSelected, curTimeSelected, curLibSelected, drugNum);

}

function playSlider(sliderSvg, drugNum, min, max, xFunction){
  // remove pause
  var svgId = drugNum + "-play";
  $( "." + drugNum + "-pause" ).remove();
  sliderSvg.transition() 
        .duration(0)

  var play = sliderSvg.append("polygon")
                  .attr("points", "-20,-5 -20,5 -10,0")
                  .attr("class", "play-button")
                  .attr("id", drugNum + "-play")
                  .on("click", function() { 
                      pauseSlider(sliderSvg, drugNum, min, max, xFunction);
                  });

  return play;
}

function pauseSlider(sliderSvg, drugNum, min, max, xFunction){
  // remove play svg
  var svgId = drugNum + "-play";
  d3.select("#" + svgId).remove();

  // get time 
  var curConcentration = $("#" + drugNum + "-verticalline").attr("conc");
  var start = min;
  if (curConcentration > min && curConcentration < max){
    start = curConcentration;
  }

  var time = 20000;
  if(!(max - start)){
    time = time * (1-((max - start) / (max - min)));
  }

  // slider transition
  sliderSvg.transition() 
        .duration(time)
        .tween("play", function() {
          var i = d3.interpolate(start, max);
          return function(t) { if(t == 1){playSlider(sliderSvg, drugNum, min, max, xFunction);} updateConcentration(i(t), drugNum, xFunction); };
        }); 

    var pause = sliderSvg.append("path")
                .attr("d", "M-20,-5 L-20,5 L-17,5 L-17,-5 L-20,-5 M-14,-5 L-14,5 L-11,5 L-11,-5 L-14,-5")
                .attr("class", drugNum + "-pause")
                .attr("style", "cursor:pointer;")
                .on("click", function() { 
                  playSlider(sliderSvg, drugNum, min, max, xFunction);
                });

    // for that white space between pause button
    sliderSvg.append("path")
                .attr("d", "M-17,-5 L-17,5 L-14,5 L-14,-5 L-17,-5")
                .attr("class", drugNum + "-pause")
                .attr("style", "cursor:pointer;")
                .attr("fill", "white")
                .on("click", function() { 
                  playSlider(sliderSvg, drugNum, min, max, xFunction);
                });
}

//function to add GR curve with y-axis, concentration tracks, and slider. 
//Also define buckets for concentrations of each assay in "concentration track"
function addGRCurve(initialPosition, curDrugSelected, curTimeSelected, curLibSelected, drugNum){
  var medianData = grDatapoints[curDrugSelected]['datapoints'];
  var xFunction = grDatapoints[curDrugSelected]['x'];
  var yFunction = grDatapoints[curDrugSelected]['y'];
  var lineFunction = grDatapoints[curDrugSelected]['line'];

  var svgId = drugNum + "-gr-curve";

  // remove previous svg
  d3.select("#" + svgId).remove();

  // Add svg canvas
  var svg = d3.select("#" + drugNum + "-gr-curve-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id", svgId)
            .append("g")
            .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

  // draw medianGR curve
  var GR_val = svg.append("path")
                .attr("class", "line")
                .attr("d", lineFunction(medianData))
                .style("stroke", "black")
                .style("stroke-width", "3px");

  // Manually draw y axis
  // Add y axis
  var yAxis = svg.append("line")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 0)
    .attr("y2", width)
    .style("stroke", "black")
    .style("opacity", 0.6);

  // Add ticks and labels on y axis
  var increment = (yFunction.domain()[1] - yFunction.domain()[0]) / 5;
  var curPosition = yFunction.domain()[1];

  for (var i = 0; i < 6; i++){
    // draw ticks on y axis
    svg.append("line")
          .attr("x1", -4)
          .attr("y1", yFunction(curPosition))
          .attr("y2", yFunction(curPosition))
          .style("stroke", "black")
          .style("opacity", 0.6);

    svg.append("text")
            .attr("x", -20)
            .attr("y", yFunction(curPosition) + 3)
            .text(curPosition.toFixed(1))
            .style("font-size", "0.7em")
            .style("opacity", 0.6);    
    
    curPosition -= increment
  }

  // marker for 0
  svg.append("line")
          .attr("x1", -4)
          .attr("x2", 90)
          .attr("y1", yFunction(0))
          .attr("y2", yFunction(0))
          .style("stroke", "black")
          .style("opacity", 0.4);

  // remove previous svg slider
  d3.select("#" + svgId + "-slider").remove();

  // Adds slider
  
  var slider = d3.select("#" + drugNum + "-gr-slider-container")
  .append("svg")
    .attr("width", widthSlider + marginSlider.left + marginSlider.right)
    .attr("height", heightSlider + marginSlider.top + marginSlider.bottom)
    .attr("id", svgId + "-slider")
    .attr("t", 0)
  .append("g")
    .attr("class", "slider")
    .attr("transform", 
      "translate(" + margin.left + "," + margin.top + ")");

  slider.append("line")
  .attr("class", "track")
  .attr("x1", xFunction.range()[0])
  .attr("x2", xFunction.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
  .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
  .attr("class", "track-overlay")
  .call(d3.drag()
    .on("start.interrupt", function() { slider.interrupt(); })
    .on("start drag", function() { 
                    updateConcentration(xFunction.invert(d3.event.x), drugNum, xFunction);
                  }));

  var handle = slider.insert("rect", ".track-overlay")
  .attr("class", "handle")
  .attr("x", initialPosition)
  .attr("y", -1 * marginSlider.top / 2)
  .attr("width", 3)
  .attr("height", 10)
  .attr("id", svgId + "-handle");

  // helper dotted vertical line for guidance on GR curve
    var verticalLine = svg.append("line")
    .attr("x1", initialPosition)
    .attr("x2", initialPosition)
    .attr("y1", 0)
    .attr("y2", width)
    .attr("id", drugNum + "-verticalline")
    .style("stroke", "black")
    .style("stroke-dasharray", "3px");

    // remove previous svg concentration tracks
    d3.select("#" + svgId + "-l1000-dose").remove();
    d3.select("#" + svgId + "-p100-dose").remove();
    d3.select("#" + svgId + "-gcp-dose").remove();


  // array of concentrations available for each assay
  var L1000dose = getConcentrationArray(curLibSelected, curTimeSelected, curDrugSelected);
  var P100dose = getConcentrationArray("P100", curTimeSelected, curDrugSelected);
  var GCPdose = getConcentrationArray("GCP", curTimeSelected, curDrugSelected);

  var allConcentrations = [];
  if (L1000dose.length > 0){
    allConcentrations = allConcentrations.concat(L1000dose);
  }
  if (P100dose.length > 0){
    allConcentrations = allConcentrations.concat(P100dose);
  }
  if (GCPdose.length > 0){
    allConcentrations = allConcentrations.concat(GCPdose);
  }

  var max = d3.max(allConcentrations);
  var min = d3.min(allConcentrations);

  playSlider(slider, drugNum, min, max, xFunction);

  // if assay has concentration available, add track with color, otherwise make track "white"
  // L1000
  if(L1000dose.length > 0){
    //addConcentrationTrack(svgId, doseArray, color, xFunction)
    addConcentrationTrack(drugNum + "-l1000-dose", L1000dose, "red", curDrugSelected, curLibSelected, curTimeSelected);
  } else {
    addConcentrationTrack(drugNum + "-l1000-dose", L1000dose, "white", curDrugSelected, curLibSelected, curTimeSelected);
  }

  // P100
  if(P100dose.length > 0){
    //addConcentrationTrack(svgId, doseArray, color, xFunction)
    addConcentrationTrack(drugNum + "-p100-dose", P100dose, "blue", curDrugSelected, "P100", curTimeSelected);
  } else {
    addConcentrationTrack(drugNum + "-p100-dose", P100dose, "white", curDrugSelected, "P100", curTimeSelected);
  }

  // GCPdose
  if(GCPdose.length > 0){
    //addConcentrationTrack(svgId, doseArray, color, xFunction)
    addConcentrationTrack(drugNum + "-gcp-dose", GCPdose, "green", curDrugSelected, "GCP", curTimeSelected);
  } else {
    addConcentrationTrack(drugNum + "-gcp-dose", GCPdose, "white", curDrugSelected, "GCP", curTimeSelected);
  }    

    /*updateConcentration(x(0));*/
    updateConcentration(xFunction.invert(initialPosition), drugNum, xFunction);

    function concentration(c, drugNum, xFunction){
      handle.attr("x", xFunction(c));
      updateConcentration(c, drugNum, xFunction);
    }

}

function updateL1000Concentration(c, drugNum, curDrugSelected, curLibSelected, curTimeSelected){
  var L1000dose = getConcentrationArray(curLibSelected, curTimeSelected, curDrugSelected);
  // if assay has concentration available, add track with color, otherwise make track "white"
  // L1000
  if(L1000dose.length > 0){
    //addConcentrationTrack(svgId, doseArray, color, xFunction)
    addConcentrationTrack(drugNum + "-l1000-dose", L1000dose, "red", curDrugSelected, curLibSelected, curTimeSelected);
  } else {
    addConcentrationTrack(drugNum + "-l1000-dose", L1000dose, "white", curDrugSelected, curLibSelected, curTimeSelected);
  }
  //addConcentrationTrack(svgId, doseArray, color, curDrugSelected, curLibSelected, curTimeSelected);
  var xFunction = grDatapoints[curDrugSelected]['x'];
  //check if it is in the interval


  if(curLibSelected in grDatapoints[curDrugSelected]['buckets'] && curTimeSelected in all_values[curLibSelected]){
    var minL1000dose = grDatapoints[curDrugSelected]['buckets'][curLibSelected][curTimeSelected][1][0];
    var maxL1000dose = grDatapoints[curDrugSelected]['buckets'][curLibSelected][curTimeSelected][1][1];
    if (between(xFunction(c), xFunction(minL1000dose), xFunction(maxL1000dose))){
      // determine which bucket the concentration falls in
      var l1000Buckets = grDatapoints[curDrugSelected]['buckets'][curLibSelected][curTimeSelected][0];
      for(var interval in l1000Buckets){
        interval = interval.split(",");
        if (between (xFunction(c), interval[0], interval[1])){
          var concentration = l1000Buckets[interval];
          $("#" + drugNum + "-l1000-val").text(l1000Buckets[interval] + " μM");

          // create data array for SVG with objects that include x, y, width, height, val parameters
          var dataArrayUp = getSVGDataArrayL1000(all_values[curLibSelected][curTimeSelected][curDrugSelected][concentration]["up"], all_layouts[curLibSelected][curTimeSelected], concentration);

          var dataArrayDown = getSVGDataArrayL1000(all_values[curLibSelected][curTimeSelected][curDrugSelected][concentration]["down"], all_layouts[curLibSelected][curTimeSelected], concentration);

          createCanvas(dataArrayUp, "combined score", drugNum + "-l1000-up-container", drugNum + "-l1000-up", "l1000-up");
          createCanvas(dataArrayDown, "combined score", drugNum + "-l1000-down-container", drugNum + "-l1000-down", "l1000-down");

        }
      }
    } else {
      renderBlank(drugNum);
    }
  }
  else{
    renderBlank(drugNum);
  }
}

function renderBlank(drugNum) {
    $("#" + drugNum + "-l1000-val").text("data unavailable");
    createBlankCanvas(drugNum + "-l1000-up-container", drugNum + "-l1000-up");
    createBlankCanvas(drugNum + "-l1000-down-container", drugNum + "-l1000-down");
}

function updateConcentration(c, drugNum, xFunction){
  $("#" + drugNum + "-concentration-val").text(Number(c).toPrecision(6));
  $("#" + drugNum + "-verticalline").attr("x1", xFunction(c))
                                .attr("x2", xFunction(c));
  $("#" + drugNum + "-gr-curve-handle").attr("x", xFunction(c));

  var curTimeSelected = $("input[type=radio][name=" + drugNum + "]:checked").val();
  var curLibSelected = $("#l1000-dropdown option:selected").text().replace(/\s+/g, '_');
  var curDrugSelected = $("#" +  drugNum + "-dropdown option:selected").text().toLowerCase();

  // L1000 CANVAS
  updateL1000Concentration(c, drugNum, curDrugSelected, curLibSelected, curTimeSelected);

  // P100 CANVAS 
  //check if it is in the interval and is defined for curTimeSelected
  if("P100" in grDatapoints[curDrugSelected]['buckets'] && curTimeSelected in all_values["P100"]){
    var minP100dose = grDatapoints[curDrugSelected]['buckets']["P100"][curTimeSelected][1][0];
    var maxP100dose = grDatapoints[curDrugSelected]['buckets']["P100"][curTimeSelected][1][1];
    if (between(xFunction(c), xFunction(minP100dose), xFunction(maxP100dose))){
      // determine which bucket the concentration falls in
      var p100Buckets = grDatapoints[curDrugSelected]['buckets']["P100"][curTimeSelected][0];
      for(var interval in p100Buckets){
        interval = interval.split(",");
        if (between (xFunction(c), interval[0], interval[1])){
          var concentration = p100Buckets[interval];
          $("#" + drugNum + "-p100-val").text(p100Buckets[interval] + " μM");

          var dataArrayP100 = getSVGDataArrayP100(all_values["P100"][curTimeSelected][curDrugSelected][concentration], all_layouts["P100"][curTimeSelected], concentration);

          createCanvas(dataArrayP100, "z score", drugNum + "-p100-container", drugNum + "-p100", "p100");

        }
      }
    } else  {
      $("#" + drugNum + "-p100-val").text("data unavailable");
      createBlankCanvas(drugNum + "-p100-container", drugNum + "-p100");
    }
  } else{
    $("#" + drugNum + "-p100-val").text("data unavailable");
    createBlankCanvas(drugNum + "-p100-container", drugNum + "-p100");
  }

  // GCP CANVAS 
  //check if it is in the interval
  if("GCP" in grDatapoints[curDrugSelected]['buckets'] && curTimeSelected in all_values["GCP"]){
    var minGCPdose = grDatapoints[curDrugSelected]['buckets']["GCP"][curTimeSelected][1][0];
    var maxGCPdose = grDatapoints[curDrugSelected]['buckets']["GCP"][curTimeSelected][1][1];
    if (between(xFunction(c), xFunction(minGCPdose), xFunction(maxGCPdose)) && curTimeSelected in all_values["GCP"]){
      // determine which bucket the concentration falls in
      var gcpBuckets = grDatapoints[curDrugSelected]['buckets']["GCP"][curTimeSelected][0];
      for(var interval in gcpBuckets){
        interval = interval.split(",");
        if (between (xFunction(c), interval[0], interval[1])){
          var concentration = gcpBuckets[interval];
          $("#" + drugNum + "-gcp-val").text(gcpBuckets[interval] + " μM");
          var dataArrayGCP = getSVGDataArrayGCP(all_values["GCP"][curTimeSelected][curDrugSelected][concentration], all_layouts["GCP"][curTimeSelected], concentration);

          createCanvas(dataArrayGCP, "z score", drugNum + "-gcp-container", drugNum + "-gcp", "gcp");
        }
      }
    } else {
      $("#" + drugNum + "-gcp-val").text("data unavailable");
    createBlankCanvas(drugNum + "-gcp-container", drugNum + "-gcp");
    }
  } else{
    $("#" + drugNum + "-gcp-val").text("data unavailable");
    createBlankCanvas(drugNum + "-gcp-container", drugNum + "-gcp");
  }

}



$(document).ready(function() {
  // Load all data from server using AJAX requests
  // get file with file location of all tile orderings
  $.ajax({
    type: "GET",
    url: "static/data/gr/curve_datapoints/filenames.txt",
    dataType: "text",
    success: function(data) {
      var lines = data.split(/\r\n|\n/);
      for(var i = 0; i < lines.length; i++){
        if (lines[i] == "filenames.txt" || !lines[i]){
          continue;
        }

        $.ajax({
          type: "GET",
          url: "static/data/gr/curve_datapoints/" + lines[i],
          dataType: "text",
          success: function(data) {
            var filename = this.url.split("/").slice(-1)[0].split(".")[0];
            var drug = filename.split("_")[0].toLowerCase();
            grDatapoints[drug] = {};

            //add median curve datapoints to grDatapoints
            var medianData = getMedianCurve(data);
            grDatapoints[drug]['datapoints'] = medianData;

            //functions to define exact x,y pixel coordinates
            var x = d3.scaleLog().range([0, width]).clamp(true); //set clamp(true) to ensure slider stays on track
            var y = d3.scaleLinear().range([height, 0]);

            // define domain of x and y
            x.domain(d3.extent(medianData, function(d) { return d.concentration; }));
            /*y.domain([
              d3.min(medianData, function(d) { return d.GR; }),
              d3.max(medianData, function(d) { return d.GR; })
              ]);*/
            // define all curves with the same y axis range
            y.domain([-0.5, 1]);

            //functions to define exact x,y pixel coordinates
            grDatapoints[drug]['x'] = x; //set clamp(true) to ensure slider stays on track
            grDatapoints[drug]['y'] = y;
            grDatapoints[drug]['line'] = d3.line()
                                            //.interpolate("basis")
                                            .x(function(d) { return x(d.concentration); })
                                            .y(function(d) { return y(d.GR); });
            grDatapoints[drug]['buckets'] = {};
          }
        });
      }
    }
  });

});

function setOnChange(drugNum){
  $('#'+ drugNum +'-dropdown').on('change', function() {
  var curDrugSelected = $("#" + drugNum + "-dropdown option:selected").text().toLowerCase();
  var curTimeSelected = $("input[type=radio][name=" + drugNum + "]:checked").val();
  var curLibSelected = $("#l1000-dropdown option:selected").text().replace(/\s+/g, '_');
  var curPosition = $("#" + drugNum + "-verticalline").attr("x1");

  addGRCurve(curPosition, curDrugSelected, curTimeSelected, curLibSelected, drugNum);
  });

  $('input[type=radio][name='+ drugNum + ']').on('change', function() {
   switch($(this).val()) {
     case '3h':
      var curDrugSelected = $("#"+ drugNum +"-dropdown option:selected").text().toLowerCase();
      var curTimeSelected = $("input[type=radio][name="+ drugNum +"]:checked").val();
      var curLibSelected = $("#l1000-dropdown option:selected").text().replace(/\s+/g, '_');
      var curPosition = $("#" + drugNum + "-verticalline").attr("x1");
      addGRCurve(curPosition, curDrugSelected, curTimeSelected, curLibSelected, drugNum);
     break;
     case '24h':
      var curDrugSelected = $("#"+ drugNum +"-dropdown option:selected").text().toLowerCase();
      var curTimeSelected = $("input[type=radio][name="+ drugNum +"]:checked").val();
      var curLibSelected = $("#l1000-dropdown option:selected").text().replace(/\s+/g, '_');
      var curPosition = $("#" + drugNum + "-verticalline").attr("x1");
      addGRCurve(curPosition, curDrugSelected, curTimeSelected, curLibSelected, drugNum);
     break;
   }
 });

}

// After all data has loaded, this function is called
$(document).ajaxStop(function() {
  for(var i = 0; i < drugNumArray.length; i++){
    var drugNum = drugNumArray[i];
    var curTimeSelected = $("input[type=radio][name=" + drugNum + "]:checked").val();
    var curLibSelected = $("#l1000-dropdown option:selected").text().replace(/\s+/g, '_');
    var curDrugSelected = $("#" +  drugNum + "-dropdown option:selected").text().toLowerCase();
    //var curPosition = $("#" + drugNum + "-verticalline").attr("x1");

    addGRCurve(0, curDrugSelected, curTimeSelected, curLibSelected, drugNum);
    setOnChange(drugNum);
  }

});