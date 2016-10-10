'use strict';

angular.module('openwheels.bank.incasso.show', [])

  .controller('BankIncassoShowController', function ($scope, $uibModal, $q, $filter, $timeout, ngTableParams, alertService, batch) {
    $scope.batch = batch;

    if (batch.rules) {
      $scope.tableParams = new ngTableParams({
          page: 1,            // show first page
          count: 25,          // count per page
          sorting: {
            created: 'desc'     // initial sorting
          }
        },
        {
          total: batch.rules.length, // length of data
          getData: function ($defer, params) {

            // use build-in angular filter
            var filteredData = $filter('filter')(batch.rules, $scope.filter);
            var orderedData = params.sorting() ?
              $filter('orderBy')(filteredData, params.orderBy()) :
              filteredData;

            $scope.rules = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

            params.total(orderedData.length); // set total for recalc pagination
            $defer.resolve($scope.rules);
          }
        }
      );
      $timeout(
        function(){
          $scope.$watch('filter.$', function () {
            $scope.tableParams.reload(); // Fix scope: null racecondition
          });
        },
        0
      );
    }
  });
