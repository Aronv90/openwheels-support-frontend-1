'use strict';

angular.module('openwheels.checklist.dashboard', ['googlechart'])
.controller('DashboardController', function ($scope, bookingService, ccomeService, $interval, googleChartApiPromise, $q) {
  var populateRitten = function(result) {
      var list = result[0];
      var data = $scope.chartData.data = new window.google.visualization.DataTable();
      data.addColumn('number', 'week');
      data.addColumn('number', 'own cars');
      data.addColumn('number', 'peer2peer cars');

      list.forEach(function(item) {
        data.addRow([item['weekNr'], new Date(item['rittenEigenAutos']), new Date(item['rittenP2pAutosS'])]);
      });
    },
    doUpdate = function () {
      bookingService.futureByNotActiveDriver().then(function (list) {
        $scope.notActiveDrivers = list;
      });

      bookingService.requested().then(function(list) {
        $scope.requested = list;
      });

      ccomeService.unfinishedJobs().then(function(list){
        $scope.unfinishedJobs = list;
      });

      $q.all([
        bookingService.bookingWeekKPIData(),
        googleChartApiPromise
      ]).then(populateRitten);
    };
    
  $scope.chartData = {
    'type': 'AreaChart',
    'displayed': true,
    'options': {
      'title': 'Trips per week',
      'isStacked': 'true',
      'displayExactValues': true,
      'vAxis': {
        'title': 'Trips',
        'gridlines': {
          'count': 5
        }
      },
      'hAxis': {
        'title': 'Week'
      }
    }
  };
  
  $interval(doUpdate, 30000);
  doUpdate();
});