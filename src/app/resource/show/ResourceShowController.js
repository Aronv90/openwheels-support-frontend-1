'use strict';

angular.module('openwheels.resource.show', [
  'openwheels.resource.show.summary',
  'openwheels.resource.show.rating',
  'openwheels.resource.show.members',
  'openwheels.resource.show.discount',
  'openwheels.resource.show.discount.create',
  'openwheels.resource.show.damage',
  'openwheels.resource.show.reports',
  'openwheels.resource.show.maintenance',
  'openwheels.resource.show.boardcomputer',
  'openwheels.resource.show.log',
  'openwheels.resource.show.revisions',
  'openwheels.resource.show.tripdata',
  'openwheels.resource.show.myfmschipcard',
  'openwheels.resource.show.myfmslog',
  'openwheels.resource.show.remarklog'
])

.controller('ResourceShowController', function ($scope, $stateParams, $uibModal, $log, alertService, dialogService, resourceService,
  resource, settingsService, FRONT_RENT, FRONT_SWITCHUSER, authService) {

  $scope.hide = false;
  $scope.toggleHide = function() {
    if (!$scope.hide) {
      $scope.hide = true;
    } else {
      $scope.hide = false;
    }
  };

  $scope.user = authService.user;

  $scope.resource = resource;
  $scope.frontResources = settingsService.settings.server + FRONT_RENT + '/' + ( resource.city ? resource.city : 'onbekend' ) + '/' + resource.id + '/wijzigen' + FRONT_SWITCHUSER;

  resourceService.getParkingpermits({
    resource: resource.id
  }).then(function (permits) {
    $scope.permits = permits;
  });

  $scope.bookResource = function(resource){
    $uibModal.open({
      templateUrl: 'trip/create/trip-create.tpl.html',
      windowClass: 'modal--xl',
      controller: 'TripCreateController',
      resolve: {
        resource: function () {
          return resource;
        },
        person: function () {
          return {};
        }
      }
    });
  };

  $scope.removeResource = function(resource) {
    dialogService.showModal({}, {
      closeButtonText: 'Cancel',
      actionButtonText: 'OK',
      headerText: 'Are you sure?',
      bodyText: 'Do you really want to remove ' + resource.alias + '?'
    })
    .then(function(){
      resourceService.remove({id: resource.id})
        .then(
        function(returnedResource){
          $scope.resource = returnedResource;
          alertService.add('success', 'Resource successfully removed.', 2000);
        },
        function(error){
          alertService.add('danger', 'Remove resource failed: ' + error.message, 5000);
        });
    });
  };
  
  $scope.createParkingPermit = function(resource) {
    dialogService.showModal({
      templateUrl: 'resource/show/parkingpermit/parking-create.tpl.html'
    }, {
      headerText: 'Are you sure?',
      bodyText: 'Do you really want to create a parking permit for  ' + resource.alias + '?',
      cities: ['Den Haag', 'Rijswijk', 'Gooise Meren', 'Groningen', 'Haarlem', 'Leiden', 'Nijmegen', 'Tilburg', 'Utrecht']
    }).then(function (city){
      return resourceService.createParkingpermit({resource: resource.id, city: city});
    }).then(function (permit) {
      alertService.add('success', 'Parking permit created.', 2000);
      $scope.permits.push(permit);
    }, function(error) {
      alertService.add('danger', 'Parking permit not created: ' + error.message, 5000);
    });
  };

  $scope.updateParkingPermit = function (permit) {
    resourceService.search({owner: resource.owner.id})
    .then(function (resources) {
      $scope.resourceList = resources;
      resourceService.getMembers({resource: $scope.resource.id})
      .then(function (members) {
        return dialogService.showModal({
          templateUrl: 'resource/show/parkingpermit/parking-edit.tpl.html'
        }, {
          resource: $scope.resource,
          resourceList: $scope.resourceList,
          members: members,
          cities: ['Den Haag', 'Rijswijk', 'Gooise Meren', 'Groningen', 'Haarlem', 'Leiden', 'Nijmegen', 'Tilburg', 'Utrecht']
        });
      }).then(function (resource) {
        return resourceService.alterParkingpermit({
          parkingpermit: permit[0].id,
          resource: resource.id
        }).then(function(permit) {
          alertService.add('success', 'Parking permit created.', 2000);
          return [permit];
        }, function(error) {
          alertService.add('danger', 'Parking permit not created: ' + error.message, 5000);
        });
      });
    });
  };
  
  $scope.removeParkingPermit = function(permits) {
    dialogService.showModal({}, {
      headerText: 'Are you sure?',
      bodyText: 'Do you really want to remove the parking permit for  ' + resource.alias + '?'
    }).then(function (){
      return resourceService.removeParkingpermit({parkingpermit: permits[0].id});
    }).then(function () {
      alertService.add('success', 'Parking permit removed.', 2000);
      $scope.permits = [];
    }, function(error) {
      alertService.add('danger', 'Parking permit not removed: ' + error.message, 5000);
    });
  };

  //save remark
  $scope.save = function () {
    resourceService.alter({
      id: $scope.resource.id,
      newProps: {
        remark: $scope.resource.remark
      }
    })
    .then(function (resource) {
      alertService.add('success', 'De opmerking is opgeslagen.', 3000);
      $scope.resource = resource;
      $scope.toggleHide();
    })
    .catch(function (error) {
      alertService.add('danger', error.message, 5000);
    });
  };

});