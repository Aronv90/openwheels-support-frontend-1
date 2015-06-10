'use strict';

angular.module('openwheels.resource.show.ccom', [])

.controller('ResourceShowCcomController', function ($scope, alarms, $filter) {
  $scope.alarms = alarms;

});
