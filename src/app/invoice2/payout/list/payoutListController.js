'use strict';

angular.module('openwheels.invoice2.payout.list', [])

.controller( 'PayoutListController', function ($timeout, $location, $state, $stateParams, $scope, dialogService, alertService,
  paymentService, payouts) {

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
    { label: 'Pay.nl MyWheels, uit te betalen', params: { gateway: 'paynl_gateway_mywheels', state: 'unpaid' } }
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

  $scope.dateConfig = {
    //model
    modelFormat: 'YYYY-MM-DD',
    formatSubmit: 'yyyy-mm-dd',

    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',

    //options
    selectMonths: true
  };

  $scope.processPayout = function (payout) {
    dialogService.showModal().then(function () {
      alertService.load();
      paymentService.processPayout({ payout: payout.id }).then(function (result) {
        /* update changes in $scope */
        angular.extend(payout, result);

      })
      .catch(alertService.addError)
      .finally(alertService.loaded);
    });
  };

  $scope.deletePayout = function (payout) {
    paymentService.deletePayout({ payout: payout.id }).then(function (result) {
      /* update changes in $scope */
      var index = payouts.indexOf(payout);
      if (index >= 0) {
        payouts.splice(index, 1);
      }

    })
    .catch(alertService.addError)
    .finally(alertService.loaded);
  };

});
