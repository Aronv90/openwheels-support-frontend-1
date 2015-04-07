'use strict';

angular.module('openwheels.invoice.account.list', [])

.controller( 'InvoiceAccountListController', function( $scope, accounts ) {
  $scope.accounts = accounts;
})

;
