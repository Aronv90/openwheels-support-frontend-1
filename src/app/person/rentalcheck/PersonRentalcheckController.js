'use strict';
angular.module('openwheels.person.rentalcheck', [])
.controller('PersonRentalcheckController', function ($timeout, $scope, person, alertService, dialogService, rentalcheckService) {

  // properties

  $scope.person         = person;
  $scope.previousChecks = null;
  $scope.selectedCheck  = null;
  $scope.activeSection  = 'list';
  $scope.checkRequest   = {
    personId: person.id,
    type: 'extended', // basic, standard or extended
    includeDocumentCheck: true
  };

  // methods

  $scope.showDetail = showDetail;
  $scope.showCreate = showCreate;
  $scope.showList   = showList;

  loadPreviousChecks();

  function loadPreviousChecks () {

    alertService.load();
    rentalcheckService.previousChecks({
      person: person.id
    })
    .then(function (previousChecks) {
      $scope.previousChecks = previousChecks;
    })
    .catch(function (err) {
      alertService.add('danger', 'Error: ' + err.message, 5000);
    })
    .finally(function () {
      alertService.loaded();
    });
  }

  $scope.performCheck = function () {
    var warning = '';
    if ( ($scope.checkRequest.type !== 'basic') || $scope.checkRequest.includeDocumentCheck) {
      warning = 'Let op: dit kan geld kosten!';
    }
    dialogService.showModal({}, {
      closeButtonText: 'Nee',
      actionButtonText: 'Ja',
      headerText: 'RentalCheck',
      bodyText: 'Weet je het zeker?' + warning
    })
    .then(function () {

      alertService.load();
      rentalcheckService.checkPerson({
        person: person.id,
        type  : $scope.checkRequest.type,
        includeDocumentCheck : $scope.checkRequest.includeDocumentCheck
      })
      .then(function (result) {
        $scope.checkRequest = { personId : person.id };
        showDetail(result);
        loadPreviousChecks();
        $scope.showList();
        console.log('success', result);
      })
      .catch(function (err) {
        alertService.add('danger', 'Foutmelding: ' + err.message, 5000);
        console.log('error', err);
      })
      .finally(function () {
        alertService.loaded();
      });

    });
  };

  $scope.delete = function (rentalcheck) {
    var dialogOptions = {
      closeButtonText: 'Nee',
      actionButtonText: 'Ja',
      headerText: 'Weet je het zeker?',
      bodyText: 'Weet je zeker dat je deze RentalCheck wil verwijderen?'
    };

    dialogService.showModal({}, dialogOptions)
      .then(function () { // OK is clicked
        return rentalcheckService.deleteCheck({id: rentalcheck.id});
      })
      .then(function () {
        loadPreviousChecks();
        },
        function (error) {
          alertService.add('danger', 'Foutmelding: ' + error.message, 5000);

        });
  };

  function showDetail (check) {
    $scope.selectedCheck = check;
    $scope.activeSection = 'detail';
  }

  function showList () {
    $scope.activeSection = 'list';
  }

  function showCreate () {
    $scope.activeSection = 'create';
  }
});
