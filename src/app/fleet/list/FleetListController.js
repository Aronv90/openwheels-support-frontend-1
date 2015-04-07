'use strict';

angular.module('openwheels.fleet.list', [])

.controller('FleetListController', function ($scope, fleets) {
  $scope.fleets = fleets;
})
;
