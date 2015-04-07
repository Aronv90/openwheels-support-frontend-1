'use strict';

angular.module('openwheels.person.show.vouchers.create_edit', [])

  .controller('PersonShowVouchersCreateEditController', function ($scope, $filter, $q, $modalInstance, dialogService, alertService, personService, voucher, person) {

    $scope.voucher = voucher;
    $scope.person = person;

    $scope.dismiss = function () {
      $modalInstance.dismiss();
    };

    $scope.save = function (voucher) {
      if (voucher.created) { // edit
        personService.alterVoucher({
          voucher: voucher.id,
          name: voucher.name
        })
        .then(function (voucher) {
          $modalInstance.close(voucher);
          alertService.add('success', 'voucher edited.', 2000);
        },
        function(error) {
          alertService.add('danger', 'Edit voucher failed: ' + error.message, 5000);
        }
        );

      } else { // create
        personService.addVoucher({person: person.id, name: voucher.name })
          .then(function ( voucher ) {
            $modalInstance.close( voucher );
            alertService.add('success', 'voucher created.', 2000);
          },
          function(error) {
            alertService.add('danger', 'voucher creation failed: ' + error.message, 5000);
          }
        );
      }
    };
  })

;
