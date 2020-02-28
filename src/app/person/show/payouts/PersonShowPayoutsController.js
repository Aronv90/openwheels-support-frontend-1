'use strict';

angular.module('openwheels.person.show.payouts', [])
.controller('PersonShowPayoutsController', function ($scope, payouts, dialogService, alertService, paymentService) {

  $scope.payouts = payouts;

  $scope.processPayout = function (payout) {
    dialogService.showModal()
    .then(function () {
      alertService.load();
      paymentService.processPayout({ payout: payout.id }).then(function (result) {
        /* update changes in $scope */
        angular.extend(payout, result);

      })
      .catch(alertService.addError)
      .finally(alertService.loaded);
    });
  };

  $scope.deletePayout = function (payout) {
    alertService.load();
    paymentService.deletePayout({ payout: payout.id }).then(function (result) {

      /* update changes in $scope */
      var index = payouts.indexOf(payout);
      if (index >= 0) {
        payouts.splice(index, 1);
      }

    })
    .catch(alertService.addError)
    .finally(alertService.loaded);
  };

});