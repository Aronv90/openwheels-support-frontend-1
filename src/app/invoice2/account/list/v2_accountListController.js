'use strict';

angular.module('openwheels.invoice2.account.list', [])

.controller( 'v2_AccountListController', function ($location, $state, $stateParams, $scope, accounts) {

  $scope.accounts = accounts;
  $scope.preset = null;

  $scope.params = {
  };

  $scope.presets = [
  ];

  $scope.selectPreset = function (preset) {
    $location.search(preset.params);
  };

  $scope.refresh = function () {
    $location.search($scope.params);
  };

  $scope.clear = function () {
    $location.search({});
  };

});
