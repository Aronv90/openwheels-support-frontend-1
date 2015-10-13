'use strict';

angular.module('openwheels.invoice2.payment.list', [])

.controller( 'PaymentListController', function ($location, $state, $stateParams, $scope, payments) {

  $scope.payments = payments;

  var gatewayNames = $scope.gatewayNames = {
    'paynl_gateway_mywheels': 'MyWheels',
    'paynl_gateway_anwb': 'ANWB',
    'voucher': 'Voucher',
  };

  $scope.params = {
    gateway: $stateParams.gateway,
    minValue: $stateParams.minValue,
    maxValue: $stateParams.maxValue,
    startDate: $stateParams.startDate,
    endDate: $stateParams.endDate
  };

  $scope.presets = [
    { label: gatewayNames['voucher'], params: { gateway: 'voucher' } },
    { label: gatewayNames['paynl_gateway_mywheels'], params: { gateway: 'paynl_gateway_mywheels' } },
    { label: gatewayNames['paynl_gateway_anwb'], params: { gateway: 'paynl_gateway_anwb' } },
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
