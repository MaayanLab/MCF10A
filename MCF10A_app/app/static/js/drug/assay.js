// setup trigger for when time selected changes
var assay = "l1000";
var time = $("input[name=" + assay + "-time]:checked").val();
// console.log($("#" + assay + "-time-toggle"));
$("#" + assay + "-time-toggle").change(function(){
  // console.log("testing change");
  var newTime = $("input[name=" + assay + "-time]:checked").val();
  $("#" + assay + "-" + time).hide();
  $("#" + assay + "-" + newTime).show();
  time = newTime;
});


// setup trigger for L1000CDS2
setupL1000CDS2();
setupL1000();

function setupL1000CDS2(){
  var assay = "l1000cds2";
  var time = $("input[name=" + assay + "-time]:checked").val();
  var defaultDose = 0.04;
  
  updateDose(window.l1000cds2_dict[time], defaultDose, 'dose-dropdown');
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

function updateDose(allDoses, selectedDose, dropdownId){
  $('#' + dropdownId).html(''); // remove all options from select
  var orderedDose = []
  for(dose in allDoses){
    orderedDose.push(+dose);
  }

  orderedDose = orderedDose.sort(function(a,b){return a - b});
  for (var i = 0; i < orderedDose.length; i++){
    if (dose == selectedDose){
      $('#' + dropdownId).append('<option selected>' + orderedDose[i] + '</option>');
    } else {
      $('#' + dropdownId).append('<option>' + orderedDose[i] + '</option>');
    }
  }
}

function updateiFrame(time, dose){
  var url = "http://amp.pharm.mssm.edu/L1000CDS2/#/result/"
  var shareId = window.l1000cds2_dict[time][dose];
  $("#l1000-cds2").attr("src", url + shareId);
}

function setupL1000(){
  var assay = "l1000";
  var time = $("input[name=" + assay + "-time]:checked").val();
  var defaultDose = 0.04;

  // time change
  $("#l1000-time-toggle").change(function(){
    var newTime = $("input[name=" + assay + "-time]:checked").val();
    var regulation = $("input[name=" + assay + "-regulation]:checked").val();
    make_clust('L1000_' + window.drug + '_' + newTime + '_' + regulation + '.json', 'l1000-clustergrammer', false);
    //update download file
    $("#l1000-clustergrammer-download").attr("href", "../data/l1000/values/L1000/L1000_" + window.drug + "_" + newTime + "_" + regulation + ".tsv");
  });

  // regulation change
  $("#l1000-regulation-toggle").change(function(){
    var time = $("input[name=" + assay + "-time]:checked").val();
    var newRegulation = $("input[name=" + assay + "-regulation]:checked").val();
    make_clust('L1000_' + window.drug + '_' + time + '_' + newRegulation + '.json', 'l1000-clustergrammer', false);
    //update download file
    $("#l1000-clustergrammer-download").attr("href", "../data/l1000/values/L1000/L1000_" + window.drug + "_" + time + "_" + newRegulation + ".tsv");
  });
}

/*var $timeForm = $("#"+ drugNum).find('form');
  $timeForm.change(function(){
    var time = $("input[name=" + drugNum + "]:checked").val();
    colAttributes.setTime(time);
    // add concentration tracks and update canvas for new time
    var minMax = addAllConcentrationTracks(drugNum, colAttributes);
    updateCanvases(drugNum, colAttributes);
  });*/