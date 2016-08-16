// GLOBAL VARIABLES
var drugNumArray = ["drug1", "drug2", "drug3", "drug4", "drug5", "drug6", "drug7", "drug8"];
var all_layouts = {}; //Object with all tile layouts
/*{
	'library': {'3h': [], '24h': []},
	'library': {'3h': [], '24h': []}, 
	...
}*/


var all_values = {};

/*{
	'library': {'3h': {'drug': values}, '24h': {'drug': values}}
}*/

var curLibSelected = "ChEA_2015"; //default library is 'ChEA_2015'
var frameSize = $("#drug1-l1000-up").width();

// red for positive, blue for negative
/*var colorScaleL1000 = d3.scale.linear()
	    .domain([-70.0, 0, 70.0])
	    // .domain([-5, 0, 5])
	    .clamp(true)  // color scale is clammed to boundary if values are out of range
	    .range(["rgb(33,102,172)", "rgb(247,247,247)", "rgb(178,24,34)"]);  // RdBu from Colorbrewer	*/

// returns an object
/*{'concentration': 
	{'up': {'term1': ###, 'term2': ###, ...} }
	{'down': {'term1': ###, 'term2': ###, ...} },
  'concentration2':
  	{'up': {'term1': ###, 'term2': ###, ...} }
	{'down': {'term1': ###, 'term2': ###, ...} }, ...
}*/
function parseCombinedScoreL1000(tsvData){
	var value = {};
	var tsvLines = tsvData.split(/\r\n|\n/);
	var headers = tsvLines[0].split('\t');
	var headersArray = [NaN]; // create quick lookup array with headerInfo objects

	headers.shift(); //remove first element from headers

	for (var i = 0; i < headers.length; i++){ //ex header element = "2_down_0.04"
		var headerInfo = {};
		headerInfo.direction = headers[i].split("_")[1];
		headerInfo.concentration = +headers[i].split("_")[2]; // make sure to convert concentration to value (due to Clustergrammer hack of including 01.11 for alphabetical ordering)

		// create entry in value {}
		if (headerInfo.concentration in value){
			value[headerInfo.concentration][headerInfo.direction] = {}
		} else{
			value[headerInfo.concentration] = {}
			value[headerInfo.concentration][headerInfo.direction] = {}
		}
		headersArray.push(headerInfo);
	}
	
	// iterate through each line of TSV file
	for (var i = 2; i < tsvLines.length; i++){
		var lineArray = tsvLines[i].split("\t");
		var term = lineArray[0];
		for (var j = 1; j < lineArray.length; j++){
			headerInfo = headersArray[j];
			value[+headerInfo.concentration][headerInfo.direction][term] = +lineArray[j]; //add to value object and convert to number
		}
	}

	return value;
}

/*var tileTip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-6, 0])
  .html(function(d) {
    return d;
  });*/

/*var tooltip = bootstrap.tooltip()
        .placement(function() {
          return this.getAttribute("data-placement");
        });*/

/*{'concentration': 
	{'up': {'term1': ###, 'term2': ###, ...} }
	{'down': {'term1': ###, 'term2': ###, ...} },
  'concentration2':
  	{'up': {'term1': ###, 'term2': ###, ...} }
	{'down': {'term1': ###, 'term2': ###, ...} }, ...
}*/

function getSVGDataArrayL1000(termValues, termOrder, concentration){
	var dataArray = [];
	var rowLength = Math.sqrt(termOrder.length);
	var tileSize = frameSize / rowLength;
	
	var x = 0;
	var y = 0;

	for(var i = 0; i < termOrder.length; i++){
		var curTerm = termOrder[i];
		var dataObj = {
				"x": x,
				"y": y,
				"tileSize": tileSize,
				"term": curTerm
			};

		// get corresponding value of tile for coloring
		if (curTerm in termValues){
			dataObj.val = termValues[curTerm];
			//dataObj.fill = colorScaleL1000(termValues[curTerm]);
		} else {
			dataObj.val = NaN;
			//dataObj.fill = "white";
		}
		// add dataObj to overall dataArray
		dataArray.push(dataObj);

		// increment x and y values 
		if (i != 0 && (i + 1) % rowLength == 0){
			x = 0;
			y += tileSize;
		} else{
			x += tileSize;
		}
	}
	
	return dataArray;
}

function createBlankCanvas(containerId, svgId){
	// remove previous svg
	d3.select("#" + svgId).remove();

	// add new svg
	var svg = d3.select("#" + containerId)
			.append("svg")
		        .attr("width", frameSize)
		        .attr("height", frameSize)
		        .attr("class", "grid")
		        .attr("id", svgId);

	var rect = svg.append("rect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", frameSize)
					.attr("height", frameSize)
					.style("fill", "rgb(184, 184, 184)");

	return;
}

function createCanvas(dataArray, valueLabel, containerId, svgId, assay){
	var borderColor = "black";
	var border = 1;

	// remove previous svg
	d3.select("#" + svgId).remove();

	// add new svg
	var svg = d3.select("#" + containerId)
			.append("svg")
		        .attr("width", frameSize)
		        .attr("height", frameSize)
		        .attr("class", "grid")
		        .attr("id", svgId);

	// Define the div for the tooltip
/*	var div = d3.select("body").append("div")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);
*/
	// define color scale
	var min = d3.min(dataArray, function(d) { return d.val; });
	var max = d3.max(dataArray, function(d) { return d.val; });
  	//var max = Math.max.apply(Math, doseArray);

  	if (assay == "p100" || assay == "gcp"){
  		var colorScaleL1000 = d3.scaleLinear()
	    .domain([-2, 0, 2])
	    // .domain([-5, 0, 5])
	    //.clamp(true)  // color scale is clamped to boundary if values are out of range
	    .range(["rgb(33,102,172)", "rgb(247,247,247)", "rgb(178,24,34)"]);  // RdBu from Colorbrewer	
  	} else {
  		var colorScaleL1000 = d3.scaleLinear()
	    //.domain([min, 0, max])
	    .domain([-100, 0, 90])
	    //.clamp(true)  // color scale is clamped to boundary if values are out of range
	    .range(["rgb(33,102,172)", "rgb(247,247,247)", "rgb(178,24,34)"]);  // RdBu from Colorbrewer
  	}

	var rects = svg.selectAll("#" + svgId)
					.data(dataArray)
					.enter().append("rect")
					.attr("x", function(d) {return(d.x);})
					.attr("y", function(d) {return(d.y);})
					.attr("width", function(d) {return(d.tileSize);})
					.attr("height", function(d) {return(d.tileSize);})
					.style("fill", function(d) {
							if (isNaN(d.val)){
								return "white";
							} else{
								return colorScaleL1000(d.val);
							}})
					.on("click", function(d) {
						$("#" + assay + "-selected").html(d.term);
					})
					.on("mouseover", function(d) {	
								var div = d3.select("body").append("div")	
										    .attr("class", "tooltip")				
										    .style("opacity", 0);
										
				            div.transition()		
				                .duration(200)		
				                .style("opacity", .9);		
				            div	.html(d.term + "<br>" + valueLabel + " = " + d.val.toPrecision(3))	
				                .style("left", (d3.event.pageX + 5) + "px")		
				                .style("top", (d3.event.pageY - 28) + "px");	
				            })					
				        .on("mouseout", function(d) {		
				            /*div.transition()		
				                .duration(300)		
				                .style("opacity", 0);	*/
				             $( ".tooltip" ).remove();
				        });

	// add border to canvas
	var svgBorder = svg.append("rect")
						.attr("x", 0)
						.attr("y", 0)
						.attr("height", frameSize)
						.attr("width", frameSize)
						.style("stroke", borderColor)
       					.style("fill", "none")
       					.style("stroke-width", border);

	return;
}


//change gene set library for L1000
$('#l1000-dropdown').on('change', function() {
	
	for(var i = 0; i < drugNumArray.length; i++){
		var drugNum = drugNumArray[i];
		var curTimeSelected = $("input[type=radio][name=" + drugNum + "]:checked").val();
		var curLibSelected = $("#l1000-dropdown option:selected").text().replace(/\s+/g, '_');
		var curDrugSelected = $("#" +  drugNum + "-dropdown option:selected").text().toLowerCase();
		var curPosition = $("#" + drugNum + "-verticalline").attr("x1");
		//var curConcentration = $("#" + drugNum + "-verticalline").attr("conc");

		// TODO: need to update canvas for all 8 drugs
		updateL1000Concentration(grDatapoints[curDrugSelected]['x'].invert(curPosition), drugNum, curDrugSelected, curLibSelected, curTimeSelected);
	}
});

function addCanvasOrder(order, filename){
	var time = filename.split("_").slice(-1)[0];
	var library = filename.split("_").slice(0, -1).join("_");

	/*{
		'library': {'3h': [], '24h': []},
		'library': {'3h': [], '24h': []}, 
		...
	}*/

	if (!(library in all_layouts)){
		all_layouts[library] = {};
	}
	all_layouts[library][time] = order;
}

$(document).ready(function() {
	// Load all data from server using AJAX requests
	// get file with file location of all tile orderings
	/*window.testData*/
	console.log(window.testData);
	/*{% for d in json_data %}
            console.log({{d | safe}})
     {%endfor%}*/
	$.ajax({
		type: "GET",
		url: "static/data/l1000/canvas_order/filenames.txt",
		dataType: "text",
		success: function(data) {
			var lines = data.split(/\r\n|\n/);
			for(var i = 0; i < lines.length; i++){
				if (lines[i] == "filenames.txt" || !lines[i]){
					continue;
				}
				$.ajax({
					type: "GET",
					url: "static/data/l1000/canvas_order/" + lines[i],
					dataType: "text",
					success: function(data) {
						var filename = this.url.split("/").slice(-1)[0].split(".")[0];
						//add tile orderings to global var 'all_layouts'
						addCanvasOrder(JSON.parse(data)['texts'], filename);
					}
				});
			}
		}
	});

	// get file with file location of all values for tiles
	$.ajax({
		type: "GET",
		url: "static/data/l1000/values/filenames.txt",
		dataType: "text",
		success: function(data) {
			var lines = data.split(/\r\n|\n/);
			for(var i = 0; i < lines.length; i++){
				if (lines[i] == "filenames.txt" || !lines[i]){
					continue;
				}
				$.ajax({
					type: "GET",
					url: "static/data/l1000/values/" + lines[i],
					dataType: "text",
					success: function(data) {
						var filename = this.url.split("/").slice(-1)[0].split(".")[0];
						var time = filename.split("_").slice(-3)[0];
						var drug = filename.split("_").slice(-4)[0];
						var library = filename.split("_").slice(0, -4).join("_");
						//add values to global var 'all_values'
						if (!(library in all_values)){
							all_values[library] = {};
						}
						if (!(time in all_values[library])){
							all_values[library][time] = {};
						}

						all_values[library][time][drug] = parseCombinedScoreL1000(data);
					}
				});
			}
		}
	});
});


// After all data has loaded, this function is called
$(document).ajaxStop(function() {


});