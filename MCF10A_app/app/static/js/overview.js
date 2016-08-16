// After all data has loaded, this function is called
$(document).ajaxStop(function() {
  $("body").removeClass("loading");

  $(".loading").remove();
  
  });

