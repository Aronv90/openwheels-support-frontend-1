'use strict';

angular.module('openwheels.resource.show.boardcomputer', [])

.controller('ResourceShowBoardcomputerController', function ($scope, $log, $filter, $stateParams, resource, booking, alertService, boardcomputerService) {
  $scope.resource = resource;
  $scope.openDoor = function(resource) {
    boardcomputerService.control({
      action: 'OpenDoorStartEnable',
      resource: resource.id,
      booking: booking ? booking.id : undefined
    })
    .then( function(result) {
      if(result === 'error') {
        return alertService.add('danger', result, 5000);
      }
      alertService.add('success', 'Boardcomputer opened door and enabled start', 3000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };

  $scope.closeDoor = function(resource) {
    boardcomputerService.control({
      action: 'CloseDoorStartDisable',
      resource: resource.id,
      booking: booking ? booking.id : undefined
    })
    .then( function(result) {
      if(result === 'error') {
        return alertService.add('danger', result, 5000);
      }
      alertService.add('success', 'Boardcomputer closed door and disabled start', 3000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };
})
;
