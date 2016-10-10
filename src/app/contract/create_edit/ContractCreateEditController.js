'use strict';

angular.module('openwheels.contract.create_edit', [])

	.controller('ContractCreateEditController', function ($scope, $filter, $q, $uibModalInstance, dialogService, contractService, contract, person, contractTypes) {

		$scope.contract = contract;

		$scope.statuses = [
			{label: 'Active', value: 'active'},
			{label: 'Blocked', value: 'blocked'},
			{label: 'Ended', value: 'ended'},
			{label: 'Signup', value: 'sign_up'}
		];
		$scope.ownRiskWaiverOptions = [{label: 'Not', value: 'not'}, {
			label: 'Per Booking',
			value: 'booking'
		}, {label: 'Per Month', value: 'month'}];

		$scope.contractTypes = contractTypes;

		$scope.dismiss = function () {
			$uibModalInstance.dismiss();
		};

		$scope.save = function (contract) {
			if (contract.id) { // edit
				var d = $q.defer();
				if ('blocked' === contract.status) {
					var dialogOptions = {
						closeButtonText: 'Cancel',
						actionButtonText: 'OK',
						headerText: 'Are you sure?',
						bodyText: 'Do you really want to set this contract to blocked?'
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
