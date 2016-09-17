var frameSize = 120;

// define color scales
// L1000
var colorScaleL1000 = d3.scaleLinear()
    //.domain([min, 0, max])
    .domain([-100, 0, 90])
    //.clamp(true)  // color scale is clamped to boundary if values are out of range
    .range(["rgb(33,102,172)", "rgb(247,247,247)", "rgb(178,24,34)"]);  // RdBu from Colorbrewer

// P100
var colorScaleP100 = d3.scaleLinear()
    .domain([-2, 0, 2])
    //.clamp(true)  // color scale is clammed to boundary if values are out of range
    .range(["rgb(33,102,172)", "rgb(247,247,247)", "rgb(178,24,34)"]);  // RdBu from Colorbrewer

// GCP
var colorScaleGCP = d3.scaleLinear()
    .domain([-2, 0, 2])
    //.clamp(true)  // color scale is clammed to boundary if values are out of range
    .range(["rgb(33,102,172)", "rgb(247,247,247)", "rgb(178,24,34)"]);  // RdBu from Colorbrewer

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
							}
						})
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
				            /*div	.html(d.term + "<br>" + valueLabel + " = " + d.val.toPrecision(3))	
				                .style("left", (d3.event.pageX + 5) + "px")		
				                .style("top", (d3.event.pageY - 28) + "px");*/	
				             console.log(d.term + " " + valueLabel + " = " + d.val);
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

// returns array of dataObj with attributes x, y, tileSize, term, val, fill
function getSVGDataArray(termValues, termOrder, colorScale, termLookup){
	var dataArray = [];
	var rowLength = Math.sqrt(termOrder.length);
	var tileSize = frameSize / rowLength;
	
	var x = 0;
	var y = 0;

	for(var i = 0; i < termOrder.length; i++){
		var curTerm = termOrder[i];
		var displayTerm = $.isEmptyObject(termLookup) ? curTerm : termLookup[curTerm];

		var dataObj = {
				"x": x,
				"y": y,
				"tileSize": tileSize,
				"term": displayTerm
			};

		// get corresponding value of tile for coloring
		if (curTerm in termValues){
			dataObj.val = termValues[curTerm];
			dataObj.fill = colorScale(termValues[curTerm]);
		} else {
			dataObj.val = NaN;
			dataObj.fill = "white";
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

 var containerId = "enrichr-container";
 var svgId = "enrichr-svg-container";
 var curLibSelected = "ChEA_2015";
 var curTimeSelected = "24h";
 var curDrugSelected = "trametinib";
 var concentration = 0.04;

var dataArrayUp = getSVGDataArray(all_values[curLibSelected][curTimeSelected][curDrugSelected][concentration]["up"], all_layouts[curLibSelected][curTimeSelected], colorScaleL1000, {});

var dataArrayDown = getSVGDataArray(all_values[curLibSelected][curTimeSelected][curDrugSelected][concentration]["down"], all_layouts[curLibSelected][curTimeSelected], colorScaleL1000, {});

createCanvas(dataArrayUp, "combined score", containerId, "enrichr-l1000-up", "l1000-up");
//createCanvas(dataArrayDown, "combined score", drugNum + "-l1000-down-container", drugNum + "-l1000-down", "l1000-down");


 // add event handler that draws lines for parallel coordinate scheme