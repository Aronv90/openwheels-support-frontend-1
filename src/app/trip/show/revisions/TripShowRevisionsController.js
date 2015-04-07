'use strict';

angular.module('openwheels.trip.show.revisions', [])

.controller('TripShowRevisionsController', function ($scope, alertService, booking, revisionsService) {

  $scope.fields        = [];
  $scope.revisions     = [];
  $scope.selectedField = null;

  // populate fields
  angular.forEach(booking, function (val, key) {
    $scope.fields.push(key);
  });

  // populate revisions
  alertService.load();
  revisionsService.revisions({
    id   : booking.id,
    type : 'OpenWheels\\ApiBundle\\Entity\\Booking'
  })
  .then(function (revisions) {
    $scope.revisions = revisions;
  })
  .finally(function () {
    alertService.loaded();
  });

});
