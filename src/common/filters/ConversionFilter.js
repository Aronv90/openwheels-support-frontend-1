'use strict';

angular.module('filters.conversion', [])

.filter('dec2hex', function () {
  return function(input) {
    input = parseInt(input, 10);
    if(_.isNumber(input) && !isNaN(input)){
      return input.toString(16);
    }else{
      return input;
    }
  };
})

.filter('hex2dec', function () {
  return function(input) {
    return parseInt(input, 16);
  };
});
