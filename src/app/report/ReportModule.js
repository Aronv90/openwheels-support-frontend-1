'use strict';

angular.module('openwheels.report', ['openwheels.report.report1'])

    .config(function ($stateProvider) {

      /**
       * person
       */
      $stateProvider.state('root.report', {
        url: '/report',
        views: {
          'main@': {
            templateUrl: 'report/list.tpl.html',
            controller: 'ReportListController'
          }
        },
        resolve: {
          reports: ['queryreportService', function (queryreportService) {
            return queryreportService.all();
          }]
        },
        role: 'ROLE_ADMIN'
      });

      /**
       * person/create
       */
      $stateProvider.state('root.report.report1', {
        url: '/report1',
        controller: 'Report1Controller',
        templateUrl: 'report/report1/report-report1.tpl.html',
        data: {pageTitle: 'Report 1'}
      });
      
      $stateProvider.state('root.report.execute', {
        url: '/:report',
        templateUrl: 'report/item.tpl.html',
        controller: 'ReportItemController',
        resolve: {
          report: ['queryreportService', '$stateParams', function (queryreportService, $stateParams) {
            return queryreportService.get({report: $stateParams.report});
          }],
          queries: ['storedqueryService', function (storedqueryService) {
            return storedqueryService.all();
          }]
        },
        role: 'ROLE_ADMIN'
      });
    })

    .controller('ReportListController', function ($scope, reports, queryreportService, $log, $state) {
      $scope.reports = reports;
      $scope.newReport = function(title) {
        queryreportService.create({name: title}).then(function (query) {
          $log.log(query);
          $state.go('root.report.execute', {report: query.id}, {reload: true});
        });
      };
    })
    
    .controller('ReportItemController', function ($scope, report, queries, queryreportService, $log) {
      $scope.report = report;
      $scope.queries = queries;
      
      queryreportService.execute({
        report: report.id
      }).then(function(data) {
        $scope.data = data;
      });
      
      $scope.addToReport = function (reportId, queryId) {
        $scope.data = null;
        queryreportService.addQuery({
          report: reportId,
          query: queryId
        }).then(function (result) {
          return queryreportService.execute({
            report: result.id
          });
        }).then(function (data) {
          $scope.data = data;
        });
      };
      $scope.remFromReport = function (reportId, queryId) {
        $scope.data = null;
        queryreportService.remQuery({
          report: reportId,
          query: queryId
        }).then(function (result) {
          return queryreportService.execute({
            report: result.id
          });
        }).then(function (data) {
          $scope.data = data;
        });
      };
    })

    ;
