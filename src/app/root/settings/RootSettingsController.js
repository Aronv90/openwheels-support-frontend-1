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
    var old = phoneLogService.sliderOptions.historyVisible;

    phoneLogService.sliderOptions.historyVisible = true;
    phoneLogService.testCall();
    $timeout(function () {
      phoneLogService.testHangup();
    }, 3000);

    phoneLogService.sliderOptions.historyVisible = old;
  };
})
;
