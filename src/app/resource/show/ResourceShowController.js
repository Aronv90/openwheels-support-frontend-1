'use strict';

angular.module('openwheels.resource.show', [
  'openwheels.resource.show.summary',
  'openwheels.resource.show.rating',
  'openwheels.resource.show.members',
  'openwheels.resource.show.boardcomputer',
  'openwheels.resource.show.ccom',
  'openwheels.resource.show.log',
  'openwheels.resource.show.revisions',
  'openwheels.resource.show.tripdata'
])

.controller('ResourceShowController', function ($scope, $stateParams, $modal, alertService, dialogService, resourceService, resource, settingsService, FRONT_RENT, FRONT_SWITCHUSER) {
  $scope.resource = resource;
  $scope.frontResources = settingsService.settings.server + FRONT_RENT + '/' + ( resource.city ? resource.city : 'onbekend' ) + '/' + resource.id + '/wijzigen' + FRONT_SWITCHUSER;

  $scope.bookResource = function(resource){
    $modal.open({
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
})

;
