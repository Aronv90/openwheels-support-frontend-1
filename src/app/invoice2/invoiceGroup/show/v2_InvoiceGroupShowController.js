'use strict';

angular.module('openwheels.invoice2.invoiceGroup.show', [
])
.filter('abs', function() {
    return function(num) { return Math.abs(num);};
})
.controller( 'v2_InvoiceGroupShowController', function ($scope, settingsService, invoiceGroup, $rootScope, invoice2Service, alertService) {
  $scope.invoiceGroup = invoiceGroup;
  $scope.FRONT_BASE = settingsService.settings.server;

  // back to dashboard link
  $scope.fromDashboard = false;
  if($rootScope.previousState.name === 'root.trip.dashboard') {
    $scope.fromDashboard = true;
    $scope.trip = $rootScope.previousStateParams.tripId;
  }

  //$scope.me = invoiceGroup.person;
  $scope.grouped_invoices = invoiceGroup;
  $scope.me = invoiceGroup.original.person;
  $scope.invoiceGroup = invoiceGroup.original;


  $scope.unbundle = function(invoiceGroup) {
    invoice2Service.removeInvoiceGroup({invoiceGroup: invoiceGroup.id})
    .then(function(res) {
      alertService.add('success', 'Verzamelfactuur is ontbundeld', 5000);
    })
    .catch(function(err) {
      alertService.add('danger', err.message, 6000);
    })
    ;
  };

});
