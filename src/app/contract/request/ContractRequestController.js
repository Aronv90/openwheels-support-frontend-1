'use strict';

angular.module('openwheels.contract.request', [])

	.controller('ContractRequestController', function ($scope, $filter, $q, $modalInstance, contract, contractTypes) {
		$scope.contracttype = null;
		$scope.contractTypes = contractTypes;

		$scope.dismiss = function () {
			$modalInstance.dismiss();
		};

		$scope.save = function (contracttype) {
			$modalInstance.close({
        contractType: contracttype,
        contract: contract.id,
        person: contract.contractor.id
      });
		};
	})

;
