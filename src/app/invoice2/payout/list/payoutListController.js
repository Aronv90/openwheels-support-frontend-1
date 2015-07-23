'use strict';

angular.module('openwheels.invoice2.payout.list', [])

.controller( 'PayoutListController', function ($location, $state, $stateParams, $scope, payouts) {

  $scope.payouts = payouts;
  $scope.preset = null;

  $scope.params = {
    state: $stateParams.state,
    gateway: $stateParams.gateway,
    startDate: $stateParams.startDate,
    endDate: $stateParams.endDate
  };

  $scope.presets = [
    { label: 'Pay.nl, uitbetaald', params: { gateway: 'pay_nl', state: 'paid' } },
    { label: 'Pay.nl, uit te betalen', params: { gateway: 'pay_nl', state: 'unpaid' } },
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
