'use strict';

angular.module('openwheels.trip.dashboard', [])
.config(function($mdDateLocaleProvider) {
  $mdDateLocaleProvider.firstDayOfWeek = 1;
  $mdDateLocaleProvider.formatDate = function(date) {
    return moment(date).format('YYYY-MM-DD');
  };
})
.directive('owmSelectOnFocus', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.bind('focus', function () {
        if ('selectionStart' in this) {
          this.selectionStart = 0;
          this.selectionEnd = 9999;
        } else {
          this.select();
        }
      });
    }
  };
})
.controller('TripDashboardController', function ($scope, booking, contract, paymentService, personService, invoice2Service, $q, revisionsService, contractService, chipcardService, settingsService, FRONT_RENT, voucherService, $mdDialog, authService, remarkService, alertService, declarationService, bookingService, $window, API_DATE_FORMAT, resourceService, discountUsageService, discountService, boardcomputerService, driverContracts, $state, $timeout, localStorageService, ccomeService) {

  /* INIT  */
  $scope.booking = booking;
  $scope.contract = contract;
  $scope.driverContracts = driverContracts;
  $scope.declarations = [];
  $scope.friends = [];
  $scope.remarks = [];
  $scope.extraPersons = [];

  var lastTrips = localStorageService.get('dashboard.last_trips');
  if(lastTrips === null || lastTrips === undefined || lastTrips.length === undefined) {
    lastTrips = [];
  }
  lastTrips.unshift(booking);
  lastTrips = _.uniq(lastTrips, function(booking) { return booking.id; });
  if(lastTrips.length > 10) {
    lastTrips = lastTrips.slice(0, 10);
  }
  localStorageService.set('dashboard.last_trips', lastTrips);


  if(contract.type.id === 60) {
    bookingService.driversForBooking({booking: booking.id})
    .then(function(res) {
      $scope.extraPersons = res;
    });

    $scope.removeDriver = function(bookingId, personEmail) {
      bookingService.removeDriver({booking: bookingId, email: personEmail})
      .then(function(res) {
        $scope.extraPersons = res;
      });
    };
  } else {
    contractService.get({contract: contract.id})
    .then(function(res) {
      $scope.extraPersons = res.persons;
    });
  }

  /*
  // niet langer nodig
  if(booking.resource.isAvailableFriends) {
    resourceService.getMembers({resource: booking.resource.id})
    .then(function(res) {
      $scope.friends = res;
      $scope.isFriend = _.findWhere(res, {id: booking.person.id}) !== undefined;
    });
  }
  */

  voucherService.calculateRequiredCredit({person: booking.person.id})
  .then(function(res) {
    $scope.requiredCredit = res;
  });

  /*
  // niet langer nodig
  voucherService.calculateRequiredCredit({person: booking.resource.owner.id})
  .then(function(res) {
    $scope.requiredCreditOwn = res;
  });
  */


  /* Section support */
  var sections = {};

  $scope.open = function(id) {
    if(sections[id]) {
      sections[id].open = !sections[id].open;
    } else {
      sections[id] = {loading: true, open: false};
      return loadSection(id)
      .then(function(res) {
        sections[id].open = true;
      })
      .finally(function() {
        sections[id].loading = false;
      });
    }
  };
  $scope.open(7);

  $scope.isOpen = function(id) {
    if(sections[id]) {
      return sections[id].open;
    }
    return false;
  };

  $scope.isLoading = function(id) {
    if(sections[id]) {
      return sections[id].loading;
    }
    return false;
  };

  function loadSection(id) {
    // id 1 and 2 share an init function, and this function needs to be called just once
    if(id === 1 || id === 2) {
      if(!initInvoicesRun) {
        return initInvoices();
      }
      return $q.when(true);
    }
    if(id === 3) {
      return initDeclarationScope();
    }
    if(id === 4) {
      return initDiscountScope();
    }
    if(id === 5) {
      return initRevisionsScope();
    }
    if(id === 6) {
      return initNextBookingsScope();
    }
    if(id === 7) {
      return initRemarksScope();
    }

  }

  function initDeclarationScope() {
    if($scope.contract.type.canHaveDeclaration) {
      return declarationService.forBooking({booking: booking.id})
      .then(function(res) {
        $scope.declarations = res;
      })
      ;
    } else {
      return $q.when(true);
    }
  }

  function initDiscountScope() {
    return discountUsageService.search({booking: booking.id})
    .then(function(discountCodes) {
      $scope.discountCodes = discountCodes;
    });
  }

  function initRevisionsScope() {
    return revisionsService.revisions({
      id   : booking.id,
      type : 'OpenWheels\\ApiBundle\\Entity\\Booking'
    })
    .then(function (bookingRevisions) {
      $scope.revisions = bookingRevisions;
      revisionsService.revisions({
        id   : booking.id,
        type : 'OpenWheels\\ApiBundle\\Entity\\Trip'
      })
      .then(function (tripRevisions) {
        for (var i=0; i<tripRevisions.length; i++){
            $scope.revisions.push(tripRevisions[i]);
        }
      });
    });
  }

  function initNextBookingsScope() {
    $scope.now = moment().format('YYYY-MM-DD HH:mm');
    return bookingService.nextInResource({
      resource: booking.resource.id,
      limit: 3
    })
    .then(function(bookings) {
      $scope.nextBookings = bookings;
    });
  }

  $scope.openDeclaration = function(declaration) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'declaration', function($scope, $mdDialog, declaration) {
        $scope.declaration = declaration;
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/singleDeclaration.tpl.html',
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        declaration: declaration
      }
    })
    .then(function(res) {
    })
    ;
  };

  $scope.openPayouts = function(person) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'payouts', 'voucherService', 'alertService', 'paymentService', 'person', function($scope, $mdDialog, payouts, voucherService, alertService, paymentService, person) {
        $scope.payouts = payouts;
        $scope.cancel = $mdDialog.cancel;
        $scope.processPayout = function (payout) {
          alertService.load();
          paymentService.processPayout({ payout: payout.id }).then(function (result) {
            alertService.add('success', 'Ok', 5000);

            /* update changes in $scope */
            angular.extend(payout, result);

          })
          .catch(alertService.addError)
          .finally(alertService.loaded);
        };

        $scope.deletePayout = function (payout) {
          alertService.load();
          paymentService.deletePayout({ payout: payout.id }).then(function (result) {
            alertService.add('success', 'Ok', 5000);

            /* update changes in $scope */
            var index = payouts.indexOf(payout);
            if (index >= 0) {
              payouts.splice(index, 1);
            }

          })
          .catch(alertService.addError)
          .finally(alertService.loaded);
        };
      }],
      templateUrl: 'trip/dashboard/payouts.tpl.html',
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        person: person
      },
      resolve: {
        payouts: function() {
          return voucherService.search({person: person.id, minValue: 0})
          .then(function(res) {
            return res;
          });
        },
      },
    })
    .then(function(res) {
    })
    .catch(function(err) {
    })
    ;
  };

  $scope.openVouchers = function(person) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'vouchers', 'voucherService', 'alertService', 'paymentService', 'person', function($scope, $mdDialog, vouchers, voucherService, alertService, paymentService, person) {
        $scope.vouchers = vouchers;
        $scope.cancel = $mdDialog.cancel;
        $scope.deleteVoucher = function (voucher) {
          voucherService.deleteVoucher({ voucher: voucher.id })
          .then(function (result) {
            alertService.add('success', 'Ok', 5000);

            /* update changes in $scope */
            var index = $scope.vouchers.indexOf(voucher);
            if (index >= 0) {
              $scope.vouchers.splice(index, 1);
            }

          })
          .catch(alertService.addError)
          .finally(alertService.loaded);
        };

        function getVouchers () {
          $scope.vouchers = null;
          var promise = voucherService.search({ person: person.id, minValue: 0 });
          promise.then(function (vouchers) {
            $scope.vouchers = vouchers;
          })
          .catch(function (err) {
            $scope.vouchers = [];
          });
          return promise;
        }

        $scope.payoutVoucher = function (voucher) {
          paymentService.payoutVoucher({ voucher: voucher.id })
          .then(function (result) {
            return getVouchers();
          })
          .catch(alertService.addError)
          .finally(alertService.loaded);
        };
        $scope.deletePayments = function(voucher) {
          voucherService.removePayments({ voucher: voucher.id })
          .then(function (result) {
            alertService.add('success', 'Ok', 5000);
            voucher.payments = result.payments;
            voucher.value = result.value;

          })
          .catch(alertService.addError)
          .finally(alertService.loaded);
        };

      }],
      templateUrl: 'trip/dashboard/vouchers.tpl.html',
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        person: person
      },
      resolve: {
        vouchers: function() {
          return voucherService.search({person: person.id, minValue: 0})
          .then(function(res) {
            return res;
          });
        },
      },
    })
    .then(function(res) {
    })
    .catch(function(err) {
    })
    ;
  };

  $scope.loginAs = function(person) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'person', 'settingsService', 'FRONT_DASHBOARD', 'FRONT_SWITCHUSER', function($scope, $mdDialog, person, settingsService, FRONT_DASHBOARD, FRONT_SWITCHUSER) {
        $scope.person = person;
        $scope.frontDashboard = settingsService.settings.server + FRONT_DASHBOARD + FRONT_SWITCHUSER;

        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/loginAs.tpl.html',
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        person: person
      }
    })
    .then(function(res) {
    })
    ;
  };

  $scope.switchContract = function(declaration) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'driverContracts', 'contract', function($scope, $mdDialog, driverContracts, contract) {
        $scope.driverContracts = driverContracts;
        $scope.origId = contract.id;
        $scope.newContract = {
          id: contract.id,
        };
        $scope.cancel = $mdDialog.cancel;
        $scope.done = function() {
          $mdDialog.hide($scope.newContract);
        };
      }],
      templateUrl: 'trip/dashboard/contractSwitch.tpl.html',
      fullscreen: false,
      clickOutsideToClose: true,
      locals: {
        driverContracts: driverContracts,
        contract: contract,
      }
    })
    .then(function(res) {
      return bookingService.alter({booking: booking.id, newProps: {contract: res.id}});
    })
    .then(function(res) {
      $scope.booking = res;
      $state.reload();
      return alertService.add('success', 'Contract aangepast', 6000);
    })
    .catch(function(err) {
      if(err && err.message) {
        return alertService.add('danger', err.message, 6000);
      }
    })
    ;
  };

  $scope.openDiscount = function(discount) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'discount', function($scope, $mdDialog, discount) {
        $scope.discount = discount.discount;
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/singleDiscountCode.tpl.html',
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        discount: discount
      }
    })
    .then(function(res) {
    })
    ;
  };

  var initInvoicesRun = false;
  function initInvoices() {
    initInvoicesRun = true;
    var invoicesRenterReceived = invoice2Service.getReceived({person: booking.person.id, booking: booking.id});
    var invoicesRenterSent = invoice2Service.getSent({person: booking.person.id, booking: booking.id});

    var invoicesOwnerReceived = invoice2Service.getReceived({person: booking.resource.owner.id, booking: booking.id});
    var invoicesOwnerSent = invoice2Service.getSent({person: booking.resource.owner.id, booking: booking.id});


    return $q.all({renterReceived: invoicesRenterReceived, renterSent: invoicesRenterSent, ownerReceived: invoicesOwnerReceived, ownerSent: invoicesOwnerSent})
    .then(function(res) {

      var markSent = function(invoice) {
        invoice.invoiceLines = _.map(invoice.invoiceLines, function(invoiceLine) {
          invoiceLine.relationType = 'sent';
          invoiceLine.invoice = invoice;
          invoiceLine.invoice.groupId = invoiceLine.invoice.senderInvoiceGroup ? invoiceLine.invoice.senderInvoiceGroup.id : undefined;
          invoiceLine.invoice.group = invoiceLine.invoice.senderInvoiceGroup ? invoiceLine.invoice.senderInvoiceGroup : undefined;
          return invoiceLine;
        });
        return invoice;
      };
      var markReceived = function(invoice) {
        invoice.invoiceLines = _.map(invoice.invoiceLines, function(invoiceLine) {
          invoiceLine.relationType = 'received';
          invoiceLine.invoice = invoice;
          invoiceLine.invoice.groupId = invoiceLine.invoice.recipientInvoiceGroup ? invoiceLine.invoice.recipientInvoiceGroup.id: undefined;
          invoiceLine.invoice.group = invoiceLine.invoice.recipientInvoiceGroup ? invoiceLine.invoice.recipientInvoiceGroup: undefined;
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
  }

  $scope.addDeclaration = function() {
    $window.scrollTo(0, 0);
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
    $window.scrollTo(0, 0);
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

  $scope.changeEndTime = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        var originalEnd = moment(booking.endBooking, API_DATE_FORMAT);

        $scope.newDt = {};
        $scope.newDt.date = new Date(originalEnd);
        $scope.newDt.time = originalEnd.format('HH:mm');
        $scope.times = generateTimes();

        $scope.tripIsNow = moment().isAfter(moment(booking.beginBooking, API_DATE_FORMAT)) && moment().isBefore(moment(booking.endBooking, API_DATE_FORMAT));
        $scope.tripHasEnded = moment().isAfter(moment(booking.endBooking, API_DATE_FORMAT));

        $scope.change = function() {
          var newDate = moment(makeNewDateString(), API_DATE_FORMAT);

          if(newDate.isBefore(originalEnd)) {
            $scope.warning = 'Nieuwe eindtijd is eerder dan de oorspronkelijke eindtijd, dat is niet mogelijk.';
          } else {
            $scope.warning = undefined;
          }
        };

        function makeNewDateString() {
          var date = moment($scope.newDt.date);
          return date.format('YYYY-MM-DD ') + $scope.newDt.time;
        }

        $scope.done = function() {
          $mdDialog.hide(makeNewDateString());
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/changeEndTime.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking
      }
    })
    .then(function(res) {
        return bookingService.alterRequest(
          {
            booking: booking.id,
            remark: booking.remarkRequest,
            timeFrame: {
              startDate: booking.beginBooking,
              endDate: res
            },
          }
        )
        .then(function(booking) {
          $scope.booking.endBooking = booking.endBooking;
          $scope.booking.status = booking.status;
        });
      // }
    })
    .then(function(booking) {
      return alertService.add('success', 'Rit is verlengd.', 5000);
    })
    .catch(function(err) {
      if(err && err.message) {
        if(err.message.match('onvoldoende')) {
          alertService.add('danger', err.message + '. De huurder heeft nog ' + err.data.extra_credit + ' euro extra rijtegoed nodig voordat de boeking verlengd kan worden.', 7000);
        } else if (err.message.match('kilometers van de rit zijn al ingevuld')) {
          alertService.add('danger', 'De rit kon niet verlengd worden: de rit is een uur na de eindtijd automatisch afgesloten. Maak een nieuwe reservering voor deze huurder via de knop [Boeken].', 7000);
        } else {
          alertService.add('danger', 'De rit kon niet verlengd worden: ' + err.message, 5000);
        }
      }
    })
    ;
  };

  $scope.changeBeginTime = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        var originalBegin = moment(booking.beginBooking, API_DATE_FORMAT);

        $scope.newDt = {};
        $scope.newDt.date = new Date(originalBegin);
        $scope.newDt.time = originalBegin.format('HH:mm');
        $scope.times = generateTimes();

        $scope.tripIsNow = moment().isAfter(moment(booking.beginBooking, API_DATE_FORMAT)) && moment().isBefore(moment(booking.endBooking, API_DATE_FORMAT));
        $scope.tripHasEnded = moment().isAfter(moment(booking.endBooking, API_DATE_FORMAT));

        function makeNewDateString() {
          var date = moment($scope.newDt.date);
          return date.format('YYYY-MM-DD ') + $scope.newDt.time;
        }

        $scope.done = function() {
          $mdDialog.hide(makeNewDateString());
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/changeBeginTime.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking
      }
    })
    .then(function(res) {
        return bookingService.alterRequest(
          {
            booking: booking.id,
            remark: booking.remarkRequest,
            timeFrame: {
              startDate: res,
              endDate: booking.endBooking
            },
          }
        )
        .then(function(booking) {
          $scope.booking.beginBooking = booking.beginBooking;
          $scope.booking.status = booking.status;
        });
      // }
    })
    .then(function(booking) {
      return alertService.add('success', 'De begintijd is aangepast.', 5000);
    })
    .catch(function(err) {
      if(err && err.message) {
        alertService.add('danger', 'De begintijd kon niet aangepast worden: ' + err.message, 5000);
      }
    })
    ;
  };

  $scope.stop = function() {
    var confirm = $mdDialog.confirm()
    .title('Rit inkorten')
    .textContent('Weet je zeker dat je deze rit wil inkorten?')
    .ok('Ja')
    .cancel('Nee');

    $mdDialog.show(confirm)
    .then(function(res) {
      bookingService.stop({booking: $scope.booking.id})
      .then(function(booking) {
        $scope.booking.endBooking = booking.endBooking;
        return alertService.add('success', 'De rit is ingekort.', 5000);
      })
      .catch(function(err) {
        return alertService.add('danger', 'De rit kon niet ingekort worden: ' + err.message, 5000);
      });
    })
    ;
  };

  $scope.cancel = function() {
    var confirm = $mdDialog.confirm()
    .title('Rit annuleren')
    .textContent('Weet je zeker dat je deze rit wil annuleren?')
    .ok('Ja')
    .cancel('Nee');

    $mdDialog.show(confirm)
    .then(function(res) {
      bookingService.cancel({booking: $scope.booking.id})
      .then(function(booking) {
        $scope.booking.status = booking.status;
        return alertService.add('success', 'De rit is geannuleerd.', 5000);
      })
      .catch(function(err) {
        return alertService.add('danger', 'De rit kon niet geannuleerd worden: ' + err.message, 5000);
      });
    })
    ;
  };

  $scope.accept = function() {
    var confirm = $mdDialog.confirm()
    .title('Rit accepteren')
    .textContent('Weet je zeker dat je deze rit wil accepteren?')
    .ok('Ja')
    .cancel('Nee');

    $mdDialog.show(confirm)
    .then(function(res) {
      bookingService.acceptRequest({booking: $scope.booking.id})
      .then(function(booking) {
        $scope.booking = booking;
        return alertService.add('success', 'De rit is geaccepteerd.', 5000);
      })
      .catch(function(err) {
        return alertService.add('danger', 'De rit kon niet geaccepteerd worden: ' + err.message, 5000);
      });
    })
    ;
  };

  $scope.reject = function() {
    var confirm = $mdDialog.confirm()
    .title('Rit afwijzen')
    .textContent('Weet je zeker dat je deze rit wil afwijzen?')
    .ok('Ja')
    .cancel('Nee');

    $mdDialog.show(confirm)
    .then(function(res) {
      bookingService.rejectRequest({booking: $scope.booking.id})
      .then(function(booking) {
        $scope.booking = booking;
        return alertService.add('success', 'De rit is afgewezen.', 5000);
      })
      .catch(function(err) {
        return alertService.add('danger', 'De rit kon niet afgewezen worden: ' + err.message, 5000);
      });
    })
    ;
  };

  $scope.mailAgreement = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.agreement = {toDriver: true, toOwner: false, toMe: false, booking: booking.id};
        $scope.done = function() {
          $mdDialog.hide($scope.agreement);
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/agreement.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking
      }
    })
    .then(function(res) {
      return bookingService.mailAgreement(res);
    })
    .then(function(res) {
      return alertService.add('success', 'Email(s) zijn verstuurd', 6000);
    })
    .catch(function(err) {
      if(err && err.message) {
        alertService.add('danger', 'De email(s) kosnten niet verstuurd worden: ' + err.message, 5000);
      }
    })
    ;
  };

  $scope.notifyDamage = function() {
    $window.scrollTo(0, 0);
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
    if(!$scope.chat) {
      $scope.chat = {};
    }
    $scope.chat.date = undefined;
    $scope.chat.message = undefined;
  }

  function initRemarksScope() {
    return remarkService.forBooking({booking: booking.id})
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
    $window.scrollTo(0, 0);
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
    })
    ;
  };

  $scope.applyDiscount = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.discount = {discount: '', booking: booking.id};

        $scope.done = function() {
          $mdDialog.hide($scope.discount);
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/discountCode.tpl.html',
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        booking: booking,
      },
    })
    .then(function(res) {
      return discountService.apply(res);
    })
    .then(function(res) {
      $scope.discountCodes.unshift(res);
      return alertService.add('success', 'Kortingscode toegevoegd', 6000);
    })
    .catch(function(err) {
      if(err && err.message) {
        return alertService.add('danger', err.message, 6000);
      }
    })
    ;
  };

  $scope.resendBoardcomputer = function() {
    var confirm = $mdDialog.confirm()
    .title('Wil je de boeking opnieuw naar de boordcomputer verzenden?')
    .textContent('Weet je zeker dat je deze boeking opnieuw naar de boordcomputer wilt laten verzenden?')
    .ok('Ja')
    .cancel('Nee');

    $mdDialog.show(confirm)
    .then(function(res) {
      return ccomeService.sendBooking({booking: $scope.booking.id})
      .then(function(res) {
        alertService.add('success', 'De boeking is naar de boordcomputer verstuurd.', 5000);
      })
      .catch(function(err) {
        alertService.add('warning', 'De boeking kon niet naar de boordcomputer verstuurd worden: ' + err.message, 5000);
      });
    });
  };

  $scope.openResource = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;
        $scope.ccomeColor = [];
        $scope.now = moment().format('YYYY-MM-DD HH:mm');

        $scope.myfms = function() {
          boardcomputerService.control({
            action: 'OpenDoorStartEnable',
            resource: $scope.booking.resource.id
          })
          .then(function(res) {
            return alertService.add('success', 'De auto wordt geopend.', 5000);
          })
          .catch(function(err) {
            if(err && err.message) {
              alertService.add('warning', 'De auto kon niet geopend worden: ' + err.message, 5000);
            }
          });
        };

        $scope.ccome = function() {
          ccomeService.sendBooking({booking: $scope.booking.id})
          .then(function(res) {
            alertService.add('success', 'De boeking is naar de boordcomputer verstuurd.', 5000);
          })
          .catch(function(err) {
            alertService.add('warning', 'De boeking kon niet naar de boordcomputer verstuurd worden: ' + err.message, 5000);
          });
        };

        $scope.done = function() {
          $mdDialog.hide($scope.ccomeColor);
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/open.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking
      }
    })
    .then(function(res) {
      return boardcomputerService.control({
        action: 'OpenDoorStartEnable',
        resource: $scope.booking.resource.id,
        booking: $scope.booking.id
      })
      .then(function(res) {
        return alertService.add('success', 'De auto wordt geopend.', 5000);
      })
      .catch(function(err) {
        if(err && err.message) {
          alertService.add('warning', 'De auto kon niet geopend worden: ' + err.message, 5000);
        }
      });
    });
  };

  $scope.close = function() {
    var confirm = $mdDialog.confirm()
    .title('Wil je de auto afsluiten?')
    .textContent('Weet je zeker dat je deze auto wil afsluiten? Zorg dat de sleutel weer in de auto ligt, de deuren dicht zijn en de verlichting (ook de binnenverlichting) uit is. Vraag de huurder om te controleren of de auto op slot is.')
    .ok('Ja')
    .cancel('Nee');

    $mdDialog.show(confirm)
    .then(function(res) {
      return boardcomputerService.control({
        action: 'CloseDoorStartDisable',
        resource: $scope.booking.resource.id,
        booking: $scope.booking.id
      })
      .then(function(res) {
        return alertService.add('success', 'De auto wordt gesloten.', 5000);
      })
      .catch(function(err) {
        if(err && err.message) {
          alertService.add('warning', 'De auto kon niet gesloten worden', 5000);
        }
      });
    });
  };

  $scope.chip = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {

        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/chip.tpl.html',
      clickOutsideToClose:true, 
      locals: {
        booking: booking
      }
    })
    .then(function(res) {
      return chipcardService.createFish({
        person: booking.person.id
      })
      .then(function(chip) {
        ccomeService.sendBooking({booking: $scope.booking.id})
        .then(function(ccome) {
          return alertService.add('success', 'Er is een nieuwe pincode verstuurd, de pincode is ' +chip.pincode, 15000);
        })
        .catch(function(err) {
          if(err && err.message) {
            alertService.add('warning', 'Er kon helaas geen nieuwe pincode verstuurd worden', 5000);
          }
        });
      });
    });
  };

  $scope.start = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;
        $scope.startProblems = [];
        $scope.now = moment().format('YYYY-MM-DD HH:mm');

        chipcardService.getFish({person: $scope.booking.person.id})
        .then(function(fish) {
          $scope.fish = fish;
        });

        $scope.ccome = function() {
          ccomeService.sendBooking({booking: $scope.booking.id})
          .then(function(res) {
            alertService.add('success', 'De boeking is naar de boordcomputer verstuurd.', 5000);
          })
          .catch(function(err) {
            alertService.add('warning', 'De boeking kon niet naar de boordcomputer verstuurd worden: ' + err.message, 5000);
          });
        };

        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/start.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking
      }
    })
    .then(function(res) {
      return boardcomputerService.control({
        action: 'OpenDoorStartEnable',
        resource: $scope.booking.resource.id,
        booking: $scope.booking.id
      })
      .then(function(res) {
        return alertService.add('success', 'De auto wordt geopend.', 5000);
      })
      .catch(function(err) {
        if(err && err.message) {
          alertService.add('warning', 'De auto kon niet geopend worden', 5000);
        }
      });
    });
  };

  $scope.bookOtherResource = function(selectedBooking) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
        $scope.booking = selectedBooking;
        $scope.now = moment().format('YYYY-MM-DD HH:mm');
        $scope.contract = {};

        personService.get({person: selectedBooking.person.id})
        .then(function(personGet) {
          $scope.personGet = personGet;
        });

        resourceService.searchV3({
          person: $scope.booking.person.id,
          timeFrame: { 
            startDate: $scope.booking.beginBooking, 
            endDate: $scope.booking.endBooking 
          },
          radius: 10000,
          sort: 'relevance',
          offest: 0,
          maxresults: 15, 
          filters: {
            smartwheels: $scope.booking.resource.boardcomputer ? true : null
          },
          location: {
            latitude: $scope.booking.resource.latitude,
            longitude: $scope.booking.resource.longitude
          }
        })
        .then(function(resources) {
          $scope.availableResources = resources.results;
        });

        $scope.bookResource = function(booking, resource) {
          bookingService.cancel({booking: booking.id})
          .then(function(booking) {
            $scope.now = moment().format('YYYY-MM-DD HH:mm');
            bookingService.create({
              resource: resource.id,
              person: booking.person.id,
              timeFrame: { 
                startDate: booking.beginBooking < $scope.now ? $scope.now : booking.beginBooking, 
                endDate: booking.endBooking
              },
              contract: booking.contract.id,
              remark: booking.remark,
              riskReduction: booking.riskReduction
            })
            .then(function(newBooking) {
              if(booking.approved === 'OK') {
                bookingService.approve({booking: newBooking.id})
                .then(function(newBooking) {
                  $mdDialog.cancel();
                  alertService.add('success', 'De boeking is gemaakt.', 5000);
                  $state.go('root.trip.dashboard', {tripId: newBooking.id});
                });
              } else {
                $mdDialog.cancel();
                alertService.add('success', 'De boeking is gemaakt.', 5000);
                $state.go('root.trip.dashboard', {tripId: newBooking.id});
              }
            })
            .catch(function(err) {
              alertService.add('warning', 'De boeking kon niet gemaakt worden: ' + err.message, 5000);
            });
          });
        };

        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/bookOtherResource.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking
      }
    });
  };

  $scope.showPhoneNumbers = function(person) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {

        personService.get({person: person.id})
        .then(function(person) {
          $scope.person = person;
        });

        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/showPhoneNumber.tpl.html',
      fullscreen: false,
      clickOutsideToClose:true
    });
  };

  $scope.book = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;
        $scope.bookForPerson = undefined;
        $scope.now = moment().format('YYYY-MM-DD HH:mm');
        $scope.contract = {};

        $scope.loadAvailableResources = function(resource) {
          resourceService.searchV3({
            person: $scope.booking.person.id,
            timeFrame: { 
              startDate: $scope.booking.beginBooking, 
              endDate: $scope.booking.endBooking 
            },
            radius: 10000,
            sort: 'relevance',
            offest: 0,
            maxresults: 15, 
            filters: {
              smartwheels: $scope.booking.resource.boardcomputer ? true : null
            },
            location: {
              latitude: $scope.booking.resource.latitude,
              longitude: $scope.booking.resource.longitude
            }
          })
          .then(function(resources) {
            $scope.availableResources = resources.results;
          });
        };

        $scope.loadContracts = function() {
          contractService.forDriver({person: $scope.booking.resource.owner.id})
          .then(function(contracts) {
            $scope.ownerContracts = contracts;
          });
        };

        $scope.bookOtherResource = function(resource) {
          bookingService.cancel({booking: $scope.booking.id})
          .then(function(booking) {
            bookingService.create({
              resource: resource.id,
              person: $scope.booking.person.id,
              timeFrame: { 
                startDate: $scope.booking.beginBooking < $scope.now ? $scope.now : $scope.booking.beginBooking, 
                endDate: $scope.booking.endBooking
              },
              contract: $scope.booking.contract.id,
              remark: $scope.booking.remark,
              riskReduction: $scope.booking.riskReduction
            })
            .then(function(booking) {
              if($scope.booking.approved === 'OK') {
                bookingService.approve({booking: booking.id})
                .then(function(booking) {
                  $mdDialog.cancel();
                  alertService.add('success', 'De boeking is gemaakt.', 5000);
                  $state.go('root.trip.dashboard', {tripId: booking.id});
                });
              } else {
                $mdDialog.cancel();
                alertService.add('success', 'De boeking is gemaakt.', 5000);
                $state.go('root.trip.dashboard', {tripId: booking.id});
              }
            })
            .catch(function(err) {
              alertService.add('warning', 'De boeking kon niet gemaakt worden: ' + err.message, 5000);
            });
          });
        };

        $scope.newBeginDt = {};
        $scope.newBeginDt.date = new Date();
        $scope.newBeginDt.time = {};
        $scope.newEndDt = {};
        $scope.newEndDt.date = new Date();
        $scope.newEndDt.time = {};
        $scope.times = generateTimes();

        function makeNewDateString(date) {
          var newDate = moment(date.date);
          return newDate.format('YYYY-MM-DD ') + date.time;
        }

        $scope.done = function() {
          $mdDialog.hide({
            bookForPerson: $scope.bookForPerson,
            newBeginDt: makeNewDateString($scope.newBeginDt),
            newEndDt: makeNewDateString($scope.newEndDt),
            contract: $scope.contract.id,
            booking: $scope.booking
          });
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/book.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking
      }
    })
    .then(function(res) {
      if (res.bookForPerson === 'blockResource') {
        bookingService.create({
          resource: res.booking.resource.id,
          person: res.booking.resource.owner.id,
          timeFrame: { 
            startDate: res.newBeginDt, 
            endDate: res.newEndDt
          },
          contract: res.contract
        })
        .then(function(booking) {
          $mdDialog.cancel();
          alertService.add('success', 'De boeking is gemaakt.', 5000);
          $state.go('root.trip.dashboard', {tripId: booking.id});
        })
        .catch(function(err) {
          alertService.add('warning', 'De boeking kon niet gemaakt worden: ' + err.message, 5000);
        });
      } else if (res.bookForPerson === 'sameResource') {
        bookingService.create({
          resource: res.booking.resource.id,
          person: res.booking.person.id,
          timeFrame: { 
            startDate: res.newBeginDt, 
            endDate: res.newEndDt
          },
          contract: res.booking.contract.id
        })
        .then(function(booking) {
          $mdDialog.cancel();
          alertService.add('success', 'De boeking is gemaakt.', 5000);
          $state.go('root.trip.dashboard', {tripId: booking.id});
        })
        .catch(function(err) {
          alertService.add('warning', 'De boeking kon niet gemaakt worden: ' + err.message, 5000);
        });
      }
    });
  };

  $scope.breakdown = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;
        
        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/breakdown.tpl.html',
      clickOutsideToClose:true, 
      locals: {
        booking: booking
      }
    });
  };

  $scope.damage = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;
        $scope.damageOptions = undefined;

        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/damageResource.tpl.html',
      clickOutsideToClose:true, 
      fullscreen: false,
      locals: {
        booking: booking
      }
    });
  };

  $scope.previousBooking = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;

        bookingService.previousInResource({
          resource: $scope.booking.resource.id,
          limit: 1
        })
        .then(function(bookings) {
          $scope.previousBookings = bookings;
          personService.get({person: bookings[0].person.id})
          .then(function(person) {
            $scope.person = person;
          });
        });

        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/previousBooking.tpl.html',
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        booking: booking
      },
    });
  };

  $scope.refundBooking = function() {
    var confirm = $mdDialog.confirm()
    .title('Rit restitueren')
    .textContent('Weet je zeker dat je deze rit wil restitueren?')
    .ok('Ja')
    .cancel('Nee');

    $mdDialog.show(confirm)
    .then(function(res) {      
      paymentService.refundBooking({ booking: $scope.booking.id })
      .catch(alertService.addError)
      .finally(alertService.loaded);
    });
  };

  $scope.resourceRemark = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;

        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/resourceRemark.tpl.html',
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        booking: booking
      },
    });
  };

  $scope.contractInfo = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', 'contract', function($scope, $mdDialog, contract) {
        $scope.contract = contract;
        
        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/contractInfo.tpl.html',
      fullscreen: false,
      clickOutsideToClose:true,
      locals: {
        contract: contract
      },
    });
  };

  $scope.openTextEditorDialog = function() {
    $window.scrollTo(0, 0);
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
    ;
  };

  function generateTimes() {
    var times = [];
    var hour = 0;
    while(hour <= 23) {
      var minute = 0;
      while(minute <= 55) {
        var hourDisplay = hour;
        var minuteDisplay = minute;
        if(('' + hour).length === 1) {
          hourDisplay = '0' + hour;
        }
        if(('' + minute).length === 1) {
          minuteDisplay = '0' + minute;
        }
        times.push({value: hourDisplay + ':' + minuteDisplay});
        minute = minute + 5;
      }
      hour = hour + 1;
    }
    return times;
  }

});
