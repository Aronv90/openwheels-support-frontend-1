'use strict';

angular.module('driverLicense', [])

	.directive('driverLicense', function ($q, $filter, $compile, $modal, settingsService, FRONT_DRIVERLICENSE) {
		return {
			restrict: 'A',
			scope: {driverLicense: '='},
			link: function (scope, elem) {
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
					$modal.open({
						template: '<img ng-click="dismiss()" src="' + photo + '">',
						windowClass: 'modal--driverlicense',
						controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
							$scope.dismiss = function () {
								$modalInstance.dismiss();
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
							template = '<img style="cursor:pointer; max-width: 100%;" ng-click="open(driverLicenseUrl)" src="' + scope.driverLicenseUrl + '">';
						} else {
							template = '<a href="' + scope.driverLicenseUrl + '" target=_blank>Download license</a>';
						}

						elem.html(template);
						$compile(elem.contents())(scope);
					});
			}
		};
	});