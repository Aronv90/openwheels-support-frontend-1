'use strict';

angular.module('openwheels.phoneLog.current', [])

.controller('PhoneCurrentController', function ($scope, alertService, telecomService) {

  $scope.checkOutPerson = function( call )
  {
    // Assign this person to the admin taking the call
    telecomService.assignAdmin({ iCall: call.id, iPerson: call.person_id })

    // Go to check out the person
    $state.go('root.person.show.summary', { personId: call.person_id });
  }

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
