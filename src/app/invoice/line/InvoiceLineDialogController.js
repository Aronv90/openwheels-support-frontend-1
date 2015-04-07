'use strict';

angular.module('openwheels.invoice.line.dialog', [])

.controller('InvoiceLineDialogController', function ($scope, $filter, $modalInstance, invoiceService, personService, invoiceLine, person) {

  $scope.invoiceLine = invoiceLine;
  $scope.btwOptions = [
    {label: '0%', value: 0},
    {label: '6%', value: 6},
    {label: '21%', value: 21}
  ];

  $scope.favoritePersonOptions = [{
    id: 282,
    firstName: 'MyWheels',
    surname: '(Wheels4All)'
  }, {
    id: 500550,
    firstName: 'Centraal Beheer',
    surname: 'Verzekering'
  }];

  $scope.favoritePersonOptions.push(person);

  /**
   * Typeahead Sender
   */
  $scope.searchPersons = function ($viewValue) {
    return personService.search({
      search: $viewValue
    });
  };

  $scope.ahead = {
    selectedSender: undefined,
    selectedReceiver: undefined
  };


  $scope.selectSender = function (item) {
    $scope.invoiceLine.senderId = item.id;
  };

  $scope.selectReceiver = function (item) {
    $scope.invoiceLine.receiverId = item.id;
  };

  $scope.formatPerson = function ($model) {
    var inputLabel = '';
    if ($model) {
      inputLabel = '[' + $model.id + '] ' + $filter('fullname')($model);
    }
    return inputLabel;
  };

  $scope.dismiss = function () {
    $modalInstance.dismiss();
  };

  $scope.save = function (invoiceLine) {
    if (invoiceLine.id) {
      invoiceService.alterInvoiceLine({
        invoiceRule: invoiceLine.id,
        person: person.id,
        newProps: {
          // sender/recipient werkt nog niet
          /*recipient: invoiceLine.receiverId,*/
          description: invoiceLine.description,
          price: invoiceLine.total,
          btw: invoiceLine.btwPercent
        }
      })
      .then(function () {
        $modalInstance.close(invoiceLine);
      });
    } else {
      invoiceService.createGeneric({
        'recipient_id': invoiceLine.receiverId,
        'sender_id': invoiceLine.senderId,
        description: invoiceLine.description,
        total: invoiceLine.total,
        btw: invoiceLine.btwPercent
      })
      .then(function (result) {
        $modalInstance.close(result);
      });
    }
  };

  $scope.$watch('invoiceLine.receiverId', function(newVal, oldVal) {
    if(newVal === oldVal) {
      return;
    }
    var isFavourite = $filter('getByProperty')('id', newVal, $scope.favoritePersonOptions);

    if(isFavourite) {
      $scope.ahead.selectedReceiver = isFavourite;
    }
  });

  $scope.$watch('invoiceLine.senderId', function(newVal, oldVal) {
    if(newVal === oldVal) {
      return;
    }
    var isFavourite = $filter('getByProperty')('id', newVal, $scope.favoritePersonOptions);

    if(isFavourite) {
      $scope.ahead.selectedSender = isFavourite;
    }
  });
})

;
