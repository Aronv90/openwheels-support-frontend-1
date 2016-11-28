'use strict';

angular.module('openwheels.person.show.chipcards.create_edit', [])

  .controller('PersonShowChipcardsCreateEditController', function ($scope, $filter, $q, $uibModalInstance, dialogService, alertService, chipcardService, chipcard, person) {

    $scope.chipcard = chipcard;
    $scope.person = person;

    $scope.dismiss = function () {
      $uibModalInstance.dismiss();
    };

    $scope.save = function (chipcard) {
      if (chipcard.insertedOn) { // edit
        chipcardService.alter({
          id: chipcard.mifareUid,
          newProps: {
            description: chipcard.description,
            isOvfietsEnabled: chipcard.isOvfietsEnabled
          }
        })
        .then(function (chipcard) {
          $uibModalInstance.close(chipcard);
          $scope.chipcard = chipcard;
          alertService.add('success', 'Chipcard edited.', 2000);
        },
        function(error) {
          alertService.add('danger', 'Edit Chipcard failed: ' + error.message, 5000);
        }
        );

      } else { // create
        chipcardService.create({
          mifareUid: chipcard.mifareUid,
          person: person.id,
          description: chipcard.description
        })
        .then(function (chipcard) {
          $uibModalInstance.close(chipcard);
          $scope.chipcard = chipcard;
          alertService.add('success', 'Chipcard created.', 2000);
        },
        function(error) {
          alertService.add('danger', 'Chipcard creation failed: ' + error.message, 5000);
        }
        );
      }
    };
  })

;
