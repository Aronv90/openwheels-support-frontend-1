'use strict';

angular.module('openwheels.bank.transaction.list', [])

  .controller('BankTransactionListController', function ($scope, $timeout, $state, $stateParams, $modal, $q, $filter, ngTableParams, bankService, alertService, transactions) {
    $scope.$watch('filter.$', function () {
      $timeout(
        function(){
          $scope.tableParams.reload();
        },
        0);
    });

    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 10,          // count per page
        sorting: {
          datum: 'desc'     // initial sorting
        }
      },
      {
        total: transactions.length, // length of data
        getData: function ($defer, params) {
          // use build-in angular filter
          var filteredData = $filter('filter')(transactions, $scope.filter);
          var orderedData = params.sorting() ?
            $filter('orderBy')(filteredData, params.orderBy()) :
            filteredData;

          angular.forEach(orderedData, function(transaction){
            transaction.bedrag = parseFloat(transaction.bedrag);
          });

          $scope.transactions = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

          params.total(orderedData.length); // set total for recalc pagination
          $defer.resolve($scope.transactions);
        }
      }
    );

    $scope.rematchTransaction = function rematchTransaction(transaction){
//      var idx;
//      idx = transactions.indexOf(transaction);

      bankService.rematch({transaction: transaction.id})
        .then(
      function(result){
        if(true === result) {
          bankService.notLinkedToMutation()
            .then(
          function(newTransactions){
            transactions = newTransactions;
            $scope.tableParams.reload();
          },
          function(){

          }
          );
          alertService.add('success', 'Transaction ' + transaction.id + ' was succesfully matched.', 4000);
        }
      },
      function(error){
        alertService.add('danger', 'Matching transaction ' + transaction.id + ' failed.', 4000);
      }
        );
    };

    $scope.linkPerson = function linkPerson(transaction){
      $modal.open({
        templateUrl: 'bank/transaction/link/bank-transaction-link.tpl.html',
        windowClass: 'modal--xl',
        controller: 'BankTransactionLinkController',
        resolve: {
          transaction: function () {
            return transaction;
          }
        }
      })
        .result.then(
        function (transaction) {
          var foundTransaction;
          foundTransaction = $filter('getByProperty')('id', transaction.id, $scope.transactions);
          var index = $scope.transactions.indexOf(foundTransaction);
          $scope.transactions[index] = transaction;
        }
      );
    };

  });
