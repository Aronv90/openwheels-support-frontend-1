'use strict';

angular.module('openwheels.checklist.dashboard', ['googlechart'])
.controller('DashboardController', function (
          $scope,
          bookingService,
          ccomeService,
          $interval,
          googleChartApiPromise,
          $q,
          storedqueryService,
          queries,
          $log
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
    resolveDot = function (row, resolveto) {
      var elms = resolveto.split('.');
      for(var i in elms) {
        row = row[elms[i]];
      }
      return row;
    },
    doUpdate = function () {
      var queryResults = queries.map(function (query) {
        var data = storedqueryService.execute({
          storedquery: query.query.id,
          limit: 5
        }).then(function (data) {
          var result = data.result.map(function(row) {
            var result = {};
            for(var key in query.fieldmap) {
              result[key] = resolveDot(row, query.fieldmap[key]);
            }
            return result;
          });
          return {
            total: data.total,
            result: result,
            title: query.title
          };
        });
        return data;
      });
      
      $q.all(queryResults).then(function(result) {
        $scope.queries = result;
      });
      
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
    
  //queries.forEach($log.log);
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
