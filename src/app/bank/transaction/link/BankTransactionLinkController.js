'use strict';

angular.module('openwheels.bank.transaction.link', [])

  .controller('BankTransactionLinkController', function ($scope, $modalInstance, $q, $filter, ngTableParams, bankService, alertService, transaction) {
    $scope.transaction = transaction;

    $scope.dismiss = function () {
      $modalInstance.dismiss();
    };

    $scope.link = function(person, transaction) {
      bankService.link({id: transaction.id, person: transaction.account.person.id }).then(
        function(){
          $modalInstance.close(transaction);
          bankService.rematch({transaction: transaction.id});
          alertService.add('success', 'Transaction ' + transaction.id +  ' linked to:  ' + $filter('fullname')(transaction.account.person) + '.', 4000);
        },
        function(error){
          alertService.add('danger', 'Linking transaction ' + transaction.id +  ' to:  ' + $filter('fullname')(transaction.account.person) + ' failed.', 4000);
        }
      );
    };
  });