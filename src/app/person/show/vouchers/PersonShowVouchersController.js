'use strict';

angular.module('openwheels.person.show.vouchers', [])

.controller('PersonShowVouchersController', function ($q, $uibModal, $scope, alertService, voucherService, person, dialogService, paymentService) {

  $scope.person = person;
  $scope.vouchers = null;
  $scope.requiredValue = null;
  $scope.credit = null;
  $scope.debt = null;

  reload();

  function reload () {
    alertService.load();
    $q.all([ getVouchers(), getDisapprovedVouchers(), getRequiredValue(), getCredit(), getDebt() ]).finally(function () {
      alertService.loaded();
    });
  }

  $scope.showRequiredValueDetails = function (requiredValue) {
    $uibModal.open({
      templateUrl: 'person/show/vouchers/requiredValuePopup.tpl.html',
      controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
        $scope.requiredValue = requiredValue;
        $scope.close = $uibModalInstance.close;
      }]
    });
  };

  function getVouchers () {
    $scope.vouchers = null;
    var promise = voucherService.search({ person: person.id, minValue: 0 });
    promise.then(function (vouchers) {
      $scope.vouchers = vouchers;
    })
    .catch(function (err) {
      $scope.vouchers = [];
    });
    return promise;
  }

  function getDisapprovedVouchers () {
    $scope.vouchers = null;
    var promise = voucherService.search({ person: person.id, minValue: 0, approved: false });
    promise.then(function (vouchers) {
      $scope.disapprovedVouchers = vouchers;
    })
    .catch(function (err) {
      $scope.disapprovedVouchers = [];
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

  $scope.payoutVoucher = function (voucher) {
    alertService.load();
    
    paymentService.payoutVoucher({ voucher: voucher.id })
    .then(function (result) {
      return getVouchers(), getDisapprovedVouchers();
    })
    .catch(alertService.addError)
    .finally(alertService.loaded);
  };

  $scope.deleteVoucher = function (voucher) {
    dialogService.showModal().then(function () {
      alertService.load();
      voucherService.deleteVoucher({ voucher: voucher.id })
      .then(function (result) {
        alertService.add('success', 'Ok', 5000);

        /* update changes in $scope */
        var index = $scope.vouchers.indexOf(voucher);
        if (index >= 0) {
          $scope.vouchers.splice(index, 1);
        }

      })
      .catch(alertService.addError)
      .finally(alertService.loaded);
    });
  };
  
  $scope.deletePayments = function(voucher) {
    
    dialogService.showModal().then(function () {
      alertService.load();
      voucherService.removePayments({ voucher: voucher.id })
      .then(function (result) {
        alertService.add('success', 'Ok', 5000);
        voucher.payments = result.payments;
        voucher.value = result.value;

      })
      .catch(alertService.addError)
      .finally(alertService.loaded);
    });
  };

});
