//GLOBAL VARIABLES

var colorScaleP100 = d3.scaleLinear()
	    .domain([-1.0, 0, 1.0])
	    // .domain([-5, 0, 5])
	    .clamp(true)  // color scale is clammed to boundary if values are out of range
	    .range(["rgb(33,102,172)", "rgb(247,247,247)", "rgb(178,24,34)"]);  // RdBu from Colorbrewer


function getSVGDataArrayP100(termValues, termOrder, concentration){
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
				"term": p100GeneLookup[curTerm]
			};

		// get corresponding value of tile for coloring
		if (curTerm in termValues){
			dataObj.val = termValues[curTerm];
			dataObj.fill = colorScaleP100(termValues[curTerm]);
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