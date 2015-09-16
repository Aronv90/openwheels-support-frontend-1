'use strict';

angular.module('openwheels.trip.list', [])
.controller('TripJobsListController', function ($scope, jobs, eventSourceService){
  function update_job(event) {
    console.log(event);
  }
  eventSourceService.addEventListener('openwheels.ccome.jobstate_event', update_job);
  $scope.jobs = jobs;
});