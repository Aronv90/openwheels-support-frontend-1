'use strict';

angular.module('openwheels.root.settings', [
  'jsonrpc'
])

.controller('RootSettingsController', function ($timeout, $scope, user, settingsService, appConfig) {

  $scope.user = user;
  $scope.settings = settingsService.settings;
  $scope.backendOptions = appConfig.backends;

  $scope.submit = function() {
	  settingsService.save();
  };
})
;
