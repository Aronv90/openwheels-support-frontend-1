'use strict';

angular.module('openwheels.person.show.remarklog', [])

  .controller('PersonShowRemarkController', function ($scope, $log, $filter, $stateParams, remarklog, person, remarkService, perPage) {

    $scope.curPage = 1;
    $scope.perPage = perPage;
    $scope.offset = 0;
    $scope.person = person;

    handleRemarkLog(remarklog);

    function handleRemarkLog(remarklog) {
      $scope.remarklog = remarklog.result;
      $scope.lastPage = Math.ceil(remarklog.total / $scope.perPage);
    }

    $scope.nextPage = function() {
      $scope.offset = $scope.curPage * $scope.perPage;
      remarkService.forPerson(_.extend({}, {person: $scope.person.id, limit: $scope.perPage, offset: $scope.offset }))
        .then(function(remarklog) {
          handleRemarkLog(remarklog);
          $scope.curPage = $scope.curPage + 1;
        });
    };

    $scope.prevPage = function() {
      $scope.offset = ($scope.curPage - 2) * $scope.perPage;
      remarkService.forPerson(_.extend({}, {person: $scope.person.id, limit: $scope.perPage, offset: $scope.offset}))
        .then(function(remarklog) {
          handleRemarkLog(remarklog);
          $scope.curPage = $scope.curPage - 1;
        });
    };

    $scope.refresh = function() {
      remarkService.forPerson(_.extend({}, {person: $scope.person.id, limit: $scope.perPage, offset: $scope.offset}))
        .then(function(remarklog) {
          handleRemarkLog(remarklog);
        });
    };

  })
;
