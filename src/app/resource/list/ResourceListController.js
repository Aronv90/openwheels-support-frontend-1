'use strict';

angular.module('openwheels.resource.list', [])

.controller('ResourceListController', function ($scope, resources) {
  $scope.resources = resources;


});
