'use strict';

angular.module('bookingDate', [])

  .directive('bookingDate', function($filter, $compile) {
    return {
      restrict: 'E',
      scope: {
        booking: '=',
        type: '@',
      },
      controller: function ($scope) {
        var start, end;
        var now = moment();

        if(!$scope.type || $scope.type === 'booking') {
          start = moment($scope.booking.beginBooking);
          end = moment($scope.booking.endBooking);
        } else if($scope.type === 'requested') {
          start = moment($scope.booking.beginRequested);
          end = moment($scope.booking.endRequested);
        } else if($scope.type === 'trip') {
          start = moment($scope.booking.trip.begin);
          end = moment($scope.booking.trip.end);
        } else {
          start = end = now;
        }

        $scope.startfull = start.format('DD-MM-YYYY HH:mm');
        $scope.start = start.format('DD-MM');
        if(now.year() !== start.year()) {
          $scope.start += start.format('-YYYY');
        }
        $scope.start += start.format(' HH:mm');

        if(!now.isSame(end)) { // if end is undefined, it will be the same as now
          $scope.end = '';
          $scope.endfull = end.format('DD-MM-YYYY HH:mm');
          if(end.day() !== start.day() || start.month() !== end.month()) {
            $scope.end += end.format('DD-MM');
          }
          if(end.year() !== start.year()) {
            $scope.end += end.format('-YYYY');
          }
          $scope.end += end.format(' HH:mm');
        }
      },
      template: '<span title="{{startfull}}">{{start}}</span><span ng-if="end" title="{{endfull}}"> | {{end}}</span>',
    };
  });
