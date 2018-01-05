'use strict';

angular.module('openwheels.person.show.revisions', [])

.controller('PersonShowRevisionsController', function ($scope, alertService, person, contracts, revisionsService) {

  $scope.entities           = [];
  $scope.fields             = [];
  $scope.revisions          = [];

  $scope.selectedEntityType = 'person';
  $scope.selectedEntity     = null;
  $scope.selectedField      = null;

  $scope.entityTypes = [
    { label: 'Person', value: 'person' },
    { label: 'Contract', value: 'contract' }
  ];

  $scope.$watch('selectedEntityType', function (entityType) {
    $scope.entities       = [];
    $scope.fields         = [];
    $scope.revisions      = [];
    $scope.selectedEntity = null;
    $scope.selectedField  = null;

    switch (entityType) {
      case 'person':
        getPerson();
        break;

      case 'contract':
        getContracts();
        break;
    }
  });

  $scope.$watch('selectedEntity', function (entityInfo) {
    $scope.fields        = [];
    $scope.revisions     = [];
    $scope.selectedField = null;

    if (entityInfo) {
      angular.forEach(entityInfo.entity, function (val, key) {
        $scope.fields.push(key);
      });
      getRevisions(entityInfo);
    }
  });

  function getRevisions (entityInfo) {
    var entityTypeMap = {
      person   : 'OpenWheels\\ApiBundle\\Entity\\Person',
      contract : 'OpenWheels\\ApiBundle\\Entity\\Contract',
      resource : 'OpenWheels\\ApiBundle\\Entity\\Resource',
      booking  : 'OpenWheels\\ApiBundle\\Entity\\Booking'
    };
    alertService.load();
    revisionsService.revisions({
      id   : entityInfo.id,
      type : entityTypeMap[entityInfo.type]
    })
    .then(function (revisions) {
      $scope.revisions = revisions.result;
    })
    .finally(function () {
      alertService.loaded();
    });
  }

  function getPerson () {
    $scope.selectedEntity = {
      entity: person,
      type  : 'person',
      id    : person.id,
      label : 'Personlabel'
    };
  }

  function getContracts () {
    if (contracts.length) {
      angular.forEach(contracts, function (contract) {
        $scope.entities.push({
          entity: contract,
          type  : 'contract',
          id    : contract.id,
          label : contract.id + (contract.type ? ' - ' + contract.type.name : '')
        });
      });
      if ($scope.entities.length) {
        $scope.selectedEntity = $scope.entities[0];
      }
    }
  }

});
