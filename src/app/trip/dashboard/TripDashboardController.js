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
.controller('TripDashboardController', function ($scope, booking, contract, paymentService, personService,
  invoice2Service, $q, revisionsService, contractService, chipcardService, settingsService, FRONT_RENT,
  voucherService, $mdDialog, authService, remarkService, alertService, declarationService, bookingService,
  $window, API_DATE_FORMAT, resourceService, discountUsageService, discountService, boardcomputerService,
  deviceService,
  extraDriverService, $log, account2Service,
  driverContracts, $state, $timeout, localStorageService, ccomeService, damageService, $mdMedia,
  automate,
  checkIfImmobilized
) {

  /* INIT  */
  $scope.booking = booking;
  $scope.contract = contract;
  $scope.driverContracts = driverContracts;
  $scope.driverContracts.push({ id: 50076, contractorId: 282, type: {name: 'MyWheels Free'}, contractor: {firstName: 'MyWheels'} });
  $scope.declarations = [];
  $scope.friends = [];
  $scope.remarks = [];
  $scope.damages = [];
  $scope.extraPersons = [];
  $scope.now = moment().format('YYYY-MM-DD HH:mm');
  $scope.helyUser = $scope.booking.person.email.slice(-9) === '@hely.com';
  $scope.automaticGear = $scope.booking.resource.properties.map(function(o) { return o.id;}).indexOf('automaat') ? false : true;
  $scope.isApproved = false;

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

  $scope.getAccounts = function () {
    account2Service.search({
      person: $scope.booking.person.id, 
      unchecked: null
    })
    .then(function (accounts) {
      $scope.accounts = accounts;

      if($scope.accounts.length > 0) {
        accounts.every(function (elm) {
          $scope.accountName = elm.lastName;
          if (elm.approved === true) {
            $scope.isApproved = true;
            return false;
          } else {
            return true;
          }
        });
      }
    })
    .catch(function (e) {
      alertService.addError(e);
    })
    .finally(function() {
      console.log($scope.isApproved);
    });
  };

  if($scope.booking.approved !== 'OK') {
    $scope.getAccounts();
  }

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


  // new
  function unwrapResult (inviteRequests) {
    if (inviteRequests.result && _.isArray(inviteRequests.result)) {
      inviteRequests = inviteRequests.result;
    }
    return inviteRequests;
  }

  var inviteRequestsPromise = (contract.type.id === 60)  ?
    extraDriverService.driversForBooking({ booking: $scope.booking.id }) :
    extraDriverService.getRequestsForContract({ contract: $scope.contract.id, limit: 999 });

  $scope.loadingInviteRequests = true;

  inviteRequestsPromise
  .then(unwrapResult)
  .then(function (inviteRequests) {
    $scope.inviteRequests = inviteRequests;
    $scope.loadingInviteRequests = false;
  });

  $scope.removeInviteRequest = function (inviteRequest) {
    var removalPromise = (contract.type.id === 60)  ?
      extraDriverService.removeDriver({ booking: $scope.booking.id, email: inviteRequest.recipient.email }) :
      extraDriverService.removePersonFromContract({ contract: $scope.contract.id, person: inviteRequest.recipient.id });

    removalPromise
    .then(unwrapResult)
    .then(function (inviteRequests) {
      $scope.inviteRequests = inviteRequests;
    })
    .catch(function (e) {
      alertService.addError(e);
    });
  };

  voucherService.calculateRequiredCredit({person: booking.person.id})
  .then(function(res) {
    $scope.requiredCredit = res;
  });

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
  $scope.open(8);

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
      return initDamages();
    }
    if(id === 8) {
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
      $scope.revisions = bookingRevisions.result;
      revisionsService.revisions({
        id   : booking.id,
        type : 'OpenWheels\\ApiBundle\\Entity\\Trip'
      })
      .then(function (tripRevisions) {
        for (var i=0; i<tripRevisions.result.length; i++){
            $scope.revisions.push(tripRevisions.result[i]);
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

  function initDamages() {
    return damageService.search({
      bookingId: booking.id,
      max: 10
    })
    .then(function(damages) {
      $scope.damages = damages.result;
    });
  }

  $scope.openDeclaration = function(declaration) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'declaration', function($scope, $mdDialog, declaration) {
        $scope.declaration = declaration;
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/singleDeclaration.tpl.html',
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
      fullscreen: $mdMedia('xs'),
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

  $scope.nood = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', 'alertService', 'boardcomputerService', 'deviceService', function($scope, $mdDialog, booking,
      alertService, boardcomputerService, deviceService) {
        $scope.booking = booking;
        $scope.cancel = $mdDialog.cancel;

        $scope.immobilized = checkIfImmobilized(booking.resource);

        $scope.open = function() {
          var methodCall = ($scope.booking.resource.boardcomputer === 'invers') ?
            deviceService.forceOpen({
              resource: $scope.booking.resource.id
            }) :
            boardcomputerService.control({
              action: 'OpenDoorStartEnable',
              resource: $scope.booking.resource.id
            });

          methodCall
          .then(function(res) {
            return alertService.add('success', 'De auto opent binnen 15 seconden.', 5000);
          })
          .catch(function(err) {
            if(err && err.message) {
              alertService.add('danger', 'De auto kon niet geopend worden: ' + err.message, 5000);
            }
          });
        };

        $scope.close = function() {
          var methodCall = ($scope.booking.resource.boardcomputer === 'invers') ?
            deviceService.forceClose({
              resource: $scope.booking.resource.id
            }) :
            boardcomputerService.control({
              action: 'CloseDoorStartDisable',
              resource: $scope.booking.resource.id
            });

          methodCall
          .then(function(res) {
            return alertService.add('success', 'De auto sluit binnen 15 seconden.', 5000);
          })
          .catch(function(err) {
            if(err && err.message) {
              alertService.add('danger', 'De auto kon niet gesloten worden: ' + err.message, 5000);
            }
          });
        };

      }],
      templateUrl: 'trip/dashboard/nood.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking
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
      fullscreen: $mdMedia('xs'),
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
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'person', 'settingsService', 'FRONT_DASHBOARD', 'FRONT_SWITCHUSER', function($scope, $mdDialog, person, settingsService, FRONT_DASHBOARD, FRONT_SWITCHUSER) {
        $scope.person = person;
        $scope.frontDashboard = settingsService.settings.server + FRONT_DASHBOARD + FRONT_SWITCHUSER;

        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/loginAs.tpl.html',
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
      fullscreen: $mdMedia('xs'),
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
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'discount', function($scope, $mdDialog, discount) {
        $scope.discount = discount.discount;
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/singleDiscountCode.tpl.html',
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
    var invoicesRenterReceived = invoice2Service.getReceived({person: contract.contractor.id, booking: booking.id});
    var invoicesRenterSent = invoice2Service.getSent({person: contract.contractor.id, booking: booking.id});

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
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', 'contract', function($scope, $mdDialog, booking) {
        $scope.booking = booking;
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
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.km = {booking: booking.id, odoBegin: booking.trip.odoBegin, odoEnd: booking.trip.odoEnd};
        $scope.done = function() {
          $mdDialog.hide($scope.km);
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/km.tpl.html',
      parent: angular.element(document.body),
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

  $scope.twoMoreHours = function (errorMessage) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', 'helyUser', function($scope, $mdDialog, booking, helyUser) {
        $scope.errorMessage = errorMessage;
        $scope.helyUser = helyUser;

        $scope.tripIsNow = moment().isAfter(moment(booking.beginBooking, API_DATE_FORMAT)) && moment().isBefore(moment(booking.endBooking, API_DATE_FORMAT));
        $scope.tripHasEnded = moment().isAfter(moment(booking.endBooking, API_DATE_FORMAT));

        $scope.act = function() {
          $scope.state = {
            loading: true,
            newBooking: {
              loading: true
            }
          };

          var base = moment.max(
            moment(booking.endBooking).add(1, 'minute'),
            moment()
          );
          bookingService.create({
            resource: booking.resource.id,
            person: booking.person.id,
            timeFrame: {
              startDate: base.format('YYYY-MM-DD HH:mm'),
              endDate: base.add(2, 'hours').format('YYYY-MM-DD HH:mm')
            },
            contract: booking.contract.id
          })
          .then(possiblyTransferExtraDriversFrom(booking))
          .then(function (newBooking) {
            $scope.state.newBooking.booking = newBooking;
            $scope.state.newBooking.success = true;
            $scope.state.approving = {
              loading: true
            };

            // Automatically approve new booking
            bookingService.approve({ booking: newBooking.id })
            .then(function (altertedNewBooking) {
              $scope.state.approving.success = true;
            })
            .catch(function (err) {
              $scope.state.approving.error = err.message || err;
            })
            .finally(function () {
              $scope.state.approving.loading = false;
              $scope.state.loading = false;
              $scope.state.success = true;
            });

            $scope.immobilized = checkIfImmobilized(booking.resource);

            // Make follow-up
            $scope.state.makingFollowup = {
              loading: true
            };
            remarkService.add({
              booking: newBooking.id,
              message: '[Automatisch aangemaakt] nieuwe boeking (2u) gemaakt - dubbele kosten checken',
              type: 'custom',
              followUp: nextBusinessDay().format('YYYY-MM-DD HH:mm')
            })
            .then(function () {
              $scope.state.makingFollowup.success = true;
            })
            .catch(function (err) {
              $scope.state.makingFollowup.error = err.message || '[Onbekende fout]';
            })
            .finally(function() {
              $scope.state.makingFollowup.loading = false;
            });
          })
          .catch(function (err) {
            $scope.state.newBooking.error = err.message || err;
            $scope.state.loading = false;
          })
          .finally(function () {
            $scope.state.newBooking.loading = false;
          });
        };

        $scope.done = function () {
          if ($scope.state && $scope.state.newBooking.booking) {
            $state.go('root.trip.dashboard', { tripId: $scope.state.newBooking.booking.id });
            $mdDialog.hide();
          }
        };

        $scope.open = function () {
          if ($scope.state && $scope.state.newBooking.booking) {
            boardcomputerService.control({
              action: 'OpenDoorStartEnable',
              resource: $scope.state.newBooking.booking.resource.id,
              booking: $scope.state.newBooking.booking.id
            })
            .then(function () {
              $state.go('root.trip.dashboard', { tripId: $scope.state.newBooking.booking.id });
              $mdDialog.hide();
              alertService.add('success', 'De auto opent binnen 15 seconden.', 5000);
            })
            .catch(function(err) {
              if(err && err.message) {
                alertService.add('danger', 'De auto kon niet geopend worden: ' + err.message, 5000);
              }
            });
          }
        };

        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/twoMoreHours.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking,
        helyUser: $scope.helyUser
      }
    });
  };

  $scope.changeEndTime = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', 'helyUser', '$rootScope', function($scope, $mdDialog, booking, helyUser, $rootScope) {
        var originalEnd = moment(booking.endBooking, API_DATE_FORMAT);

        $scope.newDt = {};
        $scope.newDt.date = new Date(originalEnd);
        $scope.newDt.time = originalEnd.format('HH:mm');
        $scope.times = generateTimes();
        $scope.helyUser = helyUser;
        $scope.booking = booking;

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

        $scope.act = function() {
          $scope.state = {
            loading: true,
            newBooking: {
              loading: true
            }
          };

          var base = moment.max(
            moment(booking.endBooking).add(1, 'minute'),
            moment()
          );
          bookingService.create({
            resource: booking.resource.id,
            person: booking.person.id,
            timeFrame: {
              startDate: base.format('YYYY-MM-DD HH:mm'),
              endDate: base.add(2, 'hours').format('YYYY-MM-DD HH:mm')
            },
            contract: booking.contract.id
          })
          .then(function (newBooking) {
            $rootScope.newBooking = newBooking;
            $scope.state.newBooking.booking = newBooking;
            $scope.state.newBooking.success = true;
            $scope.state.approving = {
              loading: true
            };

            // Automatically approve new booking
            bookingService.approve({ booking: newBooking.id })
            .then(function (altertedNewBooking) {
              $scope.state.approving.success = true;
            })
            .catch(function (err) {
              $scope.state.approving.error = err.message || err;
            })
            .finally(function () {
              $scope.state.approving.loading = false;
              $scope.state.loading = false;
              $scope.state.success = true;
            });

            $scope.immobilized = checkIfImmobilized(booking.resource);

            // Make follow-up
            $scope.state.makingFollowup = {
              loading: true
            };
            remarkService.add({
              booking: newBooking.id,
              message: '[Automatisch aangemaakt] nieuwe boeking (2u) gemaakt - dubbele kosten checken',
              type: 'custom',
              followUp: nextBusinessDay().format('YYYY-MM-DD HH:mm')
            })
            .then(function () {
              $scope.state.makingFollowup.success = true;
            })
            .catch(function (err) {
              $scope.state.makingFollowup.error = err.message || '[Onbekende fout]';
            })
            .finally(function() {
              $scope.state.makingFollowup.loading = false;
            });
          })
          .catch(function (err) {
            $scope.state.newBooking.error = err.message || err;
            $scope.state.loading = false;
          })
          .finally(function () {
            $scope.state.newBooking.loading = false;
            $mdDialog.hide();
            $state.go('root.trip.dashboard', { tripId: $rootScope.newBooking.id });
          });
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
        booking: booking,
        helyUser: $scope.helyUser
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
      var duration = moment.duration(
        moment(booking.endBooking, API_DATE_FORMAT).diff(
          moment(booking.beginBooking, API_DATE_FORMAT)
        )
      );
      if (booking.ok &&
          booking.resource.boardcomputer &&
          (duration.as('hours') > 2) &&
          moment(booking.endBooking).isAfter(moment().subtract(3, 'hours'))
      ) {
        $scope.twoMoreHours(err.message || '[Onbekende fout]');
      }
      else if(err && err.message) {
        if(err.message.match('onvoldoende')) {
          alertService.add('danger', err.message + '. De huurder heeft nog ' + err.data.extra_credit + ' euro extra saldo nodig voordat de boeking verlengd kan worden.', 7000);
        } else if (err.message.match('kilometers van de rit zijn al ingevuld')) {
          alertService.add('danger', 'De rit kon niet verlengd worden: de rit is een uur na de eindtijd automatisch afgesloten.', 7000);
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
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', 'helyUser', function($scope, $mdDialog, booking, helyUser) {
        var originalBegin = moment(booking.beginBooking, API_DATE_FORMAT);

        $scope.newDt = {};
        $scope.newDt.date = new Date(originalBegin);
        $scope.newDt.time = originalBegin.format('HH:mm');
        $scope.times = generateTimes();
        $scope.helyUser = helyUser;

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
        booking: booking,
        helyUser: $scope.helyUser
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
        alertService.add('danger', 'De begintijd kon niet aangepast worden: ' + err.message + '. Laat de huurder een nieuwe (extra) reservering maken.', 5000);
      }
    })
    ;
  };

  $scope.stop = function() {
    if ($scope.helyUser) {
      var alert = $mdDialog.alert({
        title: 'Inkorten niet mogeljk',
        textContent: 'Deze huurder rijdt via onze partner Hely. De huurder kan in de Hely app zelf de rit beëindigen.',
        ok: 'Sluit'
      });

      $mdDialog
        .show(alert)
        .finally(function() {
          alert = undefined;
        });
    } else {
      var confirm = $mdDialog.confirm()
      .title('Rit inkorten / beëindigen')
      .textContent('Weet je zeker dat je deze rit wil inkorten / beëindigen? De auto sluit dan ook, zorg dat de huurder buiten de auto staat.')
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
      });
    }
  };

  $scope.cancel = function() {
    if ($scope.helyUser) {
      var alert = $mdDialog.alert({
        title: 'Annuleren niet mogeljk',
        textContent: 'Deze huurder rijdt via onze partner Hely. De huurder kan in de Hely app zelf de rit beëindigen.',
        ok: 'Sluit'
      });

      $mdDialog
        .show(alert)
        .finally(function() {
          alert = undefined;
        });
    } else {
      var confirm = $mdDialog.confirm()
      .title('Rit annuleren')
      .htmlContent('<strong>LET OP: annuleer een rit alleen als de huurder nog niet gereden heeft.</strong><br>Gebruik deze knop niet om een rit te beëindigen!<br>Maak een notitie in de rit na het annuleren waarom de rit is geannuleerd.<br>Weet je het zeker dat je de rit wil annuleren?')
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
      });
    }
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
      fullscreen: $mdMedia('xs'),
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
      fullscreen: $mdMedia('xs'),
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
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.discount = {discount: '', booking: booking.id};

        $scope.done = function() {
          $mdDialog.hide($scope.discount);
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/discountCode.tpl.html',
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
      return ccomeService.sendBooking({
        booking: $scope.booking.id
      })
      .then(function(res) {
        alertService.add('success', 'De boeking is naar de boordcomputer verstuurd.', 5000);
      })
      .catch(function(err) {
        alertService.add('danger', 'De boeking kon niet naar de boordcomputer verstuurd worden: ' + err.message, 5000);
      });
    });
  };

  $scope.openResource = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;
        $scope.ccomeColor = [];
        $scope.now = moment().format('YYYY-MM-DD HH:mm');

        $scope.myfms = function() {
          var methodCall = ($scope.booking.resource.boardcomputer === 'invers') ?
            deviceService.forceOpen({
              resource: $scope.booking.resource.id
            }) :
            boardcomputerService.control({
              action: 'OpenDoorStartEnable',
              resource: $scope.booking.resource.id
            });

          methodCall
          .then(function(res) {
            return alertService.add('success', 'De auto opent binnen 15 seconden.', 5000);
          })
          .catch(function(err) {
            if(err && err.message) {
              alertService.add('danger', 'De auto kon niet geopend worden: ' + err.message, 5000);
            }
          });
        };

        $scope.ccome = function() {
          ccomeService.sendBooking({
            booking: $scope.booking.id
          })
          .then(function(res) {
            alertService.add('success', 'De boeking is naar de boordcomputer verstuurd.', 5000);
          })
          .catch(function(err) {
            alertService.add('danger', 'De boeking kon niet naar de boordcomputer verstuurd worden: ' + err.message, 5000);
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
        return alertService.add('success', 'De auto opent binnen 15 seconden.', 5000);
      })
      .catch(function(err) {
        if(err && err.message) {
          alertService.add('danger', 'De auto kon niet geopend worden: ' + err.message, 5000);
        }
      });
    });
  };

  $scope.close = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;

        $scope.closeWithoutBooking = function() {
          var confirm = $mdDialog.confirm()
          .title('Wil je een nood-commando versturen om de auto te sluiten?')
          .textContent('Verstuur alleen een nood-commando als het het via [Versturen] niet lukt.')
          .ok('Verstuur nood-commando')
          .cancel('Annuleren');

          $mdDialog.show(confirm)
          .then(function(res) {
            var methodCall = ($scope.booking.resource.boardcomputer === 'invers') ?
              deviceService.forceClose({
                resource: $scope.booking.resource.id
              }) :
              boardcomputerService.control({
                action: 'CloseDoorStartDisable',
                resource: $scope.booking.resource.id
              });

            methodCall
            .then(function(res) {
              return alertService.add('success', 'De auto sluit binnen 15 seconden.', 5000);
            })
            .catch(function(err) {
              if(err && err.message) {
                alertService.add('danger', 'De auto kon niet gesloten worden: ' + err.message, 5000);
              }
            });
          });
        };

        $scope.done = function() {
          $mdDialog.hide($scope.ccomeColor);
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/close.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking
      }
    })
    .then(function(res) {
      return boardcomputerService.control({
        action: 'CloseDoorStartDisable',
        resource: $scope.booking.resource.id,
        booking: $scope.booking.id
      })
      .then(function(res) {
        return alertService.add('success', 'De auto sluit binnen 15 seconden.', 5000);
      })
      .catch(function(err) {
        if(err && err.message) {
          alertService.add('danger', 'De auto kon niet gesloten worden: ' + err.message, 5000);
        }
      });
    });
  };

  $scope.chip = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;

        chipcardService.getFish({person: $scope.booking.person.id})
        .then(function(fish) {
          $scope.fish = fish;
        });

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
        ccomeService.sendBooking({
          booking: $scope.booking.id
        })
        .then(function(ccome) {
          return alertService.add('success', 'Er is een nieuwe pincode verstuurd, de pincode is ' + chip.pincode, 15000);
        })
        .catch(function(err) {
          if(err && err.message) {
            alertService.add('danger', 'Er kon helaas geen nieuwe pincode verstuurd worden ' + err.message, 5000);
          }
        });
      });
    });
  };

  $scope.location = function() {
    boardcomputerService.currentLocation({
      resource: booking.resource.id
    })
    .then(function(location) {
      var locationUrl = 'https://www.google.nl/maps/search/' + location.lat + ',%20' + location.lng;
      $window.open(locationUrl);
    });
  };

  function doTransferExtraDriversFrom (originalBooking) {
    return function (newBooking) {
      return $q(function (resolve, reject) {
        $log.log('transferring extra drivers from ' + originalBooking.id + ' to ' + newBooking.id + '...');
        $log.log('(1) loading extra drivers...');
        extraDriverService.driversForBooking({ booking: originalBooking.id })
        .then(unwrapResult)
        .then(function (originalInviteRequests) {
          $log.log('(2) filtering invite requests...');
          originalInviteRequests = originalInviteRequests.filter(function (inviteRequest) {
            return inviteRequest.status === 'invited' || inviteRequest.status === 'accepted';
          });
          $log.log('(3) transferring invite requests...');
          $q.all(originalInviteRequests.map(function (originalInviteRequest) {
            $log.log('(3 > ' + originalInviteRequest.id + ') add driver...');
            return extraDriverService.addDriver({
              booking: newBooking.id,
              email: originalInviteRequest.recipient.email,
            })
            .then(function (newInviteRequest) {
              if (originalInviteRequest.status === 'invited') {
                $log.log('(3 > ' + originalInviteRequest.id + ' -> ' + newInviteRequest.id + ') OK');
                return newInviteRequest;
              } else {
                $log.log('(3 > ' + originalInviteRequest.id + ' -> ' + newInviteRequest.id + ') auto-accepting...');
                return extraDriverService.acceptRequest({ id: newInviteRequest.id })
                  .then(function (__) {
                    return newInviteRequest;
                  })
                  .catch(function (err) {
                    // TODO
                    throw err;
                  });
              }
            });
          }))
          .then(function (newInviteRequests) {
            $log.log('(4) transfer complete!');
          })
          .catch(function (err) {
            alertService.addError(err);
          })
          .finally(function () {
            // I'd rather err on the side of not being able
            //  to transfer extra drivers,
            //  than have the rebooking feature fail as well
            resolve(newBooking);
          });
        });
      });
    };
  }

  function dontTransferExtraDriversFrom (originalBooking) {
    return function (newBooking) {
      return $q(function (resolve) {
        resolve(originalBooking);
      });
    };
  }

  var possiblyTransferExtraDriversFrom = (contract.type.id === 60) ? doTransferExtraDriversFrom : dontTransferExtraDriversFrom;

  $scope.unlockPerson = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;

        personService.get({person: booking.person.id})
        .then(function(person) {
          $scope.person = person;
        });

        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/unlock_account.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking,
        person: $scope.person
      }
    })
    .then(function(res) {
      return personService.alter({
        id: $scope.booking.person.id,
        newProps: {locked: false}
      })
      .then(function(res) {
        $scope.booking.person.locked = res.locked;
        return alertService.add('success', 'Het account van de huurder is unlocked.', 5000);
      })
      .catch(function(err) {
        if(err && err.message) {
          alertService.add('danger', 'Het account van de huurder kon niet unlocked worden: ' + err.message, 5000);
        }
      });
    });
  };

  $scope.start = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;
        $scope.now = moment().format('YYYY-MM-DD HH:mm');

        chipcardService.getFish({person: $scope.booking.person.id})
        .then(function(fish) {
          $scope.fish = fish;
        });


        $scope.myfms = function() {
          var methodCall = ($scope.booking.resource.boardcomputer === 'invers') ?
            deviceService.forceOpen({
              resource: $scope.booking.resource.id
            }) :
            boardcomputerService.control({
              action: 'OpenDoorStartEnable',
              resource: $scope.booking.resource.id
            });

          methodCall
          .then(function(res) {
            return alertService.add('success', 'De auto opent binnen 15 seconden.', 5000);
          })
          .catch(function(err) {
            if(err && err.message) {
              alertService.add('danger', 'De auto kon niet geopend worden: ' + err.message, 5000);
            }
          });
        };

        $scope.immobilized = checkIfImmobilized($scope.booking.resource);

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
        return alertService.add('success', 'De auto opent binnen 15 seconden.', 5000);
      })
      .catch(function(err) {
        if(err && err.message) {
          alertService.add('warning', 'De auto kon niet geopend worden: ' + err.message, 5000);
        }
      });
    });
  };

  $scope.bookOtherResource = function(selectedBooking) {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
        $scope.booking = selectedBooking;
        $scope.now = moment().format('YYYY-MM-DD HH:mm');
        $scope.contract = {};

        personService.get({person: selectedBooking.person.id})
        .then(function(personGet) {
          $scope.personGet = personGet;
        });

        $scope.loadingAvailableResources =  true;

        resourceService.searchV3({
          person: $scope.booking.person.id,
          timeFrame: { 
            startDate: $scope.booking.beginBooking < $scope.now ? $scope.now : $scope.booking.beginBooking, 
            endDate: $scope.booking.endBooking
          },
          radius: 15000,
          sort: 'distance',
          offest: 0,
          maxresults: 20, 
          filters: {
            smartwheels: $scope.booking.resource.boardcomputer ? true : null
          },
          location: {
            latitude: $scope.booking.resource.latitude,
            longitude: $scope.booking.resource.longitude
          }
        })
        .then(function(resources) {
          $scope.loadingAvailableResources =  false;
          $scope.availableResources = resources.results;
        })
        .catch(function(error){
          $scope.error = error.message;
        });

        $scope.bookResource = function(booking, resource) {
          alertService.load();
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
            .then(possiblyTransferExtraDriversFrom(selectedBooking))
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
            })
            .finally(function () {
              alertService.loaded();
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
      fullscreen: $mdMedia('xs'),
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
      clickOutsideToClose:true
    });
  };

  $scope.bookAlternative = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', 'helyUser', function($scope, $mdDialog, booking, helyUser) {
        $scope.booking = booking;
        $scope.helyUser = helyUser;
        $scope.bookForPerson = { val: undefined };
        $scope.now = moment().format('YYYY-MM-DD HH:mm');
        $scope.contract = {};

        $scope.loadingAvailableResources =  true;
        resourceService.searchV3({
          person: $scope.booking.person.id,
          timeFrame: { 
            startDate: $scope.booking.beginBooking < $scope.now ? $scope.now : $scope.booking.beginBooking, 
            endDate: $scope.booking.endBooking
          },
          radius: 15000,
          sort: 'distance',
          offest: 0,
          maxresults: 20, 
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
        })
        .catch(function(error){
          $scope.error = error.message;
        })
        .finally(function () {
          $scope.loadingAvailableResources =  false;
        });

        $scope.loadContracts = function() {
          contractService.forDriver({person: $scope.booking.resource.owner.id})
          .then(function(contracts) {
            $scope.ownerContracts = contracts;
          });
        };

        $scope.bookOtherResource = function(resource) {
          alertService.load();

          bookingService.cancel({booking: $scope.booking.id})
          .then(function(canceledBooking) {
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
              possiblyTransferExtraDriversFrom(canceledBooking);

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
              alertService.add('danger', 'De boeking kon niet gemaakt worden: ' + err.message, 5000);
            })
            .finally(function () {
              alertService.loaded();
            });
          });
        };
        $scope.done = function() {
          $mdDialog.hide({
            bookForPerson: $scope.bookForPerson.val,
            contract: $scope.contract.id,
            booking: $scope.booking
          });
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/bookAlternative.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking,
        helyUser: $scope.helyUser
      }
    });
  };

  $scope.blockResource = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', 'helyUser', function($scope, $mdDialog, booking, helyUser) {
        $scope.booking = booking;
        $scope.helyUser = helyUser;

        var mom = moment();
        var roundedUp = Math.ceil(moment().minute() / 15) * 15;
        mom.minutes(roundedUp);

        $scope.newBeginDt = {};
        $scope.newBeginDt.date = new Date();
        $scope.newBeginDt.time = moment(mom).format('HH:mm');
        $scope.newEndDt = {};
        $scope.newEndDt.date = new Date();
        $scope.newEndDt.time = '18:00';
        $scope.times = generateTimes();

        function makeNewDateString(date) {
          var newDate = moment(date.date);
          return newDate.format('YYYY-MM-DD ') + date.time;
        }

        $scope.done = function() {
          $mdDialog.hide({
            newBeginDt: makeNewDateString($scope.newBeginDt),
            newEndDt: makeNewDateString($scope.newEndDt),
            booking: $scope.booking
          });
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/blockResource.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking,
        helyUser: $scope.helyUser
      }
    })
    .then(function(res) {
      alertService.load();
      bookingService.create({
        resource: res.booking.resource.id,
        person: 282,
        timeFrame: { 
          startDate: res.newBeginDt, 
          endDate: res.newEndDt
        },
        contract: 934646
      })
      .then(function(booking) {
        $mdDialog.cancel();
        alertService.add('success', 'De boeking is gemaakt.', 5000);
        $state.go('root.trip.dashboard', {tripId: booking.id});
      })
      .catch(function(err) {
        alertService.add('danger', 'De boeking kon niet gemaakt worden: ' + err.message, 5000);
      })
      .finally(function () {
        alertService.loaded();
      });
    });
  };

  $scope.breakdown = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;
        $scope.now = moment().format('YYYY-MM-DD HH:mm');

        $scope.immobilized = checkIfImmobilized($scope.booking.resource);
        
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
      fullscreen: $mdMedia('xs'),
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
      locals: {
        booking: booking
      }
    });
  };

  $scope.deleteDamage = function (damage) {
    var confirm = $mdDialog.confirm()
    .title('Schade verwijderen')
    .textContent('Weet je zeker dat je deze schade wil verwijderen?')
    .ok('Ja')
    .cancel('Nee');

    $mdDialog.show(confirm)
    .then(function(res) {
      damageService.remove({ damage: damage.id })
      .then(function (result) {
        alertService.add('success', 'Damage removed.', 5000);
        var index = $scope.damages.indexOf(damage);
        if(index >= 0) {
          $scope.damages.splice(index, 1);
        }
      })
      .catch(alertService.addError)
      .finally(alertService.loaded);
    });
  };

  $scope.previousBooking = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
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
      clickOutsideToClose:true,
      locals: {
        booking: booking
      },
    });
  };

  $scope.automateFine = function () {
    automate("fine_admin_costs", { booking: booking });
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
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'booking', function($scope, $mdDialog, booking) {
        $scope.booking = booking;

        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/resourceRemark.tpl.html',
      clickOutsideToClose:true,
      locals: {
        booking: booking
      },
    });
  };

  $scope.deleteRemark = function(remark) {

    var confirm = $mdDialog.confirm()
      .title('Notitie verwijderen')
      .textContent('Weet je zeker dat je deze notitie wil verwijderen?')
      .ok('Ja')
      .cancel('Nee');

      $mdDialog.show(confirm)
      .then(function(res) {
        remarkService.delete({ remark: remark.id })
          .then(function (result) {
            alertService.add('success', 'Notitie verwijderd.', 5000);
            var index = $scope.remarks.indexOf(remark);
            if(index >= 0) {
              $scope.remarks.splice(index, 1);
            }
          })
          .catch(alertService.addError)
          .finally(alertService.loaded);
      });
  };

  $scope.contractInfo = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', 'contract', function($scope, $mdDialog, contract) {
        $scope.contract = contract;
        
        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;

      }],
      templateUrl: 'trip/dashboard/contractInfo.tpl.html',
      clickOutsideToClose:true,
      locals: {
        contract: contract
      },
    });
  };

  $scope.openTextEditorDialog = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
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

  function nextBusinessDay () {
    var dayIncrement = 1;

    if (moment().day() === 5) {
      // set to monday
      dayIncrement = 3;
    } else if (moment().day() === 6) {
      // set to monday
      dayIncrement = 2;
    }

    return moment().add(dayIncrement, 'days');
  }

});
