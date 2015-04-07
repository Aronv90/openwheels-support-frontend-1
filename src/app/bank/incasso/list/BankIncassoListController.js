'use strict';

angular.module('openwheels.bank.incasso.list', [])

  .controller('BankIncassoListController', function ($scope, $modal, $q, $filter, $timeout, ngTableParams, alertService, incassos, settingsService) {
    $scope.front_base = settingsService.settings.server;

//    $timeout(
//      function(){
    $scope.$watch('filter.$', function () {
      $scope.tableParams.reload();
    });
//      },
//      0
//    );

    $scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 25,          // count per page
        sorting: {
          created: 'desc'     // initial sorting
        }
      },
      {
        total: incassos.length, // length of data
        getData: function ($defer, params) {
          // use build-in angular filter
          var filteredData = $filter('filter')(incassos, $scope.filter);
          var orderedData = params.sorting() ?
            $filter('orderBy')(filteredData, params.orderBy()) :
            filteredData;
          var slicedData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

          angular.forEach(slicedData, function(value, key){
            slicedData[key].total = parseFloat(value.total);
          });

          $scope.incassos = slicedData;

          params.total(orderedData.length); // set total for recalc pagination
          // $defer.resolve($scope.incassos);
        }
      }
    );
  });
