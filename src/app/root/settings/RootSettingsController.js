'use strict';

angular.module('openwheels.root.settings', [
  'jsonrpc'
])

.controller('RootSettingsController', function ($scope, user, settingsService, appConfig, phoneLogService) {

  $scope.user = user;
  $scope.settings = settingsService.settings;
  $scope.backendOptions = appConfig.backends;

  $scope.submit = function() {
	  settingsService.save();
  };

  $scope.testCall = function () {
    phoneLogService.sliderOptions.historyVisible = true;

    if (user.identity && user.identity.phoneNumbers && user.identity.phoneNumbers.length) {
      phoneLogService.testCall(user.identity.phoneNumbers[0]);
    } else {
      phoneLogService.testCall();
    }
  };
})
;
