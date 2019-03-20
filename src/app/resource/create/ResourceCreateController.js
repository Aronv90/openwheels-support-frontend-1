'use strict';

angular.module('openwheels.resource.create', [])

  .controller('ResourceCreateController', function ($scope, $log, $state, $filter, $stateParams, alertService, personService, resourceService) {
    $scope.resource = {};

    /**
     * Typeahead Person
     */
    $scope.searchPersons = function ($viewValue) {
      return personService.search({
        search: $viewValue
      });
    };

    $scope.formatPerson = function ($model) {
      var inputLabel = '';
      if ($model) {
        inputLabel = $filter('fullname')($model) + ' [' + $model.id + ']';
      }
      return inputLabel;
    };

    $scope.save = function (resource) {
      resourceService.create({
        'owner': resource.owner.id,
        'registrationPlate': resource.registrationPlate
      }).then(function (resource) {
          alertService.add('success', 'Auto toegevoegd', 3000);
          $state.go('^.show.edit', {'resourceId': resource.id});
        }, function (error) {
          console.log(error);
          alertService.add('danger', error.message, 5000);
        });
    };
  });