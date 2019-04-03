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
  return function (query, limit, offset = 0) {
    var data = storedqueryService.unmuted({
        storedquery: query.query.id,
        limit: limit,
        offset: offset
      }).then(function (data) {
        var result = data.result.map(function(row) {
          var result = {};
          for(var i in query.fieldmap) {
            if(query.fieldmap[i].key) {
              result._key = resolveDot(row, query.fieldmap[i].path);
            }
            result[query.fieldmap[i].title] = {
              link: query.fieldmap[i].link,
              value: resolveDot(row, query.fieldmap[i].path)
            };
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
.controller('SnoozablechecklistController', function ($scope, $log, storedqueryService, $uibModal, $interval,
  resolveMutingQuery, $state) {

  var doUpdate = function () {
      $log.debug('timer gone off, querieng');
      resolveMutingQuery($scope.query, $scope.limit)
      .then(function(result) {
        $scope.refreshing = false;
        $scope.result = result;
      });
    },
    intervalHandle = $interval(doUpdate(), $scope.query.refresh * 1000);
    
  $scope.refreshList = function() {
    $scope.refreshing = true;
    doUpdate();
  };

  $scope.loadMore = function(offset = 0) {
    resolveMutingQuery($scope.query, $scope.limit, offset)
    .then(function(result) {
      $scope.result.result = $scope.result.result.concat(result.result);
    });
  };

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
    $uibModal.open({
      templateUrl: 'checklist/dashboard/snoze.tpl.html',
      controller: ['$scope', 'storedqueryService', function ($scope, storedqueryService) {
        $scope.isMorning = moment().isBefore(moment('12', 'HH'));
        $scope.snooze = function (timeout) {
          storedqueryService.mute({
            storedquery: query,
            key: key,
            until: timeout
          });
          row._class = 'warning';
          this.$close();
        };
        $scope.close = function () {
          console.log('sluit');
          this.$close();
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
  
  $scope.execute = function(obj) {
    if(obj.link === 'person') {
      $log.debug('linking to person '  + obj.value);
      $state.go('root.person.show.summary', {personId: obj.value});
      return;
    }
    if(obj.link === 'personInvs') {
      $log.debug('linking to person invoises '  + obj.value);
      $state.go('root.person.show.invoiceGroupV2.list', {personId: obj.value});
      return;
    }
    if(obj.link === 'booking') {
      $log.debug('linking to booking '  + obj.value);
      $state.go('root.trip.dashboard', {tripId: obj.value});
      return;
    }
    if(obj.link === 'resource') {
      $log.debug('linking to resource '  + obj.value);
      $state.go('root.resource.show.summary', {resourceId: obj.value});
      return;
    }
  };
  
  doUpdate();
});
