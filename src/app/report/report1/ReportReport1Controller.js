'use strict';

angular.module('openwheels.report.report1', [
])

.controller('Report1Controller', function ($window, $scope, settingsService) {
  $scope.timeFrame = {};
  $scope.timeFrame.from = moment( moment().format('YYYY') + '-01-01');
  $scope.timeFrame.to = moment();

  $scope.reportDateConfig = {
    //model
    modelFormat: 'YYYY-MM-DD',
    formatSubmit: 'yyyy-mm-dd',

    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',

    //options
    selectMonths: true
  };


  $scope.openReport = function openReport(timeFrame) {
    $window.open( settingsService.settings.server + '/overview/' + moment(timeFrame.from).format('YYYY-MM-DD') + '/' + moment(timeFrame.to).format('YYYY-MM-DD'));
  };
})

;
