'use strict';

angular.module('openwheels.invoice2.payment.list', [])

.controller( 'PaymentListController', function ($location, $state, $stateParams, $scope, payments) {

  $scope.payments = payments;
  $scope.preset = null;

  $scope.params = {
    gateway: $stateParams.gateway,
    minValue: $stateParams.minValue,
    maxValue: $stateParams.maxValue,
    startDate: $stateParams.startDate,
    endDate: $stateParams.endDate
  };

  $scope.presets = [
    { label: 'Pay.nl MyWheels', params: { gateway: 'paynl_gateway_mywheels' } },
    { label: 'Pay.nl ANWB', params: { gateway: 'paynl_gateway_anwb' } },
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
