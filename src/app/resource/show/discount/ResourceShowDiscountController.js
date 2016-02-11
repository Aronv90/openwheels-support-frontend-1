'use strict';

angular.module('openwheels.resource.show.discount', [])

.controller( 'ResourceShowDiscountController', function ($location, $state, $stateParams, $scope, dialogService, alertService, discountService, discounts) {

  $scope.discounts = discounts;

  $scope.disableDiscount = function (discount) {
    dialogService.showModal().then(function () {
      alertService.load();
      discountService.disable({ discount: discount.code }).then(function (result) {
        alertService.add('success', 'Ok', 5000);

        /* update changes in $scope */
        var index = discounts.indexOf(discount);
        if (index >= 0) {
          discounts.splice(index, 1);
        }

      })
      .catch(alertService.addError)
      .finally(alertService.loaded);
    });
  };

});
