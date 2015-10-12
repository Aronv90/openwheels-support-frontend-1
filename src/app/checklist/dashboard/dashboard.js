'use strict';

angular.module('openwheels.checklist.dashboard', [])
.controller('DashboardController', function ($scope, bookingService, ccomeService) {
  bookingService.futureByNotActiveDriver().then(function (list) {
    $scope.notActiveDrivers = list;
  });
  
  bookingService.requested().then(function(list) {
    $scope.requested = list;
  });
  
  ccomeService.unfinishedJobs().then(function(list){
    $scope.unfinishedJobs = list;
  });
});