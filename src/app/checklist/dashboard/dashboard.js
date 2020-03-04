'use strict';

angular.module('openwheels.checklist.dashboard', ['openwheels.checklist.directive'])
.controller('DashboardController', function ($scope, queries) {
  $scope.queries = queries;
});