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

// === UTILITIY function ===
function between(val, min, max){
  return val >= min && val <= max;
}
// =========================

// === UTILITY function ===
// parsing through GR file for median curve values
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
// =========================

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

function addBuckets(drug, library, time, doseArray, xFunction, min, max){
  if (!(library in grDatapoints[drug])){ // current library has not been added to concentration tracks
      grDatapoints[drug]['concentrationTracks'][library] = {};
    }
    if (!(time in grDatapoints[drug]['concentrationTracks'])){ // current time has not been added to concentration tracks
      grDatapoints[drug]['concentrationTracks'][library][time] = {
        'buckets': defineBuckets(doseArray, xFunction, min, max), 
        'min': min, 
        'max': max};
    }
  return grDatapoints[drug]['concentrationTracks'][library][time]['buckets'];
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

// add bar to indicate where concentrations lie on x axis, also include divisions for each "bucket"
// example of svgId = "drug1-l1000-dose"
function addConcentrationTrack(svgId, doseArray, color, curDrugSelected, curLibSelected, curTimeSelected){
  var xFunction = grDatapoints[curDrugSelected]['x'];

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

    // add buckets to global variable
    var buckets = addBuckets(curDrugSelected, curLibSelected, curTimeSelected, doseArray, xFunction, min, max);
    drawBuckets(buckets, svgDose);

    return;
}

function getConcentrationArray(library, time, drug){
  var concentrationArray = NaN;
  if (time in all_values[library]){
    if(drug in all_values[library][time]){
      var concentrationArray = Object.keys(all_values[library][time][drug]);
      concentrationArray.sort(function(a,b) { return a - b; }); // sort the concentrations from smallest to largest
    }
  }
  return concentrationArray;
}

/* Remove pause symbol and display play triangle with functionality
 */
function playSlider(sliderSvg, drugNum, minMax, colAttributes, xFunction){
  var min = minMax.min;
  var max = minMax.max;

  // remove pause
  var svgId = drugNum + "-play";
  $( "." + drugNum + "-pause" ).remove();
  sliderSvg.transition() 
        .duration(0)

  // add play triangle
  var play = sliderSvg.append("polygon")
                  .attr("points", "-20,-5 -20,5 -10,0")
                  .attr("class", "play-button")
                  .attr("id", drugNum + "-play")
                  .on("click", function() { 
                      pauseSlider(sliderSvg, drugNum, minMax, colAttributes, xFunction);
                  });

  return play;
}

/* Remove play triangle button, transition through available canvases, display pause button
 */
function pauseSlider(sliderSvg, drugNum, minMax, colAttributes, xFunction){
  var min = minMax.min;
  var max = minMax.max;

  // remove play svg
  var svgId = drugNum + "-play";
  d3.select("#" + svgId).remove();

  // get time 
  var curConcentration = xFunction.invert(colAttributes.getPosition());
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
          return function(t) { if(t == 1){playSlider(sliderSvg, drugNum, minMax, colAttributes, xFunction);} updateConcentration(i(t), drugNum, xFunction, colAttributes); };
        }); 

  // display play button
  var pause = sliderSvg.append("path")
              .attr("d", "M-20,-5 L-20,5 L-17,5 L-17,-5 L-20,-5 M-14,-5 L-14,5 L-11,5 L-11,-5 L-14,-5")
              .attr("class", drugNum + "-pause")
              .attr("style", "cursor:pointer;")
              .on("click", function() { 
                playSlider(sliderSvg, drugNum, minMax, colAttributes, xFunction);
              });

  // for that white space between pause button
  sliderSvg.append("path")
              .attr("d", "M-17,-5 L-17,5 L-14,5 L-14,-5 L-17,-5")
              .attr("class", drugNum + "-pause")
              .attr("style", "cursor:pointer;")
              .attr("fill", "white")
              .on("click", function() { 
                playSlider(sliderSvg, drugNum, minMax, colAttributes, xFunction);
              });
}

function updateL1000Concentration(c, drugNum, curDrugSelected, curLibSelected, curTimeSelected){
  var xFunction = grDatapoints[curDrugSelected]['x'];
  var concentrationTracks = grDatapoints[curDrugSelected]['concentrationTracks'];

  if("L1000" in concentrationTracks && curTimeSelected in all_values[curLibSelected]){
    var minL1000dose = concentrationTracks["L1000"][curTimeSelected]['min'];
    var maxL1000dose = concentrationTracks["L1000"][curTimeSelected]['max'];
    if (between(xFunction(c), xFunction(minL1000dose), xFunction(maxL1000dose))){
      // determine which bucket the concentration falls in
      var l1000Buckets = concentrationTracks["L1000"][curTimeSelected]['buckets'];

      for(var interval in l1000Buckets){
        interval = interval.split(",");
        if (between (xFunction(c), interval[0], interval[1])){
          var concentration = l1000Buckets[interval];
          $("#" + drugNum + "-l1000-val").text(l1000Buckets[interval] + " μM");

          // create data array for SVG with objects that include x, y, width, height, val parameters
          var dataArrayUp = getSVGDataArray(all_values[curLibSelected][curTimeSelected][curDrugSelected][concentration]["up"], all_layouts[curLibSelected][curTimeSelected], colorScaleL1000, {});

          var dataArrayDown = getSVGDataArray(all_values[curLibSelected][curTimeSelected][curDrugSelected][concentration]["down"], all_layouts[curLibSelected][curTimeSelected], colorScaleL1000, {});

          createCanvas(dataArrayUp, "combined score", drugNum + "-l1000-up-container", drugNum + "-l1000-up", "l1000-up");
          createCanvas(dataArrayDown, "combined score", drugNum + "-l1000-down-container", drugNum + "-l1000-down", "l1000-down");

        }
      }
    } else {
      renderBlankL1000UpDownCanvases(drugNum);
    }
  }
  else{
    renderBlankL1000UpDownCanvases(drugNum);
  }
}

function updateConcentration(c, drugNum, xFunction, colAttributes){
  colAttributes.setPosition(xFunction(c));

  $("#" + drugNum + "-concentration-val").text(Number(c).toPrecision(6));
  $("#" + drugNum + "-verticalline").attr("x1", xFunction(c))
                                .attr("x2", xFunction(c));
  $("#" + drugNum + "-handle").attr("x", xFunction(c));

  var curTimeSelected = $("input[type=radio][name=" + drugNum + "]:checked").val();
  var curLibSelected = $("#l1000-dropdown option:selected").text().replace(/\s+/g, '_');
  var curDrugSelected = $("#" +  drugNum + "-dropdown option:selected").text().toLowerCase();

  // update canvases
  updateCanvases(drugNum, colAttributes);
}

function updateCanvases(drugNum, colAttributes){
  var curDrugSelected = colAttributes.getDrug();
  var curLibSelected = globalAssayRowAttributes.getLibrary();
  var curTimeSelected = colAttributes.getTime();
  var xFunction = grDatapoints[curDrugSelected]['x']
  var c = xFunction.invert(colAttributes.getPosition());

  // L1000 CANVAS
  updateL1000Concentration(c, drugNum, curDrugSelected, curLibSelected, curTimeSelected);

  // P100 CANVAS 
  //check if it is in the interval and is defined for curTimeSelected
  if("P100" in grDatapoints[curDrugSelected]['concentrationTracks'] && curTimeSelected in all_values["P100"]){
    var minP100dose = grDatapoints[curDrugSelected]['concentrationTracks']["P100"][curTimeSelected]['min'];
    var maxP100dose = grDatapoints[curDrugSelected]['concentrationTracks']["P100"][curTimeSelected]['max'];
    if (between(xFunction(c), xFunction(minP100dose), xFunction(maxP100dose))){
      // determine which bucket the concentration falls in
      var p100Buckets = grDatapoints[curDrugSelected]['concentrationTracks']["P100"][curTimeSelected]['buckets'];
      for(var interval in p100Buckets){
        interval = interval.split(",");
        if (between (xFunction(c), interval[0], interval[1])){
          var concentration = p100Buckets[interval];
          $("#" + drugNum + "-p100-val").text(p100Buckets[interval] + " μM");

          var dataArrayP100 = getSVGDataArray(all_values["P100"][curTimeSelected][curDrugSelected][concentration], all_layouts["P100"][curTimeSelected], colorScaleP100, p100GeneLookup);

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
  if("GCP" in grDatapoints[curDrugSelected]['concentrationTracks'] && curTimeSelected in all_values["GCP"]){
    var minGCPdose = grDatapoints[curDrugSelected]['concentrationTracks']["GCP"][curTimeSelected]['min'];
    var maxGCPdose = grDatapoints[curDrugSelected]['concentrationTracks']["GCP"][curTimeSelected]['max'];
    if (between(xFunction(c), xFunction(minGCPdose), xFunction(maxGCPdose)) && curTimeSelected in all_values["GCP"]){
      // determine which bucket the concentration falls in
      var gcpBuckets = grDatapoints[curDrugSelected]['concentrationTracks']["GCP"][curTimeSelected]['buckets'];
      for(var interval in gcpBuckets){
        interval = interval.split(",");
        if (between (xFunction(c), interval[0], interval[1])){
          var concentration = gcpBuckets[interval];
          $("#" + drugNum + "-gcp-val").text(gcpBuckets[interval] + " μM");
          var dataArrayGCP = getSVGDataArray(all_values["GCP"][curTimeSelected][curDrugSelected][concentration], all_layouts["GCP"][curTimeSelected], colorScaleGCP, gcpLookup);

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
            // define all curves with the same y axis range -- allows for easier comparison across different drugs
            y.domain([-0.5, 1]);

            //functions to define exact x,y pixel coordinates
            grDatapoints[drug]['x'] = x; //set clamp(true) to ensure slider stays on track
            grDatapoints[drug]['y'] = y;
            grDatapoints[drug]['line'] = d3.line()
                                            //.interpolate("basis")
                                            .x(function(d) { return x(d.concentration); })
                                            .y(function(d) { return y(d.GR); });
            grDatapoints[drug]['concentrationTracks'] = {};
          }
        });
      }
    }
  });

});

/**
 * Callback function for gene set library change
 */
function changeEnrichmentLibrariesCanvas(library, drugId){
  var drugColumnObject = allDrugColumns[drugId];
  var time = drugColumnObject.colAttributes.getTime();
  var drug = drugColumnObject.colAttributes.getDrug();
  var position = drugColumnObject.colAttributes.getPosition();

  updateL1000Concentration(grDatapoints[drug]['x'].invert(position), drugId, drug, library.replace(/\s+/g, '_'), time);
};

/**
 * Maintains attributes specific to column; 
 * creates GR curve, concentration tracks, canvases; 
 * setup event handlers
 */
var drugColumn = function(drugNum, enrichmentLibrariesEvent){
  // define attributes specific to column (drug, time, position) in a drugColumnAttributes object
  var colAttributes = new drugColumnAttributes(drugNum);

  // create GR curve, slider, concentration tracks, canvases
  setupDrugColumn(drugNum, colAttributes);

  // setup event handlers
  setDrugColumnEvents(drugNum, colAttributes, enrichmentLibrariesEvent);

  return{
    colAttributes: colAttributes
  }
};

function setupDrugColumn(drugNum, colAttributes){
  // create GR curve, slider, concentration tracks, canvases
  addGRCurve(drugNum, colAttributes);
  // add concentration tracks
  var minMax = addAllConcentrationTracks(drugNum, colAttributes);
  // add slider and play button
  addSlider(drugNum, colAttributes, minMax);
}

/* Add GR curve with y-axis, concentration tracks, and slider. 
 * Also define buckets for concentrations of each assay in "concentration track"
 */
function addGRCurve(drugNum, colAttributes){
  var drug = colAttributes.getDrug();
  var time = colAttributes.getTime();
  var position = colAttributes.getPosition();
  var library = globalAssayRowAttributes.getLibrary();

  var drugGRDatapoints = grDatapoints[drug];

  var medianData = drugGRDatapoints.datapoints;
  var xFunction = drugGRDatapoints.x;
  var yFunction = drugGRDatapoints.y;
  var lineFunction = drugGRDatapoints.line;

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

  // horizontal line for y = 0 (GR value = 0)
  svg.append("line")
          .attr("x1", -4)
          .attr("x2", 90)
          .attr("y1", yFunction(0))
          .attr("y2", yFunction(0))
          .style("stroke", "black")
          .style("opacity", 0.4);

  // helper dotted vertical line for guidance on GR curve
  var verticalLine = svg.append("line")
    .attr("x1", position)
    .attr("x2", position)
    .attr("y1", 0)
    .attr("y2", width)
    .attr("id", drugNum + "-verticalline")
    .style("stroke", "black")
    .style("stroke-dasharray", "3px");

    updateConcentration(xFunction.invert(position), drugNum, xFunction, colAttributes);
}

/* Add all concentration tracks (which concentration measurements are taken)
 * Returns minMax object for play button to determine when to start animation (min) and when to stop animation (max)
 */
function addAllConcentrationTracks(drugNum, colAttributes){
  var drug = colAttributes.getDrug();
  var time = colAttributes.getTime();
  console.log("time=" + time);
  var library = globalAssayRowAttributes.getLibrary();

  // array of concentrations available for each assay
  var L1000dose = getConcentrationArray(library, time, drug);
  var P100dose = getConcentrationArray("P100", time, drug);
  var GCPdose = getConcentrationArray("GCP", time, drug);

  console.log("L1000dose=" + L1000dose);

  // add all available concentrations to array
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

  // find min and max array for play button functionality that will begin playing at the start of available concentration
  var max = d3.max(allConcentrations);
  var min = d3.min(allConcentrations);

  // Add track for each assay
  // L1000
  var trackColor = L1000dose.length > 0 ? "red" : "white";
  addConcentrationTrack(drugNum + "-l1000-dose", L1000dose, trackColor, drug, "L1000", time);

  // P100
  var trackColor = P100dose.length > 0 ? "blue" : "white";
  addConcentrationTrack(drugNum + "-p100-dose", P100dose, trackColor, drug, "P100", time);

  // GCPdose
  var trackColor = GCPdose.length > 0 ? "green" : "white";
  addConcentrationTrack(drugNum + "-gcp-dose", GCPdose, trackColor, drug, "GCP", time);

  return {
    max: max,
    min: min,
  }
}

/* Add slider that transitions through various canvases
 */
function addSlider(drugNum, colAttributes, minMax){
  var drug = colAttributes.getDrug();
  var time = colAttributes.getTime();
  var position = colAttributes.getPosition();
  var library = globalAssayRowAttributes.getLibrary();

  var xFunction = grDatapoints[drug].x;

  // remove previous svg slider
  var svgIdSlider = drugNum + "-slider";

  d3.select("#" + svgIdSlider).remove();

  // Add slider
  var slider = d3.select("#" + drugNum + "-gr-slider-container")
  .append("svg")
    .attr("width", widthSlider + marginSlider.left + marginSlider.right)
    .attr("height", heightSlider + marginSlider.top + marginSlider.bottom)
    .attr("id", svgIdSlider)
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
      .on("start drag", function() { updateConcentration(xFunction.invert(d3.event.x), drugNum, xFunction, colAttributes); }
          ));

  var handle = slider.insert("rect", ".track-overlay")
  .attr("class", "handle")
  .attr("x", position)
  .attr("y", -1 * marginSlider.top / 2)
  .attr("width", 3)
  .attr("height", 10)
  .attr("id", drugNum + "-handle");

  // playButton
  playSlider(slider, drugNum, minMax, colAttributes, xFunction);
}

/**
 * Listens for changes in drug, time, and gene set library
 */
function setDrugColumnEvents(drugNum, colAttributes, enrichmentLibrariesEvent){
  // setup trigger for when drug selected changes
  var $drugSelector = $("#"+ drugNum).find('select');
  $drugSelector.change(function(){
    var drugName = $drugSelector.val();
    colAttributes.setDrug(drugName);

    //update GR curve, concentration tracks, canvas
    setupDrugColumn(drugNum, colAttributes);
  });

  // setup trigger for when time selected changes
  var $timeForm = $("#"+ drugNum).find('form');
  $timeForm.change(function(){
    var time = $("input[name=" + drugNum + "]:checked").val();
    colAttributes.setTime(time);
    // add concentration tracks and update canvas for new time
    var minMax = addAllConcentrationTracks(drugNum, colAttributes);
    updateCanvases(drugNum, colAttributes);
  });

  // Listen for enrichment library change
  enrichmentLibrariesEvent.addListener(drugNum);
};

// After all data has loaded, this function is called
$(document).ajaxStop(function() {
  // create event for triggering appropriate gene set library canvas
  var enrichmentLibrariesEvent = new customEvent(changeEnrichmentLibrariesCanvas);

  // setup trigger for when gene set library changes
  var $librarySelector = $("#analysis-labels").find('select');
  $librarySelector.change(function(){
    var library = $librarySelector.val();
    globalAssayRowAttributes.setLibrary(library);
    enrichmentLibrariesEvent.dispatchNewValue(library);
  });

  // create drugColumn object for each column
  for(var i = 0; i < drugNumArray.length; i++){
    var drugId = drugNumArray[i];

    var eachDrugColumn = new drugColumn(drugId, enrichmentLibrariesEvent);
    allDrugColumns[drugId] = eachDrugColumn;
  }
});

