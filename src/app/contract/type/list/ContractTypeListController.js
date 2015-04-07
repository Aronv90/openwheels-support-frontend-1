'use strict';

angular.module('openwheels.contract.type.list', [])

.controller('ContractTypeListController', function ($scope, contractTypes) {
  $scope.contractTypes = contractTypes;
});
