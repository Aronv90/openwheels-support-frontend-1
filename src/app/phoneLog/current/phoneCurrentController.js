'use strict';

angular.module('openwheels.phoneLog.current', [])

.controller('PhoneCurrentController', function ($scope, alertService, telecomService, $state, personService) {

  personService.get({person: 583599})
      .then(
          function(person){
              $scope.alertText = person.remark;
          });

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
