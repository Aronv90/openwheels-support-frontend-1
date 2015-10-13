'use strict';

angular.module('openwheels.checklist.dashboard', ['googlechart'])
.controller('DashboardController', function ($scope, bookingService, ccomeService, $interval, googleChartApiPromise, $q) {
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
  $scope.chartData = {
    'type': 'AreaChart',
    'displayed': true,
    'options': {
      'title': 'ritten per week',
      'isStacked': 'true',
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
  
  $q.all([bookingService.bookingWeekKPIData(), googleChartApiPromise])
  .then(function(result) {
    var list = result[0];
    var data = $scope.chartData.data = new window.google.visualization.DataTable();
    data.addColumn('number', 'week');
    data.addColumn('number', 'eigen autos');
    data.addColumn('number', 'pear 2 pear autos');
    
    list.forEach(function(item) {
      data.addRow([item['weekNr'], parseInt(item['rittenEigenAutos']), parseInt(item['rittenP2pAutosS'])]);
    });
  });
  
  
  $interval(doUpdate, 30000);
  doUpdate();
});