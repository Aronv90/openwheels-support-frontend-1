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
  authService, personService, alertService, $window, $mdDialog, $mdMedia) {

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

  $scope.unlockPerson = function() {
    $window.scrollTo(0, 0);
    $mdDialog.show({
      fullscreen: $mdMedia('xs'),
      controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
        personService.get({person: person.id})
        .then(function(person) {
          $scope.person = person;
        });

        $scope.done = function() {
          $mdDialog.hide();
        };
        $scope.cancel = $mdDialog.cancel;
      }],
      templateUrl: 'trip/dashboard/unlock_account.tpl.html',
      clickOutsideToClose:true,
      locals: {
        person: $scope.person
      }
    })
    .then(function(res) {
      return personService.alter({
        id: $scope.person.id,
        newProps: {locked: false}
      })
      .then(function(res) {
        $scope.person.locked = res.locked;
        return alertService.add('success', 'Het account van de huurder is unlocked.', 5000);
      })
      .catch(function(err) {
        if(err && err.message) {
          alertService.add('warning', 'Het account van de huurder kon niet unlocked worden: ' + err.message, 5000);
        }
      });
    });
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
