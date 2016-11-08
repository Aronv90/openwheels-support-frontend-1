'use strict';

angular.module('openwheels.invoice.payment.dialog', [])

.controller('InvoicePaymentDialogController', function ($scope, $filter, $uibModalInstance, accountService, personService, payment, person) {

  $scope.payment = payment;

  $scope.datetimeConfig = {
    //model
    modelFormat: 'YYYY-MM-DD HH:mm',
    formatSubmit: 'yyyy-mm-dd',

    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',

    //options
    selectMonths: true,
    max: true,
    container: 'body'
  };

  var getAccount = function (person) {
    return accountService.get({
      person: person.id
    });
  };

  $scope.dismiss = function () {
    $uibModalInstance.dismiss();
  };

  $scope.save = function (payment) {
    if (payment.id) {
      accountService.alterMutation({
        mutation: payment.id,
        groupedInvoice: payment.group,
        total: payment.amount
      })
      .then(function () {
        $uibModalInstance.close(payment);
      });
    } else {
      getAccount(person)
      .then( function(account) {
        return accountService.createMutation({
          groupedInvoice: payment.group,
          sink: account.id,
          source: 1,
          passed: payment.passed,
          total: payment.amount,
          description: payment.description,
        });
      })
      .then(function (result) {
        $uibModalInstance.close(result);
      });
    }
  };
})

;
