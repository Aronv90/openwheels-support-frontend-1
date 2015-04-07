'use strict';

angular.module('openwheels.invoice.group.show', [
])

.controller( 'InvoiceGroupShowController', function( $scope, $modal, dialogService, $filter, invoiceGroup, personService, accountService, invoiceService, alertService, settingsService, FRONT_USER_INVOICEGROUP ) {
  if(!invoiceGroup){
    return console.log('error, no invoiceGroup');
  }
  $scope.invoiceGroup = invoiceGroup;
  $scope.frontInvoiceGroupPath = settingsService.settings.server + FRONT_USER_INVOICEGROUP + '/';

  //create payment modal
  $scope.createPayment = function (groupId) {
    $modal.open({
      templateUrl: 'invoice/payment/invoice-payment-dialog.tpl.html',
      windowClass: 'modal--xl',
      controller: 'InvoicePaymentDialogController',
      resolve: {
        payment: function() {
          return {
            group: groupId
          };
        },
        person: function() {
          return invoiceGroup.invoiceGroup.person;
        }
      }
    }).result.then(function (payment) {
      invoiceGroup.invoiceGroup.payments.push(payment);
    });
  };

  $scope.alterPayment = function (payment, groupId, index) {
    var paymentCopy = angular.copy(payment);
    paymentCopy.group = groupId;
    paymentCopy.amount = parseFloat(paymentCopy.total);

    $modal.open({
      templateUrl: 'invoice/payment/invoice-payment-dialog.tpl.html',
      windowClass: 'modal--xl',
      controller: 'InvoicePaymentDialogController',
      resolve: {
        payment: function() {
          return paymentCopy;
        },
        person: function() {
          return invoiceGroup.invoiceGroup.person;
        }
      }
    }).result.then(function (payment) {
      invoiceGroup.invoiceGroup.payments.splice(index,1);
      invoiceGroup.invoiceGroup.payments.push(payment);
    });
  };

  $scope.removePayment = function (paymentId, index) {
    dialogService.showModal()
    .then( function() {
      accountService.removeMutation({
        mutation: paymentId
      })
      .then( function() {
        alertService.add('success', 'Payment removed', 2000);
        invoiceGroup.invoiceGroup.payments.splice(index,1);
      }, function(error) {
        alertService.add('danger', error.message, 5000);
      });
    });

  };



  //create invoice modal
  $scope.createInvoice = function () {
    var dialogOptions = {
      closeButtonText: 'Cancel',
      actionButtonText: 'Continue',
      headerText: null,
      bodyText: 'Are you sure you want to add a new invoice? You can also create an invoice line for an existing trip'
    };

    var showInvoiceModal = function() {
      $modal.open({
        templateUrl: 'invoice/line/invoice-line-dialog.tpl.html',
        windowClass: 'modal--xl',
        controller: 'InvoiceLineDialogController',
        resolve: {
          invoiceLine: function() {
            return {};
          },
          person: function() {
            return $scope.invoiceGroup.invoiceGroup.person;
          }
        }
      })
      .result
      .then(function () {
        alertService.add('info', 'Invoice line toegevoegd, ververs om te zien, (gaat later automatisch goed)', 2000);
      });
    };

    if($scope.invoiceGroup.trips.length > 0) {
      dialogService.showModal({}, dialogOptions)
      .then(showInvoiceModal);
    } else {
      showInvoiceModal();
    }
  };

  $scope.alterInvoiceLine = function (invoiceLine, index) {
    var invoiceLineCopy = angular.copy(invoiceLine);

    invoiceLineCopy.total = parseFloat(invoiceLine.total);
    invoiceLineCopy.senderId = invoiceLine.sender_id;
    invoiceLineCopy.btwPercent = invoiceLine.btw_percent;
    invoiceLineCopy.receiverId = invoiceGroup.invoiceGroup.person.id;

    $modal.open({
      templateUrl: 'invoice/line/invoice-line-dialog.tpl.html',
      windowClass: 'modal--xl',
      controller: 'InvoiceLineDialogController',
      resolve: {
        invoiceLine: function() {
          return invoiceLineCopy;
        },
        person: function() {
          return $scope.invoiceGroup.invoiceGroup.person;
        }
      }
    }).result.then(function (invoiceLine) {
      //clear scope
      invoiceGroup.invoiceGroup.lines.splice(index,1);
      invoiceGroup.invoiceGroup.lines.push(invoiceLine);
    });
  };

  $scope.removeInvoiceLine = function (invoiceLineId, index) {
    dialogService.showModal()
    .then( function() {
      invoiceService.removeInvoiceLine({
        invoiceRule: invoiceLineId
      })
      .then( function() {
        alertService.add('success', 'Invoice line removed)', 2000);
        invoiceGroup.invoiceGroup.lines.splice(index,1);
      }, function(error) {
        alertService.add('danger', error.message, 5000);
      });
    });

  };



  for (var i = invoiceGroup.trips.length - 1; i >= 0; i--) {

    var total = 0;
    var btw = 0;
    var trip = invoiceGroup.trips[i];

    for (var j = trip.invoices.length - 1; j >= 0; j--) {

      var invoice = trip.invoices[j];

      for (var k = invoice.rules.length - 1; k >= 0; k--) {

        var rule = invoice.rules[k];
        total += rule.price * rule.quantity;
        btw += rule.price * rule.quantity - (rule.price * rule.quantity) / ((100 + rule.btw) / 100);
      }
    }
    invoiceGroup.trips[i].total = total;
    invoiceGroup.trips[i].btw = btw;
  }

})

;
