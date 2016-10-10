'use strict';

angular.module('openwheels.contract.request', [])

	.controller('ContractRequestController', function ($scope, $filter, $q, $uibModalInstance, contract, contractTypes) {
		$scope.contracttype = null;
		$scope.contractTypes = contractTypes;

		$scope.dismiss = function () {
			$uibModalInstance.dismiss();
		};

		$scope.save = function (contracttype) {
			$uibModalInstance.close({
        contractType: contracttype,
        contract: contract.id,
        person: contract.contractor.id
      });
		};
	})

;
