'use strict';

angular.module('openwheels.automation', [])

.factory("automate", function () {
  const [ hi ] = [ "hi" ];
  return () => console.log(hi);
});
