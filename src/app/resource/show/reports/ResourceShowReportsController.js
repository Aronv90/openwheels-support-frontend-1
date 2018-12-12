'use strict';

angular.module('openwheels.resource.show.reports', [])

.controller( 'ResourceShowReportsController', function ($location, $uibModal, $state, $stateParams, $scope,
  alertService, damageService, reports, perPage, $mdDialog) {

  $scope.curPage = 1;
  $scope.perPage = perPage;

  $scope.finalizedOptions = [
    {label: 'Unfinalized', value: false},
    {label: 'Finalized', value: true},
    {label: 'All', value: null}
  ];
/*
  $scope.mostRecent = {
    damage: null,
    dirty: null,
  };
*/
  setReports(reports);

  function setReports(reports) {
    $scope.reports = reports.result;
    $scope.lastPage = Math.ceil(reports.total / $scope.perPage);
  }

  function buildParams() {
    var params = {};
    params.resourceId = $stateParams.resourceId;
//    params.type = $scope.filters.type;
//    if (params.type === 'both') {
//      delete params.type;
//    }
    // personId
    // bookingId
    return params;
  }

  $scope.nextPage = function() {
    damageService.searchReports(_.extend(buildParams(), $scope.params, {max: $scope.perPage, offset: $scope.curPage * $scope.perPage}))
    .then(function(reports) {
      setReports(reports);
      $scope.curPage = $scope.curPage + 1;
    });
  };

  $scope.prevPage = function() {
    damageService.searchReports(_.extend(buildParams(), $scope.params, {max: $scope.perPage, offset: ($scope.curPage - 2) * $scope.perPage}))
    .then(function(reports) {
      setReports(reports);
      $scope.curPage = $scope.curPage - 1;
    });
  };

  $scope.params = {
    type: $stateParams.type,
  };

  $scope.refresh = function () {
    $state.go($state.current.name, $scope.params);
  };

  $scope.clear = function () {
    $location.search({});
  };

  $scope.toggleFullDescription = function (report) {
    report.showFullDescription = !report.showFullDescription;
  };
/*
  $scope.deleteDamage = function (report) {
    var confirm = $mdDialog.confirm()
    .title('Rapportage verwijderen')
    .textContent('Weet je zeker dat je deze rapportage wilt verwijderen?')
    .ok('Ja')
    .cancel('Nee');

    $mdDialog.show(confirm)
    .then(function(res) {
      damageService.remove({ report: report.id })
      .then(function (result) {
        alertService.add('success', 'Damage removed.', 5000);
        var index = $scope.damages.indexOf(report);
        if(index >= 0) {
          $scope.damages.splice(index, 1);
        }
      })
      .catch(alertService.addError)
      .finally(alertService.loaded);
    });
  };
*/
});