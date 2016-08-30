// Module for creating and triggering events
// (JS Module pattern)

var customEvent = function(callback){
  var listeners = [];

  // add listenerId to list of listeners
  var addListener = function(listenerId){
    // check if id is not already in array of listeners
    if (listeners.indexOf(listenerId) == -1){
      listeners.push(listenerId);
    }
  };

  // dispatch event to all listeners with callback function and new value
  var dispatchNewValue = function(newValue){
    for(var i = 0; i < listeners.length; i++){
      callback(newValue, listeners[i]);
    }
  };

  return{
    addListener: addListener,
    dispatchNewValue: dispatchNewValue
  };
};