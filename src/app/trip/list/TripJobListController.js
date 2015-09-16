'use strict';

angular.module('openwheels.trip.list', [])
.controller('TripJobsListController', function ($scope, jobs, eventSourceService, bookingService){
  function update_job(event) {
    var eventData = JSON.parse(event.data);
    console.log(eventData);
    bookingService.allLateBack().then(function (data) {
      $scope.jobs = data;
    });
  }
  eventSourceService.addEventListener('openwheels.ccome.jobstate_event', update_job);
  $scope.jobs = jobs;
});