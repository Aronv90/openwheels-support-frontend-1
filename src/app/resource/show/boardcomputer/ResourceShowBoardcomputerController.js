'use strict';

angular.module('openwheels.resource.show.boardcomputer', [])

.controller('ResourceShowBoardcomputerController', function ($scope, $log, $filter, $stateParams, resource, alertService, boardcomputerService, deviceService) {
  $scope.resource = resource;
  $scope.openDoor = function(resource) {
    var methodCall = (resource.boardcomputer === 'invers') ?
      deviceService.forceOpen({
        resource: resource.id
      }) :
      boardcomputerService.control({
        action: 'OpenDoorStartEnable',
        resource: resource.id
      });

    methodCall
    .then( function(result) {
      if(result === 'error') {
        return alertService.add('danger', result, 5000);
      }
      if(result.isNewlyCreated === false) {
        return alertService.add('success', 'Auto is bezig te openen', 3000);
      }
      return alertService.add('success', 'Auto wordt geopend', 3000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };

  $scope.closeDoor = function(resource) {
    var methodCall = (resource.boardcomputer === 'invers') ?
      deviceService.forceClose({
        resource: resource.id
      }) :
      boardcomputerService.control({
        action: 'CloseDoorStartDisable',
        resource: resource.id
      });

    methodCall
    .then( function(result) {
      if(result === 'error') {
        return alertService.add('danger', result, 5000);
      }
      if(result.isNewlyCreated === false) {
        return alertService.add('success', 'Auto is bezig te sluiten', 3000);
      }
      return alertService.add('success', 'Auto wordt gesloten', 3000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };
})
;
