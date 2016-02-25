'use strict';

angular.module('openwheels.resource.show.rating', [])

.controller('ResourceShowRatingController', function ($scope, ratings, resource) {
	$scope.ratings = ratings;
});
