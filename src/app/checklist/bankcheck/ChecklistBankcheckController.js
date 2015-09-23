'use strict';

angular.module('openwheels.checklist.bankcheck', [])

.controller('ChecklistBankcheckController', function ($scope, persons) {
  $scope.persons = persons;
})
;
