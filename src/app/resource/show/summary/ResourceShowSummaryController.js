'use strict';

angular.module('openwheels.resource.show.summary', [])

.controller('ResourceShowSummaryController', function ($scope, resource) {
	$scope.resource = resource;

	if($scope.resource.contactPerson && $scope.resource.owner.id === $scope.resource.contactPerson.id) {
	  $scope.resource.contactPerson = null;
	}
});
