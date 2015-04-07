'use strict';

angular.module('openwheels.trip.show.admin', [])

  .controller('TripShowAdminController', function ($scope, $q, booking, driverContracts, bookingService, alertService) {
    //scope
    var masterBooking = booking;
    $scope.booking = angular.copy(masterBooking);
    $scope.driverContracts = driverContracts;

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
      interval: 5
    };

    $scope.saveBooking = function () {

      var newProps;
      newProps = {};

      if ($scope.booking.beginBooking !== masterBooking.beginBooking || $scope.booking.endBooking !== masterBooking.endBooking) {
        newProps.beginBooking = $scope.booking.beginBooking;
        newProps.endBooking = $scope.booking.endBooking;
      }

      if ($scope.booking.remarkRequester !== masterBooking.remarkRequester) {
        newProps.remarkRequester = $scope.booking.remarkRequester;
      }

      if (masterBooking.contract ===  null || $scope.booking.contract.id !== masterBooking.contract.id) {
        newProps.contract = $scope.booking.contract.id;
      }

      if (! _.isEmpty(newProps)) {
        bookingService.alter({id: $scope.booking.id, newProps: newProps})
          .then(function (booking) {
            angular.extend($scope.booking, booking);
            masterBooking = angular.copy($scope.booking);
            alertService.add('success', 'Booking edited', 2000);
          }, function (error) {
            alertService.add('danger', error.message, 5000);
          }
        );
      }
    };

    $scope.setTrip = function () {
      bookingService.setTrip({
        id: $scope.booking.id,
        begin: $scope.booking.trip.begin,
        end: $scope.booking.trip.end,
        odoBegin: $scope.booking.trip.odoBegin,
        odoEnd: $scope.booking.trip.odoEnd
        //timeframe
      }).then(function (trip) {
        angular.extend($scope.booking.trip, trip);
        alertService.add('success', 'Trip set', 2000);
      }, function (error) {
        alertService.add('danger', error.message, 5000);
      });
    };

    //checks
    $scope.isTrip = function () {
      // status accepted and booking is passed
      return $scope.booking.status === 'accepted' && moment().isAfter(moment($scope.booking.beginBooking));
    };
    $scope.isBooking = function () {
      // status accepted and booking not yet passed
      return $scope.booking.status === 'accepted' && moment().isBefore(moment($scope.booking.beginBooking));
    };

    $scope.isFinished = function () {
      // endbooking has passed
      return moment($scope.booking.endBooking).isBefore( moment() );
    };

    $scope.isRequest = function () {
      // status requested or isBooking with a new request
      return $scope.booking.status === 'requested' || ( $scope.isBooking() && $scope.booking.beginRequested && $scope.booking.endRequested );
    };
    //booking functions
    $scope.isResponseDisabled = function () {
      console.log($scope.requestForm.$dirty);
      return $scope.requestForm.$dirty;
    };

  })
;
