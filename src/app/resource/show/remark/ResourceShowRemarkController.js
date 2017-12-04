'use strict';

angular.module('openwheels.resource.show.remarklog', [])

  .controller('ResourceShowRemarkController', function ($scope, $log, $filter, $stateParams, remarklog, resource, remarkService, perPage) {

    $scope.curPage = 1;
    $scope.perPage = perPage;
    $scope.offset = 0;
    $scope.resource = resource;

    handleRemarkLog(remarklog);

    function handleRemarkLog(remarklog) {
      $scope.remarklog = remarklog.result;
      $scope.lastPage = Math.ceil(remarklog.total / $scope.perPage);
    }

    $scope.nextPage = function() {
      $scope.offset = $scope.curPage * $scope.perPage;
      remarkService.forResource(_.extend({}, {resource: $scope.resource.id, limit: $scope.perPage, offset: $scope.offset }))
        .then(function(remarklog) {
          handleRemarkLog(remarklog);
          $scope.curPage = $scope.curPage + 1;
        });
    };

    $scope.prevPage = function() {
      $scope.offset = ($scope.curPage - 2) * $scope.perPage;
      remarkService.forResource(_.extend({}, {resource: $scope.resource.id, limit: $scope.perPage, offset: $scope.offset}))
        .then(function(remarklog) {
          handleRemarkLog(remarklog);
          $scope.curPage = $scope.curPage - 1;
        });
    };

    $scope.refresh = function() {
      remarkService.forResource(_.extend({}, {resource: $scope.resource.id, limit: $scope.perPage, offset: $scope.offset}))
        .then(function(remarklog) {
          handleRemarkLog(remarklog);
        });
    };

  })
;
