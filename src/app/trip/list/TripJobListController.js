'use strict';

angular.module('openwheels.trip.list', [])
.controller('TripJobsListController', function ($scope, jobs, eventSourceService, ccomeService){
  function update_job(event) {
    var eventData = JSON.parse(event.data);
    console.log(eventData);
    ccomeService.unfinishedJobs().then(function (data) {
      $scope.jobs = data;
    });
  }
  eventSourceService.addEventListener('openwheels.ccome.jobstate_event', update_job);
  $scope.jobs = jobs;
});