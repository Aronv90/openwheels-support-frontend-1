'use strict';

angular.module('openwheels.person.show.vouchers', [])

.controller('PersonShowVouchersController', function ($q, $modal, $scope, alertService, voucherService, person) {

  $scope.person = person;
  $scope.vouchers = null;
  $scope.requiredValue = null;
  $scope.credit = null;
  $scope.debt = null;

  reload();

  function reload () {
    alertService.load();
    $q.all([ getVouchers(), getRequiredValue(), getCredit(), getDebt() ]).finally(function () {
      alertService.loaded();
    });
  }

  $scope.showRequiredValueDetails = function (requiredValue) {
    $modal.open({
      templateUrl: 'person/show/vouchers/requiredValuePopup.tpl.html',
      controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.requiredValue = requiredValue;
        $scope.close = $modalInstance.close;
      }]
    });
  };

  function getVouchers () {
    $scope.vouchers = null;
    var promise = voucherService.search({ person: person.id });
    promise.then(function (vouchers) {
      $scope.vouchers = vouchers;
    })
    .catch(function (err) {
      $scope.vouchers = [];
    });
    return promise;
  }

  function getRequiredValue () {
    $scope.requiredValue = null;
    var promise = voucherService.calculateRequiredCredit({ person: person.id });
    promise.then(function (value) {
      $scope.requiredValue = { value: value };
    })
    .catch(function (err) {
      $scope.requiredValue = { error: err };
    });
    return promise;
  }

  function getCredit () {
    $scope.credit = null;
    var promise = voucherService.calculateCredit({ person: person.id });
    promise.then(function (credit) {
      $scope.credit = { value: credit };
    })
    .catch(function (err) {
      $scope.credit = { error: err };
    });
    return promise;
  }

  function getDebt () {
    $scope.debt = null;
    var promise = voucherService.calculateDebt({ person: person.id });
    promise.then(function (debt) {
      $scope.debt = { value: debt };
    })
    .catch(function (err) {
      $scope.debt = { error: err };
    });
    return promise;
  }

  $scope.createVoucher = function (value) {
    if (Math.round(value) !== value) {
      return alertService.add('danger', 'Whole numbers only', 3000);
    }

    alertService.load();

    voucherService.createVoucher({
      person: person.id,
      value: value,
      free: true // user doesn't have to pay for this
    })
    .then(function (res) {
      alertService.add('success', 'The voucher was successfully created!', 5000);
      $scope.voucherValue = 0;
      reload();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  };

  /**
   * Force server side recalculation of required value
   */
  $scope.recalculate = function () {
    alertService.load();

    voucherService.recalculate({ person: person.id })
    .then(getRequiredValue)
    .catch(alertService.addError)
    .finally(alertService.loaded);
  };

});
