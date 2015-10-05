'use strict';

angular.module('openwheels.invoice2.account.list', [])

.controller( 'v2_AccountListController', function ($location, $state, $stateParams, $scope, alertService,
  account2Service, accounts) {

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
    account2Service.approve({
      person: account.person.id,
      iban: account.iban
    })
    .then(function () {
      account.approved = true;
    })
    .catch(alertService.addError).finally(alertService.loaded);
  };

  /* disapprove an account */
  $scope.disapprove = function (account) {
    alertService.load($scope);
    account2Service.disapprove({
      person: account.person.id,
      iban: account.iban
    })
    .then(function () {
      account.approved = false;
    })
    .catch(alertService.addError).finally(alertService.loaded);
  };

});
