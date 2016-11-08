'use strict';

angular.module('openwheels.invoice.trip.line', [])

.controller('InvoiceTripLineDialogController', function ($scope, $uibModalInstance, invoiceService, invoiceSenders, invoiceLine, person) {
  console.log(person);
  $scope.invoiceLine = invoiceLine;
  $scope.invoiceSenders = invoiceSenders;
  $scope.btwOptions = [
    {label: '0%', value: 0},
    {label: '6%', value: 6},
    {label: '21%', value: 21}
  ];

  $scope.dismiss = function () {
    $uibModalInstance.dismiss();
  };

  $scope.save = function (invoiceLine, invoiceId) {
    invoiceLine.type = 'custom';

    if (invoiceLine.id) {
      invoiceService.alterInvoiceLine({
        invoiceRule: invoiceLine.id,
        person: person,
        newProps: {
          description: invoiceLine.description,
          quantity: invoiceLine.quantity,
          price: invoiceLine.price,
          btw: invoiceLine.btw
        }
      })
      .then(function (result) {
        $uibModalInstance.close(result);
      });
    } else {
      invoiceService.createInvoiceLine({
        invoice: invoiceId,
        otherProps: invoiceLine
      }).then(function (result) {
          $uibModalInstance.close(result);
        });
    }
  };
})

;
