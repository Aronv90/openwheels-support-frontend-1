'use strict';

angular.module('openwheels.resource.show.log', [])

.controller('ResourceShowLogController', function ($scope, logs, boardcomputerService) {
  $scope.logs = logs;
  $scope.curLoc = {};

  $scope.getCurrentLocation = function() {
    boardcomputerService.currentLocation({resource: $scope.resource.id})
    .then(function(res) {
      $scope.curLoc = angular.copy(res);
      $scope.curLoc.date = new Date($scope.curLoc.date);
    });
  };
});
