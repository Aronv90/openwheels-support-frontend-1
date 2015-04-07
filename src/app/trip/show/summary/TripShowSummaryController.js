'use strict';

angular.module('openwheels.trip.show.summary', [])

.controller('TripShowSummaryController', function ($scope, booking) {
  $scope.booking = booking;
})

;
