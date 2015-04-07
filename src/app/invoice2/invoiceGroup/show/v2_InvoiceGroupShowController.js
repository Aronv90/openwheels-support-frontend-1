'use strict';

angular.module('openwheels.invoice2.invoiceGroup.show', [
])

.controller( 'v2_InvoiceGroupShowController', function (
  $scope,
  settingsService,
  invoiceGroup
  ) {

  $scope.invoiceGroup = invoiceGroup;
  $scope.FRONT_BASE = settingsService.settings.server;
});
