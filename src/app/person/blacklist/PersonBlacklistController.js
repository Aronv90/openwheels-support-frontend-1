'use strict';

angular.module('openwheels.person.blacklist', [])

  .controller('PersonBlacklistController', function ($scope, $modal, personService, alertService, persons) {
    $scope.persons = persons;
  })

;
