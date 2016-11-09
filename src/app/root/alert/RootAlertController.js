'use strict';

angular.module('openwheels.root.alert.default', [])

.controller('RootAlertController', function ($state, $scope, $uibModal, alertService, personService, settingsService, phoneLogService, bookingService) {
  $scope.closeAlert = alertService.closeAlert;
});
