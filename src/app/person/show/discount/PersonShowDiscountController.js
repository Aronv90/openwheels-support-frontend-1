'use strict';

angular.module('openwheels.person.show.discount', [])

.controller('PersonShowDiscountController', function ($location, $uibModal, $state, $stateParams, $scope, dialogService, alertService, discountService, discounts, perPage) {

  $scope.curPage = 1;
  $scope.perPage = perPage;
  handleDiscounts(discounts);

  function handleDiscounts(discounts) {
    $scope.discounts = discounts.result;
    $scope.lastPage = Math.ceil(discounts.total / $scope.perPage);
  }

  function buildParams() {
    var params = {};
    params.recipient = $stateParams.personId;
    if ($stateParams.validFrom) { params.validFrom = $stateParams.validFrom; }
    if ($stateParams.validUntil) { params.validUntil = $stateParams.validUntil; }
    params.multiple = $stateParams.multiple === 'true' || null;
    params.global = $stateParams.global === 'true' || null;

    return params;
  }

  $scope.nextPage = function() {
    discountService.search(_.extend(buildParams(), {limit: $scope.perPage, offset: $scope.curPage * $scope.perPage}))
    .then(function(discounts) {
      handleDiscounts(discounts);
      $scope.curPage = $scope.curPage + 1;
    });
  };

  $scope.prevPage = function() {
    discountService.search(_.extend(buildParams(), {limit: $scope.perPage, offset: ($scope.curPage - 2) * $scope.perPage}))
    .then(function(discounts) {
      handleDiscounts(discounts);
      $scope.curPage = $scope.curPage - 1;
    });
  };

  $scope.params = {
    recipient: $stateParams.personId,
    validFrom: $stateParams.validFrom || '',
    validUntil: $stateParams.validUntil || '',
    multiple: $stateParams.multiple === 'true' || 'false',
    global: $stateParams.global === 'true' || 'false'
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
