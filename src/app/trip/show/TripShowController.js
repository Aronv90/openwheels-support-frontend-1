'use strict';

angular.module('openwheels.trip.show', [
  'openwheels.trip.show.summary',
  'openwheels.trip.show.overview',
  'openwheels.trip.show.edit_booking',
  'openwheels.trip.show.admin',
  'openwheels.trip.show.revisions'
])

.controller('TripShowController', function ($scope, $rootScope, $uibModal, $stateParams, voucherService, alertService, bookingService, booking, settingsService, FRONT_RENT, API_DATE_FORMAT, localStorageService) {

  $scope.booking = booking;
  $scope.contract = null;

  // Allow admin actions, such as "Approve booking"
  $scope.allowBookingAdmin = true;
  if ($rootScope.isInterswitch) {
    $scope.allowBookingAdmin = false;

    if ($scope.booking.beginBooking) {
      const duration = moment.duration(
        moment($scope.booking.endBooking, API_DATE_FORMAT).diff(
          moment($scope.booking.beginBooking, API_DATE_FORMAT)
        )
      );
      console.debug('duration of booking in hours', duration.as('hours'));
      if (duration.as('hours') <= 2) {
        // If the booking has been approved, and has a duration of max two hours
        $scope.allowBookingAdmin = true;
      }

      // Ff the total amount to be payed *for this booking* is max 5 E
      voucherService.calculateRequiredCreditForBooking({ booking: booking.id })
      .then(function(res) {
        console.debug('booking required credit', res);
        if (res.booking_price.total < 5) {
          $scope.allowBookingAdmin = true;
        }
      });

      // If the total amount the booking's person has to pay is max 5 E
      voucherService.calculateRequiredCredit({ person: booking.person.id })
      .then(function(res) {
        console.debug('person required credit', res);
        if (res.total < 5) {
          $scope.allowBookingAdmin = true;
        }
      });

    }
  }

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

  var startDate = moment((booking.beginBooking ? booking.beginBooking : booking.beginRequested), API_DATE_FORMAT);
  var endDate = moment((booking.endBooking ? booking.endBooking : booking.endRequested), API_DATE_FORMAT);

  // datetime format for parameters in URL
  var URL_DATE_TIME_FORMAT = 'YYMMDDHHmm';

  $scope.frontAlternatives = settingsService.settings.server + FRONT_RENT + '?start=' + moment(startDate).format(URL_DATE_TIME_FORMAT) + '&end=' + moment(endDate).format(URL_DATE_TIME_FORMAT) + '&lat=' + booking.resource.latitude + '&lng=' + booking.resource.longitude + (booking.resource.boardcomputer ? '&smartwheels=true' : '');

  $scope.getContract = function (contract) {
    $uibModal.open({
      templateUrl: 'contract/show/contract-show.tpl.html',
      controller: ['$scope', '$uibModalInstance', 'contractService', function ($scope, $uibModalInstance, contractService) {
        contractService.get({
          contract: contract
        })
        .then(function (contract) {
          $scope.contract = contract;
        });
        $scope.close = $uibModalInstance.close;
      }]
    });
  };

  $scope.approveBooking = function approveBooking() {
    bookingService.approve({booking: $scope.booking.id})
      .then(
      function (booking) {
        angular.extend($scope.booking, booking);
        alertService.add('success', 'Booking approved.', 5000);
      },
      function (error) {
        alertService.add('warning', 'Approving booking failed.', 5000);
      }
    );
  };

  $scope.disapprovedBooking = function approveBooking() {
    bookingService.approve({booking: $scope.booking.id})
      .then(
      function (booking) {
        angular.extend($scope.booking, booking);
        alertService.add('success', 'Booking approved.', 5000);
      },
      function (error) {
        alertService.add('warning', 'Approving booking failed.', 5000);
      }
    );
  };

});
