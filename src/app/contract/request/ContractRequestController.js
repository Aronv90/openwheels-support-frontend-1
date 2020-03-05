'use strict';

angular.module('openwheels.contract.request', [])

	.controller('ContractRequestController', function ($scope, $filter, $q, $uibModalInstance, contract, contractTypes) {
		$scope.contracttype = null;

        $scope.contractTypes = _.filter(contractTypes, function(contract) {
            return ([60, 62, 63, 104, 120].indexOf(contract.id) >= 0);
        });

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
