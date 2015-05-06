'use strict';

angular.module('openwheels.person.search', [])

    .controller('PersonSearchController', function ($scope, personService) {
    
        $scope.searchZip = function (person) {
            return personService.searchZip({
                zipcode: person.zipcode,
                streetNumber: person.streetNumber
              })
            .then(function (persons) {
                $scope.persons = persons;
              });
          };
          
      });