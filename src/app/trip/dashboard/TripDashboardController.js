'use strict';

angular.module('openwheels.trip.dashboard', [])

.controller('TripDashboardController', function ($scope, booking, contract, invoice2Service, $q, voucherService, $mdDialog, authService, remarkService, alertService, declarationService, bookingService) {

  /* INIT  */
  contract.supportsDeclarations = supportsDeclarations(contract);
  $scope.booking = booking;
  $scope.contract = contract;
  $scope.declarations = [];
  console.log(booking);

  function supportsDeclarations(contract) {
    if(contract.type.id === 60 || contract.type.id === 62 || contract.type.id === 50) {
      return true;
    }
    return false;
  }

  if($scope.contract.supportsDeclarations) {
    declarationService.forBooking({booking: booking.id})
    .then(function(res) {
      $scope.declarations = res;
      console.log(res);
    });
  }

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

   /* BUTTONS */
  $scope.addDeclaration = function() {
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', 'contract', function($scope, $mdDialog, booking) {
        $scope.declaration = {description: '', booking: booking.id};
        $scope.contract= contract;
        $scope.done = function() {
          $mdDialog.hide($scope.declaration);
        };
        $scope.cancel = $mdDialog.cancel;
        $scope.fileChanged = function(image) {
          $scope.declaration.image = image;
        };
      }],
      templateUrl: 'trip/dashboard/declaration.tpl.html',
      parent: angular.element(document.body),
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        booking: $scope.booking,
        contract: $scope.contract,
      }
    })
    .then(function(res) {
      var image = res.image;
      delete res.image;
      return declarationService.create(res, {image: image});
    })
    .then(function(res) {
      $scope.declarations.unshift(res);
      return alertService.add('success', 'Tankbon toegevoegd', 6000);
    })
    .catch(function(err) {
      if(err && err.message) {
        alertService.add('danger', err.message, 6000);
      }
    })
    ;
  };

  $scope.addKm = function() {
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.km = {booking: booking.id, odoBegin: booking.trip.odoBegin, odoEnd: booking.trip.odoEnd};
        $scope.done = function() {
          $mdDialog.hide($scope.km);
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/km.tpl.html',
      parent: angular.element(document.body),
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        booking: $scope.booking
      }
    })
    .then(function(res) {
      return bookingService.setTrip(res);
    })
    .then(function(res) {
      $scope.booking = res;
      return alertService.add('success', 'Kilometerstanden toegevoegd', 6000);
    })
    .catch(function(err) {
      if(err && err.message) {
        alertService.add('danger', err.message, 6000);
      }
    })
    ;
  };

  $scope.notifyDamage = function() {
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', 'contract', function($scope, $mdDialog, booking, contract) {
        $scope.damage = {booking: booking.id, notifyDriver: false, notifyOwner: false};
        $scope.booking = booking;
        $scope.contract = contract;
        $scope.age = moment().diff(booking.person.dateOfBirth, 'years');
        if(isNaN($scope.age)) {
          $scope.age = 'Onbekend';
        }
        $scope.done = function() {
          $mdDialog.hide($scope.damage);
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/damage.tpl.html',
      parent: angular.element(document.body),
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        booking: $scope.booking,
        contract: $scope.contract,
      }
    })
    .then(function(res) {
      console.log(res);
      return bookingService.addDamage(res);
    })
    .then(function(res) {
      return alertService.add('success', 'Schademails gestuurd', 6000);
    })
    .catch(function(err) {
      if(err && err.message) {
        alertService.add('danger', err.message, 6000);
      }
    })
    ;
  };


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
    .catch(function(err) {
      alertService.add('danger', err.message, 6000);
    })
    .finally(function() {
      $scope.chat.loading.message = false;
    })
    ;
  };

  $scope.sendCalled = function(type) {
    if(type === 'owner' || type === 'driver') {
      $scope.chat.loading[type] = true;
    } else {
      return;
    }

    remarkService.add({booking: booking.id, type: type + '_called'})
    .then(function(res) {
      $scope.remarks.unshift(res);
    })
    .catch(function(err) {
      alertService.add('danger', err.message, 6000);
    })
    .finally(function() {
      $scope.chat.loading[type] = false;
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
      // replace line endings with space
      msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1 $2');
      $scope.chat.message = msg;
    })
    .catch(window.plog)
    ;
  };
})
;
