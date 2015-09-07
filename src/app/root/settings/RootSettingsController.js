'use strict';

angular.module('openwheels.root.settings', [
  'jsonrpc'
])

.controller('RootSettingsController', function ($timeout, $scope, user, settingsService, appConfig, phoneLogService) {

  $scope.user = user;
  $scope.settings = settingsService.settings;
  $scope.backendOptions = appConfig.backends;

  $scope.submit = function() {
	  settingsService.save();
  };

  $scope.testCall = function () {
    phoneLogService.testCall();
    phoneLogService.testHangup();
  };
})
;
