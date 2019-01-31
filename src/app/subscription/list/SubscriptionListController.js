'use strict';

angular.module('openwheels.subscription.list', [])

  .controller('SubscriptionListController', function ($scope, subscriptions, subscriptionService, $stateParams, $state, $location) {

    $scope.curPage = 1;
    $scope.perPage = 10;
    $scope.lastPage = 1;

    $scope.subscriptions = {};
    handleSubscriptions(subscriptions);

    $scope.subscriptionsOptions = [
      {label: 'Only Active', value: true},
      {label: 'All', value: false}
    ];

    $scope.subscriptionsOption = $scope.subscriptionsOptions[0];

    function handleSubscriptions(data) {
      $scope.subscriptions = data;
      $scope.lastPage = Math.ceil(data.total / $scope.perPage);
    }

    function buildParams() {
      var params = {};
      params.onlyActive = $scope.subscriptionsOption;
      return params;
    }

    $scope.nextPage = function() {
      subscriptionService.search(_.extend(buildParams(), {max: $scope.perPage, offset: $scope.curPage * $scope.perPage}))
        .then(function(result) {
          handleSubscriptions(result);
          $scope.curPage = $scope.curPage + 1;
        });
    };

    $scope.prevPage = function() {
      subscriptionService.search(_.extend(buildParams(), {max: $scope.perPage, offset: ($scope.curPage - 2) * $scope.perPage}))
        .then(function(result) {
          handleSubscriptions(result);
          $scope.curPage = $scope.curPage - 1;
        });
    };

    $scope.refresh = function () {
      subscriptionService.search(_.extend(buildParams(), {max: $scope.perPage, offset: 0}))
        .then(function(result) {
          handleSubscriptions(result);
          $scope.curPage = 1;
        });
    };

    $scope.clear = function () {
      $location.search({});
    };

    $scope.goToCreatePage = function () {
      $state.go('root.subscription.create');
    };
  });
