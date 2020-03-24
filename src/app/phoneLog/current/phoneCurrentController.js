'use strict';

angular.module('openwheels.phoneLog.current', [])

.controller('PhoneCurrentController', function ($scope, alertService, telecomService, $state, personService) {

  $scope.limit = 300;
  $scope.limitLow = 300;
  $scope.limitHigh = 2000;

  personService.get({person: 583599})
      .then(
          function(person){
              $scope.alertText = person.remark;
          });

  $scope.readMoreToggle = function() {
    if ($scope.limit === $scope.limitLow) {
      $scope.limit = $scope.limitHigh;
    } else {
      $scope.limit = $scope.limitLow;
    }
  };

  $scope.askQuestion = function (id)
  {
    $state.go('phoneLog.edit', { iCall: id });
  };

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
