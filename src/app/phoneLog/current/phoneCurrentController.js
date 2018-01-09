'use strict';

angular.module('openwheels.phoneLog.current', [])

.controller('PhoneCurrentController', function ($scope, alertService, telecomService) {

  loadCurrent();

  function loadCurrent () {
    alertService.load();
      telecomService.getCurrentCalls().then(function (calls) {
      $scope.calls = calls;
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  }

});
