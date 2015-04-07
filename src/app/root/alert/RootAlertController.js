'use strict';

angular.module('openwheels.root.alert.default', [])

.controller('RootAlertController', function ($state, $scope, $modal, alertService, personService, settingsService, serverSentEventService, bookingService) {
  $scope.closeAlert = alertService.closeAlert;

  $scope.$on('serverPhoneEvent', function(e, ringerData){
    if(settingsService.settings.ringerPopups){
      openModal(ringerData);
    }
  });

  var openModal = function(ringerData){
    $modal.open({
      templateUrl: 'root/alert/ringer/root-alert-ringer-dialog.tpl.html',
      controller: 'RootAlertRingerDialogController',
      windowClass: 'modal--xl',
      resolve: {
        ringerData: function() {
          return ringerData;
        },
        ringer: function() {
          return personService.getByPhone({
            id: ringerData.tel
          });
        }
      }
    }).result.then(function (personId) {
      $state.go('root.person.show.summary', {
        personId: personId
      });
    });
  };

  /*openModal({
    tel: '0610721180'
  });*/

})

;
