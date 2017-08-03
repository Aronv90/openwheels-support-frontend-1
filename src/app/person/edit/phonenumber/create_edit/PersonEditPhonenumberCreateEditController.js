'use strict';

angular.module('openwheels.person.edit.data.phonenumber.create_edit', [])
  .controller('PersonEditPhonenumberCreateEditController', function ($scope, $uibModalInstance, personService,
                                                                     phone, person) {

    $scope.phone = phone;

    $scope.phoneTypeOptions = [
      {label: 'Mobile', value: 'mobile'},
      {label: 'Work', value: 'work'},
      {label: 'Home', value: 'home'}
    ];

    $scope.dismiss = function () {
      $uibModalInstance.dismiss();
    };

    $scope.save = function (phone) {
      if (phone.id) {
        personService.alterPhoneWithPhoneId({
          id: phone.id,
          newProps: {
            type: phone.type,
            number: phone.number,
            confidential: phone.confidential,
            verified: phone.verified
          }
        }).then(function (result) {
          $uibModalInstance.close(result);
        });
      } else {
        personService.addPhoneWithPersonId({
          id: person.id,
          number: phone.number,
          type: phone.type,
          confidential: phone.confidential,
          verified: phone.verified
        }).then(function (result) {
          $uibModalInstance.close(result);
        });
      }
    };
  });