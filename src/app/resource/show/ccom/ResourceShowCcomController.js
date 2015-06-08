'use strict';

angular.module('openwheels.resource.show.ccom', [])

.controller('ResourceShowCcomController', function ($scope, alarms, $filter) {
  $scope.alarms = alarms;

  $scope.alarmDescriptions = ['Uni restarted after empty batery', 'Unit restarted after plug of (current was off)', 'Warning. Battery is almost empty'];

});
