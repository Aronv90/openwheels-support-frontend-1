'use strict';

angular.module('openwheels.resource.show.summary', [])

.controller('ResourceShowSummaryController', function ($scope, resource, bookings) {
  $scope.resource = resource;
  $scope.bookings = bookings;
})

;
