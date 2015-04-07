'use strict';

angular.module('openwheels.resource.show.revisions', [])

.controller('ResourceShowRevisionsController', function ($scope, alertService, resource, revisionsService) {

  $scope.fields        = [];
  $scope.revisions     = [];
  $scope.selectedField = null;

  // populate fields
  angular.forEach(resource, function (val, key) {
    $scope.fields.push(key);
  });

  // populate revisions
  alertService.load();
  revisionsService.revisions({
    id   : resource.id,
    type : 'OpenWheels\\ApiBundle\\Entity\\Resource'
  })
  .then(function (revisions) {
    $scope.revisions = revisions;
  })
  .finally(function () {
    alertService.loaded();
  });

});
