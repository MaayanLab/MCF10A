// GLOBAL VARIABLES
var enrichment_libraries = ["ChEA_2015", "ENCODE_TF_ChIP-seq_2015", "KEGG_2016", "MGI_Mammalian_Phenotype_Level_4", "GO_Biological_Process_2015"];
var grDatapoints = {};
  // Set the dimensions of the canvas / graph
var widthRangeMedian = 100;
var heightRangeMedian = 100;
var marginMedian = {top: 10, right: 10, bottom: 10, left: 20},
 widthMedian = widthRangeMedian - marginMedian.left - marginMedian.right,
 heightMedian = heightRangeMedian - marginMedian.top - marginMedian.bottom;

//var assayColor = {"L1000": "red", "P100": "blue", "GCP": "green"};


/* Add GR curve with y-axis, concentration tracks, and slider. 
 * Also define buckets for concentrations of each assay in "concentration track"
 */
function addGRCurve(drug){
  var drugGRDatapoints = grDatapoints[drug];

  var medianData = drugGRDatapoints.datapoints;
  var xFunction = drugGRDatapoints.x;
  var yFunction = drugGRDatapoints.y;
  var lineFunction = drugGRDatapoints.line;

  var svgId = "gr-curve";

  // remove previous svg
  d3.select("#" + svgId).remove();

  // Add svg canvas
  var svg = d3.select("#" + "gr-curve-container")
            .append("svg")
            .attr("width", widthMedian + marginMedian.left + marginMedian.right)
            .attr("height", heightMedian + marginMedian.top + marginMedian.bottom)
            .attr("id", svgId)
            .append("g")
            .attr("id", "gr-median")
            .attr("transform", 
              "translate(" + marginMedian.left + "," + marginMedian.top + ")");

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
    .attr("y2", widthRangeMedian)
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
          .attr("x2", widthRangeMedian)
          .attr("y1", yFunction(0))
          .attr("y2", yFunction(0))
          .style("stroke", "black")
          .style("opacity", 0.4);
}


function updateTerms(direction, library){

}

function displayConcentrations(dataDetail, obj){
	// remove previous concentrations from GR curve
	$(".verticalline").remove();
	$(".background-hover").removeClass("background-hover");
	$(".assay-hover").removeClass();

	var unit = dataDetail.split("-")[0]
	var text = obj.textContent;	
	if (unit == "time"){
		var time = text.trim();
		$(obj).addClass("background-hover");
		for(var assay in data_conc[time]){
			for(var i in data_conc[time][assay]){
				addConcentration(data_conc[time][assay][i], assay);
			}
		}
	} else if (unit == "assay"){
		var time = dataDetail.split("-")[1];
		var assay = text.trim();
		$(obj).addClass("assay-hover");
		$(obj).closest('td').next().addClass("assay-hover");
		$(obj).addClass("assay-" + assay);
		$(obj).closest('td').next().addClass("assay-" + assay);
		for(var i in data_conc[time][assay]){
			addConcentration(data_conc[time][assay][i], assay);
		}

	} else if (unit == "conc") { 
		var assay = dataDetail.split("-")[1];
		var conc = text.trim().split(/(\s+)/);
		$(obj).addClass("assay-hover");
		$(obj).closest('td').prev().addClass("assay-hover");
		$(obj).addClass("assay-" + assay);
		$(obj).closest('td').prev().addClass("assay-" + assay);
		for(var i = 0; i < conc.length; i++){
			var c = conc[i].trim();
			if(c != ""){
				addConcentration(c, assay);
			}
		}
	}
}

function addConcentration(conc, assay){
	var drugGRDatapoints = grDatapoints[window.drug];
    var xFunction = drugGRDatapoints.x;

	var svgId = "gr-median";
	var color = window.assayColor[assay];

	d3.select("#" + svgId).append("line")
    .attr("x1", xFunction(conc))
    .attr("x2", xFunction(conc))
    .attr("y1", 0)
    .attr("y2", widthRangeMedian)
    .attr("class", "verticalline")
    .style("stroke", color)
    .style("stroke-dasharray", "3px");
}

function setupTriggerLibrary(){
  // setup trigger for when gene set library changes
  var $librarySelector = $("#library-dropdown")
  var prevLibrary = $librarySelector.val().replace(/\s+/g, '_');
  $("#library-dropdown").change(function(){
    var newLibrary = this.value.replace(/\s+/g, '_');

    // update up/down genes terms
    updateTerms("up", newLibrary);
    updateTerms("down", newLibrary);

    // update Clustergrammer
    $("#" + prevLibrary).hide();
    $("#" + newLibrary).show();

    prevLibrary = newLibrary;

  });
}

// drug dropdown changes, redirect to appropriate drug page
$("#drug-dropdown").change(function(){
  window.location = $(':selected',this).attr('href')
});

if (window.hasL1000 != "False"){
  setupTriggerLibrary();
}


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

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
// =========================

$(document).ready(function() {
  // Load all data from server using AJAX requests
  // get file with file location of all tile orderings
  $.ajax({
    type: "GET",
    url: "../static/data/gr/curve_datapoints/filenames.txt",
    dataType: "text",
    success: function(data) {
        $.ajax({
          type: "GET",
          url: "../static/data/gr/curve_datapoints/" + window.drug.capitalize() + "_curve_datapoints.csv",
          dataType: "text",
          success: function(data) {
            grDatapoints[window.drug] = {};

            //add median curve datapoints to grDatapoints
            var medianData = getMedianCurve(data);
            grDatapoints[window.drug]['datapoints'] = medianData;

            //functions to define exact x,y pixel coordinates
            var x = d3.scale.log().range([0, widthMedian]).clamp(true); //set clamp(true) to ensure slider stays on track
            var y = d3.scale.linear().range([heightMedian, 0]);

            // define domain of x and y
            x.domain(d3.extent(medianData, function(d) { return d.concentration; }));
            // define all curves with the same y axis range -- allows for easier comparison across different drugs
            y.domain([-0.5, 1]);

            //functions to define exact x,y pixel coordinates
            grDatapoints[window.drug]['x'] = x; //set clamp(true) to ensure slider stays on track
            grDatapoints[window.drug]['y'] = y;
            grDatapoints[window.drug]['line'] = d3.svg.line()
                                            //.interpolate("basis")
                                            .x(function(d) { return x(d.concentration); })
                                            .y(function(d) { return y(d.GR); });
            addGRCurve(window.drug);
          }
        });

    }
  });

});

addGRCurve(window.drug);
// After all data has loaded, this function is called
$(document).ajaxStop(function() {
	console.log("testing");
	//addGRCurve(window.drug);
});
