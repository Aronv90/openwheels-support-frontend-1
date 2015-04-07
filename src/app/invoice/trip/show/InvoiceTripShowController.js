'use strict';

angular.module('openwheels.invoice.trip.show', [])

.controller('InvoiceTripShowController', function ($scope, $modal, $filter, $stateParams, overview, invoiceService, settingsService, FRONT_TRIP_OVERVIEW, FRONT_SWITCHUSER) {

  $scope.overview = overview;
  $scope.frontTripOverview = settingsService.settings.server + FRONT_TRIP_OVERVIEW + '/' + $stateParams.tripId +  FRONT_SWITCHUSER;

  $scope.totalExBTW = function (invoiceLines) {
    if (!angular.isArray(invoiceLines)) {
      return;
    }
    var totalExBTW = 0;

    angular.forEach(invoiceLines, function(value, key){
      var total = parseFloat(value.price) * value.quantity;
      totalExBTW += total / ( (value.btw + 100) / 100 );
    });

    return totalExBTW;
  };

  $scope.total = function (invoiceLines) {
    var total = 0;
    if (!angular.isArray(invoiceLines)) {
      return;
    }
    angular.forEach(invoiceLines, function(value, key){
      total += parseFloat(value.price) * value.quantity;
    });

    return total;
  };

  //create invoice line modal
  $scope.createInvoiceLine = function () {
    $modal.open({
      templateUrl: 'invoice/trip/line/invoice-trip-line-dialog.tpl.html',
      windowClass: 'modal--xl',
      controller: 'InvoiceTripLineDialogController',
      resolve: {
        invoiceLine: function() {
          return {};
        },
        invoiceSenders: function() {
          return getInvoiceSenders($scope.overview);
        },
        person: function() {
          return;
        }
      }
    }).result.then(function (invoiceLine) {
        //add to array on scope
        overview.push(invoiceLine);
      });
  };

  $scope.alterInvoiceLine = function (invoiceLine, $index) {
    var invoiceLineCopy = angular.copy(invoiceLine);

    $modal.open({
      templateUrl: 'invoice/trip/line/invoice-trip-line-dialog.tpl.html',
      windowClass: 'modal--xl',
      controller: 'InvoiceTripLineDialogController',
      resolve: {
        invoiceLine: function() {
          return invoiceLineCopy;
        },
        invoiceSenders: function() {
          return getInvoiceSenders($scope.overview);
        },
        person: function(){
          return $stateParams.person;
        }
      }
    }).result.then(function (invoiceLine) {
      //edit in array on scope
      angular.extend($scope.overview[$index], invoiceLine);
    });
  };

  $scope.removeInvoiceLine = function (invoiceLineId, $index) {

    invoiceService.removeInvoiceLine({
      invoiceRule: invoiceLineId
    }).then(function () {
        //remove line from array on scope
        $scope.overview.splice($index, 1);
      });
  };

  var getInvoiceSenders = function(tripInvoiceLines) {
    var invoiceSenders = [];
    angular.forEach(tripInvoiceLines, function(invoiceLine){
      if(invoiceLine.hasOwnProperty('invoice')) {
        invoiceSenders.push({
          id: invoiceLine.invoice.id,
          sender: invoiceLine.invoice.sender || {
            firstName: 'MyWheels'
          }
        });
      }
    });
    return invoiceSenders;
  };
})
;
