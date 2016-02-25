'use strict';

angular.module('openwheels.person.show.rating', [])

.controller('PersonShowRatingController', function ($scope, person, ratings) {
  $scope.ratingTotals = person.rating_totals;
  $scope.ratings = ratings;
});
