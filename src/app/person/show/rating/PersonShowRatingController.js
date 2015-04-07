'use strict';

angular.module('openwheels.person.show.rating', [])

.controller('PersonShowRatingController', function ($scope, person) {
  $scope.ratingTotals = person.rating_totals;
  $scope.ratings = person.ratings;
})

;
