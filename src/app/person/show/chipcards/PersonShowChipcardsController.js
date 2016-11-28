'use strict';

angular.module('openwheels.person.show.chipcards', ['openwheels.person.show.chipcards.create_edit'])

  .controller('PersonShowChipcardsController', function ($scope, $filter, $uibModal, alertService, dialogService, chipcardService, person, chipcards, fish) {
    $scope.chipcards = chipcards;
    $scope.fish = fish;
    $scope.person = person;

    $scope.block = function (chipcard) {
      var dialogOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'OK',
        headerText: 'Are you sure?',
        bodyText: 'Do you really want to block this chipcard?'
      };

      dialogService.showModal({}, dialogOptions)
      .then(function () { // OK is clicked
        return chipcardService.block({id: chipcard.mifareUid});
      })
      .then(function (updatedChipcard) {
        // block chipcard success
        $scope.chipcards[$scope.chipcards.indexOf(chipcard)] = updatedChipcard;
      },
      function (error) {

        // block chipcard failed
      });
    };

    $scope.unblock = function (chipcard) {
      var dialogOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'OK',
        headerText: 'Are you sure?',
        bodyText: 'Do you really want to unblock this chipcard?'
      };

      dialogService.showModal({}, dialogOptions)
      .then(function () { // OK is clicked
        return chipcardService.unblock({id: chipcard.mifareUid});
      })
      .then(function (updatedChipcard) {
        // block chipcard success
        $scope.chipcards[$scope.chipcards.indexOf(chipcard)] = updatedChipcard;
      },
      function (error) {

        // unblock chipcard failed
      });
    };

    $scope.createFish = function () {
      chipcardService.createFish({person: $scope.person.id})
        .then(
        function (fish) {
          alertService.add('success', 'Fish created', 2000);
          $scope.fish = fish;
        },
        function (error) {
          alertService.add('danger', error.message, 5000);
        }
      );
    };


    $scope.deleteFish = function () {
      var dialogOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'OK',
        headerText: 'Are you sure?',
        bodyText: 'Do you really want to remove this persons\' ability to activate new chipcards?'
      };

      dialogService.showModal({}, dialogOptions)
        .then(function () {
          chipcardService.deleteFish({person: $scope.person.id})
            .then(
            function (returnedFish) {
              $scope.fish = returnedFish;
              alertService.add('success', 'Fish deleted', 2000);
            },
            function (error) {
              alertService.add('danger', error.message, 5000);
            }
          );
        });
    };


    $scope.createEditChipcard = function (chipcard) {
      var newChipcard;
      if (chipcard) {
        newChipcard = false;
      } else {
        newChipcard = true;
        chipcard = {};
      }
      $uibModal.open({
        templateUrl: 'person/show/chipcards/create_edit/person-show-chipcards-create-edit.tpl.html',
        windowClass: 'modal--xl',
        controller: 'PersonShowChipcardsCreateEditController',
        resolve: {
          chipcard: function () {
            return chipcard;
          },
          person: function () {
            return person;
          }
        }
      }).result.then(function (chipcard) {
          if (true === newChipcard) {
            $scope.chipcards.push(chipcard);
          } else {
            var foundChipcard;
            foundChipcard = $filter('getByProperty')('mifareUid', chipcard.mifareUid, $scope.chipcards);
            var index = $scope.chipcards.indexOf(foundChipcard);
            $scope.chipcards[index] = chipcard;
          }
        });
    };
  });