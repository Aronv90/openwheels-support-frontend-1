'use strict';

angular.module('openwheels.trip.show.edit_booking', [])

.controller('TripShowEditBookingController', function ($scope, booking, bookingService, alertService) {
  //scope
  $scope.booking = booking;

  $scope.dateConfig = {
    //model
    modelFormat: 'YYYY-MM-DD HH:mm',
    formatSubmit: 'yyyy-mm-dd',

    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',
    //options
    selectMonths: true

  };

  $scope.timeConfig = {
    //model
    modelFormat: 'YYYY-MM-DD HH:mm',
    formatSubmit: 'HH:i',

    //view
    viewFormat: 'HH:mm',
    format: 'HH:i',

    //options
    interval: 15
  };



  $scope.saveBooking = function() {


    bookingService.alterRequest({
      id: $scope.booking.id,
      timeFrame: {
        startDate: $scope.booking.beginBooking,
        endDate: $scope.booking.endBooking
      },
      remark: $scope.booking.remarkRequester
    }).then( function( booking ) {
      angular.extend($scope.booking, booking);
      alertService.add('success', 'Request edited', 2000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };

  $scope.acceptRequest = function() {
    bookingService.acceptRequest({
      id: $scope.booking.id,
      remark: $scope.booking.remarkAuthorizer
    }).then( function( booking ) {
      angular.extend($scope.booking, booking);
      alertService.add('success', 'Request accepted', 2000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };

  $scope.rejectRequest = function() {
    bookingService.rejectRequest({
      id: $scope.booking.id,
      remark: $scope.booking.remarkAuthorizer
    }).then( function( booking ) {
      angular.extend($scope.booking, booking);
      alertService.add('success', 'Request rejected', 2000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };

  $scope.cancelBooking = function() {
    bookingService.cancel({
      id: $scope.booking.id
    }).then( function( booking ) {
      angular.extend($scope.booking, booking);
      alertService.add('success', 'Booking canceled', 2000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };

  $scope.stopBooking = function() {
    bookingService.stop({
      id: $scope.booking.id
    }).then( function( booking ) {
      angular.extend($scope.booking, booking);
      alertService.add('success', 'Booking stopped', 2000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
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

  $scope.disapproveBooking = function disapproveBooking() {
    bookingService.disapprove({booking: $scope.booking.id})
      .then(
      function (booking) {
        angular.extend($scope.booking, booking);
        alertService.add('success', 'Booking disapproved.', 5000);
      },
      function (error) {
        alertService.add('warning', 'Disapproving booking failed.', 5000);
      }
    );
  };

  //checks
  $scope.isTrip = function() {
    // status accepted and booking is passed
    return $scope.booking.status === 'accepted' && moment().isAfter( moment( $scope.booking.beginBooking) );
  };
  $scope.isBooking = function() {
    // status accepted and booking not yet passed
    return $scope.booking.status === 'accepted' && moment().isBefore( moment( $scope.booking.beginBooking) );
  };

  $scope.isRequest = function() {
    // status requested or isBooking with a new request
    return $scope.booking.status === 'requested' || ( $scope.isBooking() && $scope.booking.beginRequested && $scope.booking.endRequested );
  };
  //booking functions
  $scope.isResponseDisabled = function () {
    console.log( $scope.requestForm.$dirty);
    return $scope.requestForm.$dirty;
  };

})
;
