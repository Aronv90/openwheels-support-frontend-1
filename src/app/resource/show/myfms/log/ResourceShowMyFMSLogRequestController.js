'use strict';

angular.module('openwheels.resource.show.myfmslog', [])

  .controller('ResourceShowMyFMSLogRequestController', function ($scope, $log, $filter, $stateParams, logrequest, resource, chipcardService, perPage) {

    $scope.curPage = 1;
    $scope.perPage = perPage;
    $scope.offset = 0;
    $scope.resource = resource;

    handleLogRequests(logrequest);

    function handleLogRequests(logrequest) {
      $scope.logrequest = logrequest.result;
      $scope.lastPage = Math.ceil(logrequest.total / $scope.perPage);
    }

    $scope.nextPage = function() {
      $scope.offset = $scope.curPage * $scope.perPage;
      chipcardService.logs(_.extend({}, {resource: $scope.resource.id, limit: $scope.perPage, offset: $scope.offset }))
        .then(function(logrequest) {
          handleLogRequests(logrequest);
          $scope.curPage = $scope.curPage + 1;
        });
    };

    $scope.prevPage = function() {
      $scope.offset = ($scope.curPage - 2) * $scope.perPage;
      chipcardService.logs(_.extend({}, {resource: $scope.resource.id, limit: $scope.perPage, offset: $scope.offset}))
        .then(function(logrequest) {
          handleLogRequests(logrequest);
          $scope.curPage = $scope.curPage - 1;
        });
    };

    $scope.refresh = function() {
      chipcardService.logs(_.extend({}, {resource: $scope.resource.id, limit: $scope.perPage, offset: $scope.offset}))
        .then(function(logrequest) {
          handleLogRequests(logrequest);
        });
    };

  })
;
