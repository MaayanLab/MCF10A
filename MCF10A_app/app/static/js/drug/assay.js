// setup trigger for when time selected changes
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


// setup trigger for L1000CDS2
setupL1000CDS2();

function setupL1000CDS2(){
  var assay = "l1000cds2";
  var time = $("input[name=" + assay + "-time]:checked").val();
  var defaultDose = 0.04;
  
  updateDose(time, defaultDose);
  updateiFrame(time, defaultDose);

  // time change
  $("#l1000cds2-time-toggle").change(function(){
    var newTime = $("input[name=" + assay + "-time]:checked").val();
    var doseSelected = $('#dose-dropdown option:selected').val();
    //updateDose(newTime, doseSelected);
    updateiFrame(newTime, doseSelected);
  });

  // dose change
  $("#dose-dropdown").change(function(){
    var time = $("input[name=" + assay + "-time]:checked").val();
    var newDose = this.value;
    updateiFrame(time, newDose);
  });
}

function updateDose(time, selectedDose){
  $('#dose-dropdown').html(''); // remove all options from select
  var orderedDose = []
  for(dose in window.l1000cds2_dict[time]){
    orderedDose.push(+dose);
  }
  orderedDose = orderedDose.sort(function(a,b){return a - b});
  for (var i = 0; i < orderedDose.length; i++){
    if (dose == selectedDose){
      $('#dose-dropdown').append('<option selected>' + orderedDose[i] + '</option>');
    } else {
      $('#dose-dropdown').append('<option>' + orderedDose[i] + '</option>');
    }
  }
}

function updateiFrame(time, dose){
  var url = "http://amp.pharm.mssm.edu/L1000CDS2/#/result/"
  var shareId = window.l1000cds2_dict[time][dose];
  $("#l1000-cds2").attr("src", url + shareId);
}

/*var $timeForm = $("#"+ drugNum).find('form');
  $timeForm.change(function(){
    var time = $("input[name=" + drugNum + "]:checked").val();
    colAttributes.setTime(time);
    // add concentration tracks and update canvas for new time
    var minMax = addAllConcentrationTracks(drugNum, colAttributes);
    updateCanvases(drugNum, colAttributes);
  });*/