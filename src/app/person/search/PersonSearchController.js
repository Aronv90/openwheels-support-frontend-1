'use strict';

angular.module('openwheels.person.search', [])

.controller('PersonSearchController', function ($scope, personService, alertService) {

  $scope.data = {};

  $scope.searchZip = function () {
    alertService.load();
    personService.searchZip({
      zipcode: $scope.data.zipcode,
      streetNumber: $scope.data.streetNumber
    })
    .then(function (persons) {
      $scope.persons = persons;
    })
    .catch(alertService.addError)
    .finally(alertService.loaded);
  };

  $scope.searchIban = function () {
    alertService.load();
    personService.search({
      iban: $scope.data.iban
    })
    .then(function (persons) {
      $scope.persons = persons;
    })
    .finally(alertService.loaded);
  };

});
