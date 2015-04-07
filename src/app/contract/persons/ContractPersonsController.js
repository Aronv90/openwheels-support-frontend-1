'use strict';

angular.module('openwheels.contract.persons', [])

.controller('ContractPersonsController', function ($scope, $filter, $modalInstance, dialogService, alertService,
                                                   contractService, personService, contract, person) {

    $scope.contract = contract;
    $scope.person = person;

    /**
     * Filter contracts list
     */
    $scope.filterPerson =  function(person) {
      return function( item ) {
        return person.id !== item.id;
      };
    };

    /**
     * Typeahead Person
     */
    $scope.searchPersons = function ($viewValue) {
      return personService.search({
        search: $viewValue
      });
    };

    $scope.formatPerson = function ($model) {
      var inputLabel = '';
      if ($model) {
        inputLabel = $filter('fullname')($model) + ' [' + $model.id + ']';
      }
      return inputLabel;
    };

    $scope.dismiss = function () {
      $modalInstance.dismiss();
    };

    $scope.addPerson = function (newPerson) {
      contractService.addPerson({id: contract.id, person: newPerson.id})
        .then(function (updatedContract) {
          $scope.contract.persons = updatedContract.persons;
          alertService.add('success', 'Person added', 2000);
        }, function (error) {
          alertService.add('danger', error.message, 5000);
        });
    };

    $scope.removePerson = function (person) {
      var idx;
      idx = $scope.contract.persons.indexOf(person);

      dialogService.showModal({}, {
        closeButtonText: 'Cancel',
        actionButtonText: 'OK',
        headerText: 'Are you sure?',
        bodyText: 'Do you really want to remove ' + person.firstName + ' ' + person.surname +  '?'
      })
      .then(function(){
        return contractService.removePerson({id: contract.id, person: contract.persons[idx].id});
      })
      .then(function () {
        $scope.contract.persons.splice(idx, 1);
        alertService.add('success', 'Person removed', 2000);
      }, function (error) {
        alertService.add('danger', error.message, 5000);
      });
    };

  })
;
