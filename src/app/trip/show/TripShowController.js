'use strict';

angular.module('openwheels.trip.show', [
  'openwheels.trip.show.summary',
  'openwheels.trip.show.overview',
  'openwheels.trip.show.edit_booking',
  'openwheels.trip.show.admin',
  'openwheels.trip.show.revisions'
])

.controller('TripShowController', function ($scope, $uibModal, $stateParams, alertService, bookingService, booking, settingsService, FRONT_RENT, API_DATE_FORMAT) {

  $scope.booking = booking;
  $scope.contract = null;

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
