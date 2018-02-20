'use strict';

angular.module('openwheels.resource.list', [])

.controller('ResourceListController', function ($scope, resources, resourceMembers) {
	$scope.resources = resources;
	$scope.resourceMembers = resourceMembers;

});
