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
    { label: 'Pay.nl MyWheels, uitbetaald', params: { gateway: 'paynl_gateway_mywheels', state: 'paid' } },
    { label: 'Pay.nl MyWheels, uit te betalen', params: { gateway: 'paynl_gateway_mywheels', state: 'unpaid' } },
    { label: 'Pay.nl ANWB, uitbetaald', params: { gateway: 'paynl_gateway_anwb', state: 'paid' } },
    { label: 'Pay.nl ANWB, uit te betalen', params: { gateway: 'paynl_gateway_anwb', state: 'unpaid' } },
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
