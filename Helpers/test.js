var langTranslater = require('./translateApi');
var sync  = require('synchronize');

read = sync(langTranslater.read);

var message = [];

  sync.fiber(function() {
    function something(){
      var tranlsate={
        body:read('en','es','is this a real life?')
      }
      console.log(tranlsate)
    }
    something();
  });
