'use strict';

angular.module('openwheels.checklist.bankcheck', [])

  .controller('ChecklistBankcheckController', function ($scope, $modal, $q, personService, alertService, persons) {
    $scope.persons = persons;
  })

;
