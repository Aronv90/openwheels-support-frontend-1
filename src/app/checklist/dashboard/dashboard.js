'use strict';

angular.module('openwheels.checklist.dashboard', ['googlechart', 'openwheels.checklist.directive'])
.controller('DashboardController', function (
          $scope,
          bookingService,
          $interval,
          googleChartApiPromise,
          $q,
          storedqueryService,
          queries,
          $log,
          $uibModal
        ) {
  var populateRitten = function(result) {
      var list = result[0];
      var data = $scope.chartData.data = new window.google.visualization.DataTable();
      data.addColumn('string', 'week');
      data.addColumn('number', 'own cars');
      data.addColumn('number', 'peer2peer cars');

      list.forEach(function(item) {
        data.addRow([item['weekNr'], parseInt(item['rittenEigenAutos']), parseInt(item['rittenP2pAutosS'])]);
      });
    },
    /*resolveDot = function (row, resolveto) {
      var elms = resolveto.split('.');
      for(var i in elms) {
        row = row[elms[i]];
      }
      return row;
    },*/
    doUpdate = function () {

      $q.all([
        bookingService.bookingWeekKPIData(),
        googleChartApiPromise
      ]).then(populateRitten);
    };
  $scope.queries = queries;
    
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

  //don't update to reduce number of calls
  //$interval(doUpdate, 30000);
  doUpdate();
});
