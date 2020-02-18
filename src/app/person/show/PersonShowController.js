'use strict';

angular.module('openwheels.person.show', [
  'openwheels.person.show.summary',
  'openwheels.person.edit.data',
  'openwheels.person.show.contracts',
  'openwheels.person.show.chipcards',
  'openwheels.person.show.rating',
  'openwheels.person.show.badges',
  'openwheels.person.show.messages',
  'openwheels.person.show.messagesms',
  'openwheels.person.show.communication',
  'openwheels.person.show.vouchers',
  'openwheels.person.show.revisions',
  'openwheels.person.show.actions',
  'openwheels.person.show.remarklog'
  //'openwheels.trip.list'
])

.controller('PersonShowController', function ($scope, person, settingsService, FRONT_DASHBOARD, FRONT_SWITCHUSER,
  authService, personService, alertService) {

  $scope.hide = false;
  $scope.toggleHide = function() {
    if ($scope.user.identity.id !== 583599) {
      if (!$scope.hide) {
        $scope.hide = true;
      } else {
        $scope.hide = false;
      }
    }
  };

  $scope.person = person;
  $scope.user = authService.user;
  $scope.frontDashboard = settingsService.settings.server + FRONT_DASHBOARD + FRONT_SWITCHUSER;

  //save remark
  $scope.save = function () {
    personService.alter({
      id: $scope.person.id,
      newProps: {
        remark: $scope.person.remark
      }
    })
    .then(function (person) {
      alertService.add('success', 'De opmerking is opgeslagen.', 3000);
      $scope.person = person;
      $scope.toggleHide();
    })
    .catch(function (error) {
      alertService.add('danger', error.message, 5000);
    });
  };

});
