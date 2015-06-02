'use strict';

angular.module('openwheels.trip.show.ccomlog', [])

.controller('TripShowLogBookingController', function ($scope, $modal, logs) {
  $scope.logs = logs;

  $scope.showContent = function(content){
    var scope = $scope.$new();
    $scope.content = content;

    var modal = $modal.open({
      templateUrl: 'trip/show/boardcomputer/log/trip-show-content.tpl.html',
      windowClass: 'modal--xl',
      scope: scope
    });

    $scope.cancel = function () {
      modal.dismiss('cancel');
    };

  };


});
