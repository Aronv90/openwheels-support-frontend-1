'use strict';
angular.module('showIfUserHasRole', [])
	.service('showIfUserHasRoleFunction', function (authService) {
		return function (scope, element, role, prevDisp) {
			scope.$watch(function () {
				return authService.userHasRole(role);
			}, function (hasPermission) {
				if (!hasPermission) {
					element.css('display', 'none');
				} else {
					element.css('display', prevDisp);
				}
			});
		};
	})

	.directive('showIfUserHasRole', function (showIfUserHasRoleFunction) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				showIfUserHasRoleFunction(scope, element, attrs.showIfUserHasRole, element.css('display'));
			}
		};
	})
	.config(function ($provide) {
		$provide.decorator('uiSrefDirective',
			['$delegate', '$log', 'showIfUserHasRoleFunction', function ($delegate, $log, showIfUserHasRoleFunction) {
				var directive = $delegate[0];

				directive.compile = function () {
					return function (scope, element, attrs) {
						var stateName = attrs.uiSref.replace(/\(.+\)$/g, ''); // strip out the state params
						var injector = element.injector();
						var $state = $state || (injector && injector.get('$state'));
						var state = $state.get(stateName, $state.$current);

						// Watch for null (abstract) states and warn about them rather than erroring.
						if (!state) {
							$log.warn('Could not find state:', attrs.uiSref);
						} else if (state.role) {
							showIfUserHasRoleFunction(scope, element, state.role, element.css('display'));
						}

						// Otherwise pass through and let uiSref handle the rest
						directive.link.apply(this, arguments);
					};
				};

				return $delegate;
			}]);
	});
