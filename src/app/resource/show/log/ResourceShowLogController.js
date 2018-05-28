'use strict';

angular.module('openwheels.resource.show.log', [])

.controller('ResourceShowLogController', function ($scope, logs, boardcomputerService, resource, $stateParams, $state) {
	$scope.logs = logs;
	$scope.curLoc = {};

	$scope.getCurrentLocation = function() {
		boardcomputerService.currentLocation({resource: resource.id})
		.then(function(res) {
		  $scope.curLoc = angular.copy(res);
		  $scope.curLoc.date = new Date($scope.curLoc.date);
		});
	};

	$scope.startDate = moment($stateParams.startDate).format('YYYY-MM-DD HH:mm') || moment().startOf('day').format('YYYY-MM-DD HH:mm');
	$scope.endDate = moment($stateParams.endDate).format('YYYY-MM-DD HH:mm') || moment().endOf('day').format('YYYY-MM-DD HH:mm');

	$scope.previous = function () {
		$state.go($state.current.name, {
		  startDate: moment($scope.startDate).subtract(1, 'd').startOf('day').format('YYYY-MM-DD HH:mm'),
		  endDate: moment($scope.endDate).subtract(1, 'd').endOf('day').format('YYYY-MM-DD HH:mm')
		});
	};

	$scope.next = function () {
		$state.go($state.current.name, {
		  startDate: moment($scope.startDate).add(1, 'd').startOf('day').format('YYYY-MM-DD HH:mm'),
		  endDate: moment($scope.endDate).add(1, 'd').endOf('day').format('YYYY-MM-DD HH:mm')
		});
	};

});
