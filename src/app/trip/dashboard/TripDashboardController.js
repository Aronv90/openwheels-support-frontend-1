'use strict';

angular.module('openwheels.trip.dashboard', [])

.controller('TripDashboardController', function ($scope, booking, contract, invoice2Service, $q, voucherService, $mdDialog, authService, remarkService) {
  $scope.booking = booking;
  $scope.contract = contract;

  var invoicesRenterReceived = invoice2Service.getReceived({person: booking.person.id, booking: booking.id});
  var invoicesRenterSent = invoice2Service.getSent({person: booking.person.id, booking: booking.id});

  var invoicesOwnerReceived = invoice2Service.getReceived({person: booking.resource.owner.id, booking: booking.id});
  var invoicesOwnerSent = invoice2Service.getSent({person: booking.resource.owner.id, booking: booking.id});

  var requiredCredit = voucherService.calculateRequiredCredit({person: booking.person.id });

  $q.all({renterReceived: invoicesRenterReceived, renterSent: invoicesRenterSent, ownerReceived: invoicesOwnerReceived, ownerSent: invoicesOwnerSent, requiredCredit: requiredCredit})
  .then(function(res) {

    var markSent = function(invoice) {
      invoice.invoiceLines = _.map(invoice.invoiceLines, function(invoiceLine) {
        invoiceLine.relationType = 'sent';
        invoiceLine.invoice = invoice;
        invoiceLine.invoice.groupId = invoiceLine.invoice.senderInvoiceGroup ? invoiceLine.invoice.senderInvoiceGroup.id : undefined;
        return invoiceLine;
      });
      return invoice;
    };
    var markReceived = function(invoice) {
      invoice.invoiceLines = _.map(invoice.invoiceLines, function(invoiceLine) {
        invoiceLine.relationType = 'received';
        invoiceLine.invoice = invoice;
        invoiceLine.invoice.groupId = invoiceLine.invoice.recipientInvoiceGroup ? invoiceLine.invoice.recipientInvoiceGroup.id: undefined;
        return invoiceLine;
      });
      return invoice;
    };


    res.ownerSent = _.map(res.ownerSent, markSent);
    res.ownerReceived = _.map(res.ownerReceived, markReceived);
    res.renterSent = _.map(res.renterSent, markSent);
    res.renterReceived = _.map(res.renterReceived, markReceived);

    var merged = {owner: [], renter: []};
    merged.owner = merged.owner.concat(res.ownerSent, res.ownerReceived);
    merged.renter = merged.renter.concat(res.renterSent, res.renterReceived);

    merged.owner = _.sortBy(_.flatten(_.pluck(merged.owner, 'invoiceLines')), 'position');
    merged.renter = _.sortBy(_.flatten(_.pluck(merged.renter, 'invoiceLines')), 'position');

    return merged;
  })
  .then(function(res) {
    $scope.invoicesOwner = res.owner;
    $scope.invoicesRenter = res.renter;
    return res;
  })
  ;

  /* CHAT */
  
  function resetChatScope() {
    $scope.chat = {
      date: undefined,
      message: undefined,
    };
  }

  function initRemarksScope() {
    remarkService.forBooking({booking: booking.id})
    .then(function(res) {
      $scope.remarks = res;
    })
    ;
  }

  function initLoadingScope() {
    $scope.chat.loading = {
      driver: false,
      owner: false,
      message: false
    };
  }

  resetChatScope();
  initRemarksScope();
  initLoadingScope();

  $scope.sendChat = function() {
    if($scope.chat.date) {
      $scope.chat.date = moment($scope.chat.date).format('YYYY-MM-DD HH:mm');
    }
    $scope.chat.loading.message = true;
    remarkService.add({booking: booking.id, message: $scope.chat.message, type: 'custom', followUp: $scope.chat.date})
    .then(function(res) {
      resetChatScope();
      $scope.remarks.unshift(res);
    })
    .finally(function() {
      $scope.chat.loading.message = false;
    })
    ;
  };

  $scope.openDatepickerDialog = function() {
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'selectedDay', function($scope, $mdDialog, selectedDay) {

        if(!selectedDay) {
          $scope.selectedDay = new Date();
        } else {
          $scope.selectedDay = selectedDay;
        }

        $scope.done = function() {
          $mdDialog.hide($scope.selectedDay);
        };
        $scope.cancel = $mdDialog.cancel;

        $scope.today = new Date();
        $scope.onlyWeekPredicate = function(date) {
          var day = date.getDay();
          return day > 0 && day < 6;
        };
      }],
      templateUrl: 'trip/dashboard/datepicker.tpl.html',
      parent: angular.element(document.body),
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        selectedDay: $scope.chat.date
      },
    })
    .then(function(res) {
      $scope.chat.date = res;
      console.log(res);
    })
    .catch(window.plog)
    ;
  };

  $scope.openTextEditorDialog = function() {
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'text', function($scope, $mdDialog, text) {

        if(text) {
          $scope.text = text;
        }

        $scope.done = function() {
          $mdDialog.hide($scope.text);
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/textEditor.tpl.html',
      parent: angular.element(document.body),
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        text: $scope.chat.message
      },
    })
    .then(function(msg) {
      if(!msg) {
        return;
      }

      msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1 $2');
      $scope.chat.message = msg;
    })
    .catch(window.plog)
    ;
  };
})
;
