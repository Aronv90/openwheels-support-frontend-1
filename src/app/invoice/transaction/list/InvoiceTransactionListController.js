'use strict';

angular.module('openwheels.invoice.transaction.list', [])

.controller( 'InvoiceTransactionListController', function( $scope, account, transactions ) {
  $scope.account = account;
  $scope.transactions = transactions;
})

;
