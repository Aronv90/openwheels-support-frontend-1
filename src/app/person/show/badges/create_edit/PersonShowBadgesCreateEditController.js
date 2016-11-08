'use strict';

angular.module('openwheels.person.show.badges.create_edit', [])

  .controller('PersonShowBadgesCreateEditController', function ($scope, $filter, $q, $uibModalInstance, dialogService, alertService, personService, badge, person) {

    $scope.badge = badge;
    $scope.person = person;

    $scope.dismiss = function () {
      $uibModalInstance.dismiss();
    };

    $scope.save = function (badge) {
      if (badge.created) { // edit
        personService.alterBadge({
          badge: badge.id,
          name: badge.name
        })
        .then(function (badge) {
          $uibModalInstance.close(badge);
          alertService.add('success', 'badge edited.', 2000);
        },
        function(error) {
          alertService.add('danger', 'Edit badge failed: ' + error.message, 5000);
        }
        );

      } else { // create
        personService.addBadge({person: person.id, name: badge.name })
          .then(function ( badge ) {
            $uibModalInstance.close( badge );
            alertService.add('success', 'badge created.', 2000);
          },
          function(error) {
            alertService.add('danger', 'badge creation failed: ' + error.message, 5000);
          }
        );
      }
    };
  })

;
