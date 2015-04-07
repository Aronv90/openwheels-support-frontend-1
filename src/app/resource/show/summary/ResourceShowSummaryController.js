'use strict';

angular.module('openwheels.resource.show.summary', [])

.controller('ResourceShowSummaryController', function ($scope, resource) {
  $scope.resource = resource;
})

;
