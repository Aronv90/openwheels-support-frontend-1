'use strict';

angular.module('openwheels.person.show.badges', ['openwheels.person.show.badges.create_edit'])

  .controller('PersonShowBadgesController', function ($scope, $filter, $uibModal, alertService, dialogService, personService, person) {
    $scope.person = person;

    $scope.removeBadge = function (badge) {
      personService.removeBadge({badge: badge.id}).then(
        function(badge){
          alertService.add('success', 'badge ' + badge.name + '('+badge.id+') removed.', 2000);
          var foundBadge;
          foundBadge = $filter('getByProperty')('id', badge.id, $scope.person.badges);
          var index = $scope.person.badges.indexOf(foundBadge);
          $scope.person.badges.splice(index, 1);
        },
        function(error) {
          alertService.add('danger', 'removing ' + badge.name + '('+badge.id+') failed: ' + error.message, 3500);
        }
      );
    };

    $scope.createEditBadge = function (badge) {
      var newBadge;
      if (badge) {
        newBadge = false;
      } else {
        newBadge = true;
        badge = {};
      }
      $uibModal.open({
        templateUrl: 'person/show/badges/create_edit/person-show-badges-create-edit.tpl.html',
        windowClass: 'modal--xl',
        controller: 'PersonShowBadgesCreateEditController',
        resolve: {
          badge: function () {
            return badge;
          },
          person: function () {
            return person;
          }
        }
      }).result.then(function (badge) {
          if (true === newBadge) {
            $scope.person.badges.push(badge);
          } else {
            var foundBadge;
            foundBadge = $filter('getByProperty')('id', badge.id, $scope.person.badges);
            var index = $scope.person.badges.indexOf(foundBadge);
            $scope.person.badges[index] = badge;
          }
        });
    };
  });