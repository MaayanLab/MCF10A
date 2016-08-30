//Global variable
var globalAssayRowAttributes = new assayRowAttributes();

// array of each drug col's id
var drugNumArray = ["drug1", "drug2", "drug3", "drug4", "drug5", "drug6", "drug7", "drug8"];
var allDrugColumns = {};

// After all data has loaded, this function is called
$(document).ajaxStop(function() {
    $("body").removeClass("loading");

    $(".loading").remove();
    
});

