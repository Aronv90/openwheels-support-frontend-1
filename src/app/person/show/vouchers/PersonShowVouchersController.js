'use strict';

angular.module('openwheels.person.show.vouchers', ['openwheels.person.show.vouchers.create_edit'])

  .controller('PersonShowVouchersController', function ($scope, $filter, $modal, alertService, dialogService, personService, person, vouchers) {
    $scope.person = person;
    $scope.vouchers = vouchers;

    $scope.removeVoucher = function (voucher) {
      personService.removeVoucher({voucher: voucher.id}).then(
        function(voucher){
          alertService.add('success', 'voucher ' + voucher.name + '('+voucher.id+') removed.', 2000);
          var foundVoucher;
          foundVoucher = $filter('getByProperty')('id', voucher.id, $scope.person.vouchers);
          var index = $scope.person.vouchers.indexOf(foundVoucher);
          $scope.person.vouchers.splice(index, 1);
        },
        function(error) {
          alertService.add('danger', 'removing ' + voucher.name + '('+voucher.id+') failed: ' + error.message, 3500);
        }
      );
    };

    $scope.createEditVoucher = function (voucher) {
      var newVoucher;
      if (voucher) {
        newVoucher = false;
      } else {
        newVoucher = true;
        voucher = {};
      }
      $modal.open({
        templateUrl: 'person/show/vouchers/create_edit/person-show-vouchers-create-edit.tpl.html',
        windowClass: 'modal--xl',
        controller: 'PersonShowVouchersCreateEditController',
        resolve: {
          voucher: function () {
            return voucher;
          },
          person: function () {
            return person;
          }
        }
      }).result.then(function (voucher) {
          if (true === newVoucher) {
            $scope.person.vouchers.push(voucher);
          } else {
            var foundVoucher;
            foundVoucher = $filter('getByProperty')('id', voucher.id, $scope.person.vouchers);
            var index = $scope.person.vouchers.indexOf(foundVoucher);
            $scope.person.vouchers[index] = voucher;
          }
        });
    };
  });