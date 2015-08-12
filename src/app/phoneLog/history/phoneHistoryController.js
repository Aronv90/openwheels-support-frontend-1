'use strict';

angular.module('openwheels.phoneLog.history', [])

.controller('PhoneHistoryController', function ($scope, alertService, phonecallService) {

  loadHistory();

  function loadHistory () {
    alertService.load();
    phonecallService.getRecentIncomingCalls().then(function (calls) {
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
