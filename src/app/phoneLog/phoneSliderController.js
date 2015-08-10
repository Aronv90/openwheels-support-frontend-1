'use strict';

angular.module('openwheels.phoneLog.slider', [])

.controller('PhoneSliderController', function ($state, $scope, settingsService, phoneLogService) {

  $scope.settings = settingsService.settings;
  $scope.sliderOptions = phoneLogService.sliderOptions;
  $scope.events = phoneLogService.events;

  $scope.clearActive = function () {
    phoneLogService.sliderOptions.historyVisible = false;
    phoneLogService.events.forEach(function (e) {
      e.active = false;
    });
  };

  $scope.select = function (e) {
    e.active = false;
    phoneLogService.sliderOptions.historyVisible = false;
    $state.go('root.person.show.summary', { personId: e.person.id });
  };

});
