'use strict';

angular.module('openwheels.resource.show.log', [])

.controller('ResourceShowLogController', function ($scope, logs) {
  $scope.logs = logs;
});