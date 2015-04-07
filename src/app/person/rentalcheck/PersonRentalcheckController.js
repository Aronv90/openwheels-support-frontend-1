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
    type: null, // basic, standard or extended
    includeDocumentCheck: false
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
      warning = ' Warning: this may cost money.';
    }
    dialogService.showModal({}, {
      closeButtonText: 'Cancel',
      actionButtonText: 'OK',
      headerText: 'Rental Check',
      bodyText: 'Are you sure you want to perform the check?' + warning
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
        console.log('success', result);
      })
      .catch(function (err) {
        alertService.add('danger', 'Error: ' + err.message, 5000);
        console.log('error', err);
      })
      .finally(function () {
        alertService.loaded();
      });

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
})
;
