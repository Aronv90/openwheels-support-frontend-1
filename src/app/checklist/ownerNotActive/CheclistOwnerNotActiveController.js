'use strict';

angular.module('openwheels.checklist.ownerNotActive', [])

.controller('ChecklistOwnerNotActiveController', function ($scope, persons) {
  $scope.persons = persons;
})
;
