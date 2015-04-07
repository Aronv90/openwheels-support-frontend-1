'use strict';

angular.module('openwheels.person.create', [])
  .controller('PersonCreateController', function ($scope, $state, alertService, personService) {
    $scope.master = {email: '', password:''};

    $scope.createPassword = function () {
      var password;
      var random;
      password = Math.random().toString(36).slice(-9);
      for(var i = 0; i < password.length; i++){
        random =Math.random();
        if(random > 0.5){
          password = password.substr(0, i)  + password.charAt(i).toUpperCase() + password.substr(i+1);
        }
      }
      $scope.newPerson.password = password;
    };


    $scope.reset = function () {
      $scope.newPerson = angular.copy($scope.master);
      // $scope.personCreateForm.$setPristine();
    };

    $scope.save = function (newPerson) {
      personService.subscribe({email: newPerson.email, password: newPerson.password})
        .then(function (returnedPerson) {
          alertService.add('success', 'Person created successfully', 2000);
          $state.go('root.person.show.data.personal', {
            personId: returnedPerson.id
          });
        },
        function (error) {
          alertService.add('danger', error.message, 5000);
          console.log(error);
        });
    };

    $scope.reset();
  });

