'use strict';

angular.module('openwheels.person.show.contracts', [])

  .controller('PersonShowContractsController', function ($scope, $log, $filter, $modal, contractService, person, contracts ) {
    $scope.contracts = contracts;

    var getContractTypes;
    getContractTypes = function () {
      return contractService.allTypes();
    };

    $scope.showPersons = function(contract) {
      $modal.open({
        templateUrl: 'contract/persons/contract-persons.tpl.html',
        windowClass: 'modal--xl',
        controller: 'ContractPersonsController',
        resolve: {
          contract: function () {
            return contractService.get({id: contract.id});
          },
          person: function () {
            return person;
          }
        }
      });
    };

    $scope.upgrade = function (contract) {
      $modal.open({
        templateUrl: 'contract/request/contract-request.tpl.html',
        windowClass: 'modal--xl',
        controller: 'ContractRequestController',
        resolve: {
          contract: function () {
            return contract;
          },
          person: function () {
            return person;
          },
          contractTypes: function() { return getContractTypes(); }
        }
      }).result.then(function (request) {
        $log.log(request);
        contractService.requestContract(request).then(function (e) {
          $log.log(e);
        });
//          contract.contractor = person;
//          if( true === newContract ){
//            $scope.contracts.push(contract);
//          }else{
//            var foundContract;
//            foundContract = $filter('getByProperty')('id', contract.id, $scope.contracts);
//            var index = $scope.contracts.indexOf(foundContract);
//            $scope.contracts[index] = contract;
//          }
        });
    };
    
    $scope.createEditContract = function (contract) {
      var newContract;

      if( contract ) {
        contract = contractService.get({id: contract.id});
        newContract = false;
      } else {
        newContract = true;
        contract = {};
      }
      $modal.open({
        templateUrl: 'contract/create_edit/contract-create-edit.tpl.html',
        windowClass: 'modal--xl',
        controller: 'ContractCreateEditController',
        resolve: {
          contract: function () {
            return contract;
          },
          person: function () {
            return person;
          },
          contractTypes: function() { return getContractTypes(); }
        }
      }).result.then(function (contract) {
          contract.contractor = person;
          if( true === newContract ){
            $scope.contracts.push(contract);
          }else{
            var foundContract;
            foundContract = $filter('getByProperty')('id', contract.id, $scope.contracts);
            var index = $scope.contracts.indexOf(foundContract);
            $scope.contracts[index] = contract;
          }
        });
    };
  })
;
