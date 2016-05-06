'use strict';

angular.module('openwheels.checklist.generic', [])
    .controller('GenericController', function ($scope, query) {
      $scope.query = query;
    });