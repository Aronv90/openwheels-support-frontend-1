'use strict';
angular.module('openwheels.checklist.directive', [])
.directive('snoozablechecklist', function (){
  return {
    restrict: 'E',
    scope: {
      query: '=',
      limit: '=',
      hideIfNull: '='
    },
    controller: 'SnoozablechecklistController',
    templateUrl: 'checklist/directives/checklist.tpl.html'
  };
})
.service('resolveMutingQuery', function ($log, storedqueryService) {
  var resolveDot = function (row, resolveto) {
      var elms = resolveto.split('.');
      for(var i in elms) {
        row = row[elms[i]];
      }
      return row;
    };
  return function (query, limit) {
    var data = storedqueryService.unmuted({
        storedquery: query.query.id,
        limit: limit
      }).then(function (data) {
        var result = data.result.map(function(row) {
          var result = {};
          for(var i in query.fieldmap) {
            if(query.fieldmap[i].key) {
              result._key = resolveDot(row, query.fieldmap[i].path);
            }
            result[query.fieldmap[i].title] = resolveDot(row, query.fieldmap[i].path);
          }
          return result;
        });
        return {
          id: query.query.id,
          total: data.total,
          result: result,
          title: query.title,
          column: query.fieldmap.map(function (x) { return x.title; })
        };
      });
    return data;
  };
})
.controller('SnoozablechecklistController', function ($scope, $log, storedqueryService, $modal, $interval, resolveMutingQuery) {
  var doUpdate = function () {
      $log.debug('timer gone off, querieng');
      resolveMutingQuery($scope.query, $scope.limit)
      .then(function(result) {
        $scope.result = result;
      });
    },
    intervalHandle = $interval(doUpdate, $scope.query.refresh * 1000);
    
  $scope.show = function () {
    if(!$scope.hideIfNull) {
      return true;
    }
    
    if(!$scope.result) {
      return false;
    }
    
    return $scope.result.total > 0;
  };
  
  $scope.$on('$destroy', function() {
    $interval.cancel(intervalHandle);
  });
  
  $scope.snooze = function (query, key, row) {
    $modal.open({
      templateUrl: 'checklist/dashboard/snoze.tpl.html',
      controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.snooze = function (timeout) {
          storedqueryService.mute({
            storedquery: query,
            key: key,
            until: timeout
          });
          row._class = 'warning';
          $modalInstance.dismiss();
        };
        $scope.close = function () {
          $modalInstance.dismiss();
        };
      }]
    });
  };
  $scope.done = function (query, key, row) {
    row._class = 'success';
    storedqueryService.mute({
      storedquery: query,
      key: key
    }).then(function(x) {
      $log.log(x);
    });
  };
  
  doUpdate();
});