'use strict';

angular.module('openwheels.provider.list', [])

.controller('ProviderListController', function ($scope, providers) {
  $scope.providers = providers;
})
;
