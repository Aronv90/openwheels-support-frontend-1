'use strict';

angular.module('openwheels.resource.creategarage', [])

  .controller('ResourceCreateGarageController', function ($scope, $state, $stateParams, alertService, maintenanceService) {
    $scope.garage = {};
    $scope.message = null;

    $scope.save = function (garage) {
      $scope.message = null;
      maintenanceService.addGarage({
        'name': garage.name,
        'address': garage.address,
        'email': garage.email,
        'number': garage.number
      }).then(function (garage) {
          $scope.saveSuccess = true;
          $scope.message = 'Garage ' + $scope.garage.name + ' successfully created';
          $scope.garage = {};
        }, function (error) {
          $scope.saveSuccess = false;
          $scope.message = 'Error: ' + error.message;
        });
    };
  });