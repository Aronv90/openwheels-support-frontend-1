'use strict';

angular.module('openwheels.rating.list', [])

.controller('RatingListController', function ($scope, ratings) {
  $scope.ratings = ratings;
})
;
