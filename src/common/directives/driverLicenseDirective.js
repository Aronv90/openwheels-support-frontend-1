'use strict';

angular.module('driverLicense', [])

	.directive('driverLicense', function ($q, $filter, $compile, $uibModal, settingsService, FRONT_DRIVERLICENSE) {
		return {
			restrict: 'A',
			scope: {driverLicense: '='},
			link: function (scope, elem) {

        scope.rot = 0;

				var isValidImageUrl = function (url) {
					var d = $q.defer();
					var img = new Image();

					img.onerror = function (error) {
						d.resolve(false);
					};
					img.onload = function () {
						d.resolve(true);
					};
					img.src = url;
					return d.promise;
				};

				scope.open = function (photo) {
					$uibModal.open({
						template: '<img ng-style="{transform: \'rotate(\'+rot+\'deg)\'}" ng-click="dismiss()" src="' + photo + '">',
						windowClass: 'modal--driverlicense',
            scope: scope,
						controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
							$scope.dismiss = function () {
								$uibModalInstance.dismiss();
							};
						}]
					});
				};

				scope.driverLicenseUrl = settingsService.settings.server + FRONT_DRIVERLICENSE + scope.driverLicense;

				isValidImageUrl(scope.driverLicenseUrl)
					.then(
					function (validImage) {
						var template;
						if (validImage) {
							template = '<img ng-style="{transform: \'rotate(\'+rot+\'deg)\'}" style="transition: all 200ms; cursor:pointer; max-width: 100%;" ng-click="open(driverLicenseUrl)" src="' + scope.driverLicenseUrl + '"><div style="margin-top: 1em;text-align: center"><button class="no-outline btn btn-link" ng-click="rot = rot - 90"><i class="fa fa-undo"></i></button>draai<button style="outline: none" class="btn btn-link" ng-click="rot = rot + 90"><i class="fa fa-repeat"></i></button></div>';
						} else {
							template = '<a href="' + scope.driverLicenseUrl + '" target=_blank>Download license</a>';
						}

						elem.html(template);
						$compile(elem.contents())(scope);
					});
			}
		};
	});
