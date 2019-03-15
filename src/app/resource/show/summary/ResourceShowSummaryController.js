'use strict';

angular.module('openwheels.resource.show.summary', [])

.controller('ResourceShowSummaryController', function ($scope, resource, bookings) {
	$scope.resource = resource;
	$scope.bookings = bookings;

	if($scope.resource.owner.id === $scope.resource.contactPerson.id) {
	  $scope.resource.contactPerson = null;
	}
});
