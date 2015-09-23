'use strict';

angular.module('openwheels.checklist.driverlicense', [])

.controller('ChecklistDriverlicenseController', function ($scope, persons) {
  $scope.persons = persons;
})
;
