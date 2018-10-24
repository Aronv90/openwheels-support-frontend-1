'use strict';

angular.module('openwheels.resource.show.maintenance', [])

.controller( 'ResourceShowMaintenanceController', function ($location, $uibModal, $state, $stateParams, $scope,
  alertService, maintenanceService, maintenances, perPage, $mdDialog) {

  $scope.curPage = 1;
  $scope.perPage = perPage;
  handleMaintenances(maintenances);

  function handleMaintenances(maintenances) {
    $scope.maintenances = maintenances.result;
    $scope.lastPage = Math.ceil(maintenances.total / $scope.perPage);
  }

  function buildParams() {
    var params = {};
    params.resourceId = $stateParams.resource;
    params.finalized = $stateParams.finalized === 'true' || null;
    return params;
  }

  $scope.nextPage = function() {
    maintenanceService.search(_.extend(buildParams(), {max: $scope.perPage, offset: $scope.curPage * $scope.perPage}))
    .then(function(maintenances) {
      handleMaintenances(maintenances);
      $scope.curPage = $scope.curPage + 1;
    });
  };

  $scope.prevPage = function() {
    maintenanceService.search(_.extend(buildParams(), {max: $scope.perPage, offset: ($scope.curPage - 2) * $scope.perPage}))
    .then(function(maintenances) {
      handleMaintenances(maintenances);
      $scope.curPage = $scope.curPage - 1;
    });
  };

  $scope.params = {
    finalized: $stateParams.finalized === 'true' || 'false',
  };

  $scope.refresh = function () {
    $state.go($state.current.name, $scope.params);
  };

  $scope.clear = function () {
    $location.search({});
  };

  $scope.deleteMaintenance = function (maintenance) {
    var confirm = $mdDialog.confirm()
    .title('Schade verwijderen')
    .textContent('Weet je zeker dat je deze schade wil verwijderen?')
    .ok('Ja')
    .cancel('Nee');

    $mdDialog.show(confirm)
    .then(function(res) {
      maintenanceService.remove({ maintenance: maintenance.id })
      .then(function (result) {
        alertService.add('success', 'Damage removed.', 5000);
        var index = $scope.maintenances.indexOf(maintenance);
        if(index >= 0) {
          $scope.maintenances.splice(index, 1);
        }
      })
      .catch(alertService.addError)
      .finally(alertService.loaded);
    });
  };

});