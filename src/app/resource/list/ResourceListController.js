'use strict';

angular.module('openwheels.resource.list', [])

.controller('ResourceListController', function ($scope, $state, $stateParams, resources) {
	$scope.resources = resources;

	$scope.params = {
		page: $stateParams.page || 1
	};

	$scope.setPage = function (page) {
		$state.go('root.person.show.resource.list', {
			page: page
		});
	};

});
