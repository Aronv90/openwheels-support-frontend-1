'use strict';

angular.module('openwheels.resource.show.tripdata', ['infinite-scroll'])

.controller('ResourceShowTripdataController', function ($modal, $scope, $log, API_DATE_FORMAT,
  alertService, boardcomputerService, resource) {

  var loading = false,
      offset = 0,
      limit = 20;

  $scope.records = [];
  $scope.moreData = function () {
    if(!loading){
      $log.debug('load more tripdata');

      loading = boardcomputerService.tripdata({
        resource: $scope.resource.id,
        limit: limit,
        offset: offset + limit
      })
      .then(function (data) {
        loading = false;
        offset += limit;
        $scope.records = $scope.records.concat(data);
        $log.debug('added tripdata ' + data.length + ' records');
        return data;
      });
    }
  };

  $scope.showEditPopup = function (record) {
    $modal.open({
      templateUrl: 'resource/show/tripdata/popup.tpl.html',
      controller: ['$scope', '$modalInstance', 'bookingService', function ($scope, $modalInstance, bookingService) {

        $scope.entry = angular.copy(record);
        $scope.close = $modalInstance.close;
        $scope.suggestedBookings = [];

        loadSuggestedBookings();

        // TODO
        $scope.save = function () {
          // alertService.load();
          // tripDataService.alter({
          //   id: record.id,
          //   newProps: {
          //     bookingId: $scope.entry.bookingId
          //   }
          // })
          // .then(function (altered) {
          //   angular.extend(record, $scope.entry);
          //   $modalInstance.close();
          // })
          // .catch(function (err) {
          //   alertService.add('danger', error.message, 5000);
          // })
          // .finally(function () {
          //   alertService.loaded();
          // });
        };

        function loadSuggestedBookings() {
          var t1 = moment(record.startDatetime).subtract(1, 'years');
          var t2 = moment(record.endDatetime).add(1, 'hours');

          alertService.load();

          bookingService.forResource({
            resource: resource.id,
            timeFrame: {
              startDate: t1.format(API_DATE_FORMAT),
              endDate  : t2.format(API_DATE_FORMAT)
            }
          })
          .then(function (bookings) {
            $scope.suggestedBookings = bookings;
          })
          .finally(function () {
            alertService.loaded();
          });
        }
      }]
    });
  };

});