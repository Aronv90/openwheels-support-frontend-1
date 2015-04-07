'use strict';

angular.module('openwheels.person.edit.data.phonenumber.list', [])

  .controller('PersonEditPhonenumberListController', function ($scope, $modal, $q, alertService, personService, person) {

    $scope.phoneNumbers = person.phoneNumbers;

    $scope.addPhone = function() {
      $scope.createEditPhone();
    };

    $scope.editPhone = function(phone) {
      $scope.createEditPhone(phone);
    };


    $scope.createEditPhone = function (phone) {
      var newPhone = false;
      if(!phone) { newPhone = true; phone = {}; }
      $modal.open({
        templateUrl: 'person/edit/phonenumber/create_edit/person-edit-phone-create_edit.tpl.html',
        windowClass: 'modal--xl',
        controller: 'PersonEditPhonenumberCreateEditController',
        resolve: {
          phone: function () {
            return phone;
          },
          person: function () {
            return person;
          }
        }
      }).result.then(function (returnedPhone) {
          if(newPhone){
            $scope.phoneNumbers.push(returnedPhone);
          }else{
            var idx = $scope.phoneNumers.indexOf(phone);
            $scope.phoneNumbers[idx] = returnedPhone;
          }
        });
    };

    $scope.removePhone = function removePhone(phone) {
      personService.removePhone({id: phone.id}).then(
        function (result) {
          alertService.add('success', 'Phonenumber removed.', 2000);
          var idx = $scope.phoneNumbers.indexOf(phone);
          $scope.phoneNumbers.splice(idx, 1);
        },
        function (error) {
          alertService.add('danger', 'Removing phonenumber failed: ' + error.message, 5000);
        }
      );
    };

  })
;
