'use strict';

angular.module('openwheels.trip.show', [
  'openwheels.trip.show.summary',
  'openwheels.trip.show.overview',
  'openwheels.trip.show.edit_booking',
  'openwheels.trip.show.admin',
  'openwheels.trip.show.revisions'
])

.controller('TripShowController', function ($scope, $stateParams, alertService, bookingService, booking) {

  $scope.booking = booking;

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
