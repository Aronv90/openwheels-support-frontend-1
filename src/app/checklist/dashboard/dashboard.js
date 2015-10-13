'use strict';

angular.module('openwheels.checklist.dashboard', ['googlechart'])
.controller('DashboardController', function ($scope, bookingService, ccomeService, $interval, googleChartApiPromise) {
  var doUpdate = function () {
    bookingService.futureByNotActiveDriver().then(function (list) {
      $scope.notActiveDrivers = list;
    });

    bookingService.requested().then(function(list) {
      $scope.requested = list;
    });

    ccomeService.unfinishedJobs().then(function(list){
      $scope.unfinishedJobs = list;
    });
  };
  
  bookingService.bookingWeekKPIData().then(function(list) {
    googleChartApiPromise.then(function () {
      var data = new window.google.visualization.DataTable();
      $scope.chartData = {
        'type': 'AreaChart',
        'displayed': true,
        'data': data,
        'options': {
          'title': 'ritten per week',
          'isStacked': 'true',
    //      'fill': 20,
          'displayExactValues': true,
          'vAxis': {
            'title': 'Ritten',
            'gridlines': {
              'count': 5
            }
          },
          'hAxis': {
            'title': 'Week'
          }
        }
      };
      data.addColumn('number', 'week');
      data.addColumn('number', 'eigen autos');
      data.addColumn('number', 'pear 2 pear autos');
      
      list.forEach(function(item) {
        data.addRow([item['weekNr'], parseInt(item['rittenEigenAutos']), parseInt(item['rittenP2pAutosS'])]);
      });
    });
  });
  
  
  $interval(doUpdate, 30000);
  doUpdate();
});