//GLOBAL VARIABLES
var gcpLookup = {};

var colorScaleGCP = d3.scaleLinear()
	    .domain([-1.0, 0, 1.0])
	    // .domain([-5, 0, 5])
	    .clamp(true)  // color scale is clammed to boundary if values are out of range
	    .range(["rgb(33,102,172)", "rgb(247,247,247)", "rgb(178,24,34)"]);  // RdBu from Colorbrewer

// returns an object
/*{'concentration': 
	{'term1': ###, 'term2': ###, ...},
  'concentration2':
  	{'term1': ###, 'term2': ###, ...}
}*/
function parseGCP(tsvData){
	var value = {};
	var tsvLines = tsvData.split(/\r\n|\n/);
	var headerArray = tsvLines[0].split('\t'); //["", "pr_gcp_histone_mark", "0.001", "0.003162", "0.01"]

	for (var i = 2; i < headerArray.length; i++){
		var concentration = +headerArray[i];
		value[concentration] = {};
	}
	
	// iterate through each line of TSV file
	for (var i = 1; i < tsvLines.length - 1; i++){
		var lineArray = tsvLines[i].split("\t");
		var term = lineArray[0];
		gcpLookup[term] = lineArray[1]; //add gene symbol to lookup dictionary for id
		for (var j = 2; j < lineArray.length; j++){
			concentration = +headerArray[j];
			value[concentration][term] = +lineArray[j]; //add to value object and convert to number
		}
	}
	return value;
}

function getSVGDataArrayGCP(termValues, termOrder, concentration){
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
				"term": gcpLookup[curTerm]
			};

		// get corresponding value of tile for coloring
		if (curTerm in termValues){
			dataObj.val = termValues[curTerm];
			dataObj.fill = colorScaleGCP(termValues[curTerm]);
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


$(document).ready(function() {
	// Load all data from server using AJAX requests
	// get file with file location of all tile orderings
	$.ajax({
		type: "GET",
		url: "static/data/gcp/canvas_order/filenames.txt",
		dataType: "text",
		success: function(data) {
			var lines = data.split(/\r\n|\n/);
			for(var i = 0; i < lines.length; i++){
				if (lines[i] == "filenames.txt" || !lines[i]){
					continue;
				}

				$.ajax({
					type: "GET",
					url: "static/data/gcp/canvas_order/" + lines[i],
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
		url: "static/data/gcp/values/filenames.txt",
		dataType: "text",
		success: function(data) {
			var lines = data.split(/\r\n|\n/);
			for(var i = 0; i < lines.length; i++){
				if (lines[i] == "filenames.txt" || !lines[i]){
					continue;
				}
				$.ajax({
					type: "GET",
					url: "static/data/gcp/values/" + lines[i],
					dataType: "text",
					success: function(data) {
						var filename = this.url.split("/").slice(-1)[0].split(".")[0];
						var assay = filename.split("_")[0];
						var drug = filename.split("_")[1];
						var time = filename.split("_")[2];

						//add values to global var 'all_values'
						if (!(assay in all_values)){
							all_values[assay] = {};
						}
						if (!(time in all_values[assay])){
							all_values[assay][time] = {};
						}

						all_values[assay][time][drug] = parseGCP(data);
					}
				});
			}
		}
	});

});

// After all data has loaded, this function is called
$(document).ajaxStop(function() {
	/*var dataArrayGCP = getSVGDataArrayGCP(all_values["GCP"]["24h"]["trametinib"]["0.001"], all_layouts["GCP"]["24h"], "0.001");

	createCanvas(dataArrayGCP, "z score", "drug1-gcp-container", "drug1-gcp");*/
});