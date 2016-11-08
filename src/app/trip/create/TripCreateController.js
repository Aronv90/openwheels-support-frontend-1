'use strict';

angular.module('openwheels.trip.create', [])

  .controller('TripCreateController', function ($scope, $filter, $q, $uibModalInstance, $state, dialogService,
                                                alertService, bookingService, contractService, resource, person) {

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

    $scope.booking = {};
    $scope.booking.resource = resource;
    $scope.booking.person = person;
    $scope.booking.riskReduction = false;

    $scope.dismiss = function () {
      $uibModalInstance.dismiss();
    };

    $scope.onSelectPerson = function(person) {
      contractService.forDriver({
        person: person.id
      }).then(function(contracts){
        $scope.driverContracts = contracts;
      });
    };

    $scope.save = function (booking) {
      bookingService.create({
        resource: $scope.booking.resource.id,
        person: $scope.booking.person.id,
        timeFrame: { startDate: $scope.booking.beginBooking, endDate: $scope.booking.endBooking },
        contract: $scope.booking.contract.id,
        remark: $scope.booking.remark,
        riskReduction: $scope.booking.riskReduction
      })
        .then(function (booking) {
          $uibModalInstance.close(booking); //
          alertService.add('success', 'Booking created.', 4000);
          $state.go('root.trip.show.summary', {tripId: booking.id});
        },
        function (error) {
          alertService.add('danger', 'Booking creation failed: ' + error.message, 5000);
        }
      );
    };

    // Date & time picker functionality:

    function getStartOfThisQuarter () {
      var mom = moment();
      var quarter = Math.floor((mom.minutes() | 0) / 15); // returns 0, 1, 2 or 3
      var minutes = (quarter * 15) % 60;
      mom.minutes(minutes);
      return mom;
    }

    $scope.setTimeframe = function(addDays) {
      var now = getStartOfThisQuarter();
      $scope.booking.beginBooking = now.add('days', addDays).format('YYYY-MM-DD HH:mm');
      $scope.booking.endBooking = now.add('days', addDays).add('hours', 6).format('YYYY-MM-DD HH:mm');
    };

    function isToday (_moment) {
      return _moment.format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
    }

    $scope.onBeginDateChange = function () {
      var booking = $scope.booking;
      var begin = booking.beginBooking && moment(booking.beginBooking, 'YYYY-MM-DD HH:mm');
      var end   = booking.endBooking && moment(booking.endBooking, 'YYYY-MM-DD HH:mm');

      if (begin && !isToday(begin)) {
        begin = begin.startOf('day').add('hours', 9);
        if (!end) {
          end   = begin.clone().startOf('day').add('hours', 18);
        }
        if (begin < end) {
          booking.beginBooking = begin.format('YYYY-MM-DD HH:mm');
          booking.endBooking = end.format('YYYY-MM-DD HH:mm');
        }
      }
    };

    $scope.onEndDateChange = function () {
      var booking = $scope.booking;
      var begin = booking.beginBooking && moment(booking.beginBooking, 'YYYY-MM-DD HH:mm');
      var end   = booking.endBooking && moment(booking.endBooking, 'YYYY-MM-DD HH:mm');

      if (end && !isToday(end)) {
        end = end.startOf('day').add('hours', 18);
        if (!begin) {
          begin   = end.clone().startOf('day').add('hours', 9);
        }
      }
      if (begin < end) {
        booking.beginBooking = begin.format('YYYY-MM-DD HH:mm');
        booking.endBooking = end.format('YYYY-MM-DD HH:mm');
      }
    };

  });
