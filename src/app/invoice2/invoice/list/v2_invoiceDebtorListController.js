'use strict';

angular.module('openwheels.invoice2.invoice.debtor.list', [])

.controller('v2_InvoiceDebtorListController', function (
  $scope,
  $state,
  $stateParams,
  settingsService,
  invoices
  ) {

  $scope.invoices = invoices;

  $scope.FRONT_BASE = settingsService.settings.server;

  $scope.params = (function () {
    var p = {
      date: $stateParams.date || ''
    };
    return p;
  })();

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

  $scope.refresh = function () {
    $state.go($state.current.name, $scope.params);
  };
})
;
