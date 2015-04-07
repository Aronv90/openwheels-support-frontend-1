'use strict';

angular.module('openwheels.checklist.driverlicense', [])

  .controller('ChecklistDriverlicenseController', function ($scope, $modal, $q, personService, alertService, uncheckedPersons) {
    $scope.uncheckedPersons = uncheckedPersons;
  })

;
