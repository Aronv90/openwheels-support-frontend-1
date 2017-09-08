'use strict';

angular.module('openwheels.person.show', [
  'openwheels.person.show.summary',
  'openwheels.person.edit.data',
  'openwheels.person.show.contracts',
  'openwheels.person.show.chipcards',
  'openwheels.person.show.rating',
  'openwheels.person.show.badges',
  'openwheels.person.show.messages',
  'openwheels.person.show.vouchers',
  'openwheels.person.show.revisions',
  'openwheels.person.show.actions'
  //'openwheels.trip.list'
])

.controller('PersonShowController', function ($scope, person, settingsService, FRONT_DASHBOARD, FRONT_SWITCHUSER, authService) {

  $scope.person = person;
  $scope.user = authService.user;
  $scope.frontDashboard = settingsService.settings.server + FRONT_DASHBOARD + FRONT_SWITCHUSER;
  
});
