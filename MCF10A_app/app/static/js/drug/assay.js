// setup trigger for when time selected changes
console.log("included assay.js");
var assay = "l1000";
var time = $("input[name=" + assay + "-time]:checked").val();
console.log($("#" + assay + "-time-toggle"));
$("#" + assay + "-time-toggle").change(function(){
  console.log("testing change");
  var newTime = $("input[name=" + assay + "-time]:checked").val();
  $("#" + assay + "-" + time).hide();
  $("#" + assay + "-" + newTime).show();
  time = newTime;
});




/*var $timeForm = $("#"+ drugNum).find('form');
  $timeForm.change(function(){
    var time = $("input[name=" + drugNum + "]:checked").val();
    colAttributes.setTime(time);
    // add concentration tracks and update canvas for new time
    var minMax = addAllConcentrationTracks(drugNum, colAttributes);
    updateCanvases(drugNum, colAttributes);
  });*/