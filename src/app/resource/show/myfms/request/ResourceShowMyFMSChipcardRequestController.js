'use strict';

angular.module('openwheels.resource.show.myfmschipcard', [])

  .controller('ResourceShowMyFMSChipcardRequestController', function ($scope, $log, $filter, $stateParams, chipcardrequest, resource, chipcardService, perPage) {

    $scope.curPage = 1;
    $scope.perPage = perPage;
    $scope.resource = resource;

    handleChipCardRequests(chipcardrequest);

    function handleChipCardRequests(chipcardrequest) {
      $scope.chipcardrequest = chipcardrequest.result;
      $scope.lastPage = Math.ceil(chipcardrequest.total / $scope.perPage);
    }

    $scope.nextPage = function() {
      chipcardService.requests(_.extend({}, {resource: $scope.resource.id, limit: $scope.perPage, offset: $scope.curPage * $scope.perPage}))
        .then(function(chipcardrequest) {
          handleChipCardRequests(chipcardrequest);
          $scope.curPage = $scope.curPage + 1;
        });
    };

    $scope.prevPage = function() {
      chipcardService.requests(_.extend({}, {resource: $scope.resource.id, limit: $scope.perPage, offset: ($scope.curPage - 2) * $scope.perPage}))
        .then(function(chipcardrequest) {
          handleChipCardRequests(chipcardrequest);
          $scope.curPage = $scope.curPage - 1;
        });
    };

  })
;
