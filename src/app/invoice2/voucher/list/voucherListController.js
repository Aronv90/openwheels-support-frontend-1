'use strict';

angular.module('openwheels.invoice2.voucher.list', [])

.controller( 'VoucherListController', function ($location, $state, $stateParams, $scope, vouchers) {

  $scope.vouchers = vouchers;
  $scope.preset = null;

  $scope.params = {
    minValue: $stateParams.minValue,
    maxValue: $stateParams.maxValue
  };

  $scope.presets = [
    { label: '< € 0,00', params: { minValue: null, maxValue: 0 } },
    { label: '€0,00 - €50,00', params: { minValue: 0, maxValue: 50 } },
    { label: '€50,00 - €100,00', params: { minValue: 50, maxValue: 100 } },
    { label: '> €100,00', params: { minValue: 100, maxValue: null } },
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
