'use strict';

angular.module('openwheels.root.alert.default', [])

.controller('RootAlertController', function ($state, $scope, $modal, alertService, personService, settingsService, phoneLogService, bookingService) {
  $scope.closeAlert = alertService.closeAlert;
});
