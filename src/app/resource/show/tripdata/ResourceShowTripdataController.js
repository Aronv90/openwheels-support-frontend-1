'use strict';

angular.module('openwheels.resource.show.tripdata', ['infinite-scroll'])

.controller('ResourceShowTripdataController', function ($scope, $log, boardcomputerService) {
  var loading = false,
      offset = 0,
      limit = 20;
      
  $scope.records = [];
  $scope.moreData = function () {
    if(!loading){
      $log.debug('load more tripdata');
      
      loading = boardcomputerService.tripdata({
        resource: $scope.resource.id,
        limit: limit,
        offset: offset + limit
      })
      .then(function (data) {
        loading = false;
        offset += limit;
        $scope.records = $scope.records.concat(data);
        $log.debug('added tripdata ' + data.length + ' records');
        return data;
      });
    }
  };
});