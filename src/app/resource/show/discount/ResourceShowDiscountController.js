'use strict';

angular.module('openwheels.resource.show.discount', [])

.controller( 'ResourceShowDiscountController', function ($location, $state, $stateParams, $scope, dialogService, alertService, discountService, discounts) {

  $scope.discounts = discounts;

  $scope.params = {
    validFrom: $stateParams.validFrom || '',
    validUntil: $stateParams.validUntil || '',
    multiple: $stateParams.multiple === 'true' || false,
    global: $stateParams.global === 'true' || false
  };

  $scope.dateConfig = {
    //model
    modelFormat: 'YYYY-MM-DD',
    formatSubmit: 'yyyy-mm-dd',

    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',

    //options
    selectMonths: true
  };

  $scope.refresh = function () {
    $state.go($state.current.name, $scope.params);
  };

  $scope.clear = function () {
    $location.search({});
  };

  $scope.disableDiscount = function (discount) {
    dialogService.showModal().then(function () {
      alertService.load();
      discountService.disable({ discount: discount.code })
      .then(function (result) {
        alertService.add('success', 'Discount disabled', 5000);
        discount.validUntil = result.validUntil;
      })
      .catch(alertService.addError)
      .finally(alertService.loaded);
    });
  };

});
