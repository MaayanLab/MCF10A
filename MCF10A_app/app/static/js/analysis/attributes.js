var drugColumnAttributes = function(drugNum){
  // defined in HTML 
  var drug = $("#"+ drugNum).find('select').val();
  var time = $("input[name=" + drugNum + "]:checked").val();
  // initialize slider position (in px NOT concentration) to 0
  var position = 0;

  getDrug = function(){
    return drug.toLowerCase();
  };

  setDrug = function(aDrug){
    drug = aDrug;
  };

  getTime = function(){
    return time;
  };

  setTime = function(aTime){
    time = aTime;
  };

  getPosition = function(){
    return position;
  };

  setPosition = function(aPosition){
    position = aPosition;
  };

  return{
    getDrug: getDrug,
    setDrug: setDrug,
    getTime: getTime,
    setTime: setTime,
    getPosition: getPosition,
    setPosition: setPosition
  }
};

var assayRowAttributes = function(){
  // defined in HTML
  var l1000Library = $("#l1000-dropdown option:selected").text().replace(/\s+/g, '_');

  getLibrary = function(){
    return l1000Library.replace(/\s+/g, '_');
  };

  setLibrary = function(aLibrary){
    l1000Library = aLibrary;
  };

  return{
    getLibrary: getLibrary,
    setLibrary: setLibrary
  }
};