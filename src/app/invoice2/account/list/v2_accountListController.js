'use strict';

angular.module('openwheels.invoice2.account.list', [])

.controller( 'v2_AccountListController', function ($location, $state, $stateParams, $scope, alertService,
  invoice2Service, accounts) {

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

  /* approve an account */
  $scope.approve = function (account) {
    alertService.load($scope);
    invoice2Service.approve({
      account: account.id
    })
    .then(function () {
      account.approved = true;
    })
    .catch(alertService.addError).finally(alertService.loaded);
  };

  /* disapprove an account */
  $scope.disapprove = function (account) {
    alertService.load($scope);
    invoice2Service.disapprove({
      account: account.id
    })
    .then(function () {
      account.approved = false;
    })
    .catch(alertService.addError).finally(alertService.loaded);
  };

});
