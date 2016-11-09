'use strict';

angular.module('openwheels.person.blacklist', [])

  .controller('PersonBlacklistController', function ($scope, $uibModal, personService, alertService, persons) {
    $scope.persons = persons;
  })

;
