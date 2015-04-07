'use strict';

angular.module('openwheels.root.alert.ringer', [])

.controller('RootAlertRingerDialogController', function ($scope, $modalInstance, ringerData, ringer, bookingService) {
  console.log('modal');
  $scope.ringerData = ringerData;
  $scope.person = ringer;

  $scope.dismiss = function () {
    $modalInstance.dismiss();
  };

  $scope.goToPerson = function(personId) {
    $modalInstance.close(personId);
  };

  var startDate = moment().subtract('w',2);
  var endDate = moment().add('w', 2);

  bookingService.getBookingList({
    person: ringer.id,
    timeFrame: {
      startDate: startDate.format('YYYY-MM-DD HH:mm'),
      endDate: endDate.format('YYYY-MM-DD HH:mm')
    }
  })
  .then(function(response){
    $scope.bookings = response;
  });

})

;


