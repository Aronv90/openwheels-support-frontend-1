'use strict';

angular.module('openwheels.bank.transaction.import', [])

  .controller('BankTransactionImportController', function ($scope, $q, $upload, transactionService, alertService) {
    var file;

    $scope.onFileSelect = function ($files) {
      file = $files[0];

      $scope.upload = function () {
        transactionService.upload(file).then(
          function (result) {
            // message success
            if(result.status === 200 && Array.isArray(result.data) ){
              alertService.add('success', 'Transactions for ' +result.data.length+ ' days imported', 5000);
            }else{
              alertService.add('warning', 'Importing transactions failed', 5000);
            }
          },
          function (error) {
            // error handling
            alertService.add('danger', 'Importing transactions failed', 5000);
          }
        );
      };
    };


  });