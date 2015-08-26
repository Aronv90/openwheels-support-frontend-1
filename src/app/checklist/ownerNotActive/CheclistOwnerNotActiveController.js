'use strict';

angular.module('openwheels.checklist.ownerNotActive', [])

.controller('ChecklistDriverlicenseController', function ($scope, persons) {
  $scope.persons = persons;
})
;
