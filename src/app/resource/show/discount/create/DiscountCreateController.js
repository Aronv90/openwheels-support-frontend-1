'use strict';

angular.module('openwheels.resource.show.discount.create', [])

	.controller('DiscountCreateController', function ($scope, $modalInstance, alertService, discountService, resourceService, resource) {

		$scope.discount = {};
		$scope.discount.resource = resource;
		$scope.discount.sender = resource.owner;
		$scope.discount.recipient = {};

		$scope.dateConfig = {
			//model
			modelFormat: 'YYYY-MM-DD',
			formatSubmit: 'yyyy-mm-dd',

			//view
			viewFormat: 'DD-MM-YYYY',
			format: 'dd-mm-yyyy',

			//options
			selectMonths: true
		};

		/**
		 * Typeahead Resource
		 */
		$scope.searchResources = function ($viewValue) {
			return resourceService.select({
				search: $viewValue
			});
		};

		$scope.formatResource = function ($model) {
			var inputLabel = '';
			if ($model) {
				inputLabel = $model.alias + ' ' + '[' + $model.id + ']';
			}
			return inputLabel;
		};

		$scope.dismiss = function () {
			$modalInstance.dismiss();
		};

		$scope.save = function () {

			discountService.create({
				amount: $scope.discount.amount,
				percentage: $scope.discount.percentage,
				validFrom: $scope.discount.from,
				validUntil: $scope.discount.until,
				sender: $scope.discount.sender.id,
				recipient: $scope.discount.recipient.id,
				resource: $scope.discount.resource.id,
				multiple: $scope.discount.multiple,
				global: $scope.discount.global,
				globalCharge: $scope.discount.globalCharge
			})
			.then(function (result) {
				$modalInstance.close(result);
			})
			.catch(alertService.addError)
			.finally(alertService.loaded);
		};

	});
