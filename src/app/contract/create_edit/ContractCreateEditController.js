'use strict';

angular.module('openwheels.contract.create_edit', [])

	.controller('ContractCreateEditController', function ($scope, $filter, $q, $uibModalInstance, dialogService, contractService, contract, person, contractTypes) {

		$scope.contract = contract;
    $scope.provider = person.provider.id;
    $scope.showAll = true;

    var allContractTypes = angular.copy(contractTypes);
		$scope.contractTypes = contractTypes;

    $scope.changeShowAll = function(val) {
      $scope.showAll = val;
      if(val) {
        $scope.contractTypes = allContractTypes;
      } else {
        $scope.contractTypes = _.filter(allContractTypes, function(contract) {
            return ([60, 62, 63, 104, 120].indexOf(contract.id) >= 0);
        });
      }
    };
    if($scope.provider === 1) {
      $scope.changeShowAll(false);
    }

		$scope.statuses = [
			{label: 'Active', value: 'active'},
			{label: 'Blocked', value: 'blocked'},
			{label: 'Ended', value: 'ended'}
		];
		$scope.ownRiskWaiverOptions = [
			{label: 'Niet verlagen', value: 'not'}, 
			{label: 'Per rit', value: 'booking'},
			{label: 'Per maand', value: 'month'}
		];


		$scope.dismiss = function () {
			$uibModalInstance.dismiss();
		};

		$scope.save = function (contract) {
			if (contract.id) { // edit
				var d = $q.defer();
				if ('blocked' === contract.status) {
					var dialogOptions = {
						closeButtonText: 'Annuleer',
						actionButtonText: 'OK',
						headerText: 'Weet je het zeker',
						bodyText: 'Weet je zeker dat je dit abonnement wil blokkeren?'
					};
					dialogService.showModal({}, dialogOptions)
						.then(function () {
							d.resolve();
						}, function () {
							d.reject();
						});
				} else {
					d.resolve();
				}
				d.promise.then(function () {
					contractService.alter({
						id: contract.id,
						newProps: {
							status: contract.status,
							type: contract.type.id,
							maxDrivers: contract.maxDrivers,
							ownRiskWaiver: contract.ownRiskWaiver,
              				multiBooking: contract.multiBooking
						}
					})
						.then(function (contract) {
							$uibModalInstance.close(contract);
						});
				});
			} else { // create
				contractService.create({person: person.id, type: contract.type.id})
					.then(function (contract) {
						$uibModalInstance.close(contract);
					});
			}
		};
	})

;
