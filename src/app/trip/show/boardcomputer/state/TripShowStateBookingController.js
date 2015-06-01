'use strict';

angular.module('openwheels.trip.show.ccomstate', [])

.controller('TripShowStateBookingController', function ($scope, $modal, states) {
  $scope.states = states;

});
