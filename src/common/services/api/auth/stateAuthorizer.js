'use strict';

angular.module('stateAuthorizer', [])

	.service('stateAuthorizer', function ($log, $timeout, $rootScope, $state, alertService, authService) {

		$rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {

			var role = toState.role ? toState.role || '' : '';

			if(!role){
				return;
			}

			if (authService.user.isPending) {
				e.preventDefault();

				$log.debug('-?- state access (waiting for user)');
				authService.userPromise().then(function (user) {
					$timeout(function () {
						$state.go(toState, toParams);
					}, 0);
				});
			}	else {
				if ( !authService.userHasRole(role)) {
					e.preventDefault();
					$log.debug('!!! state access denied, insufficient role');
					$timeout(function () {
						alertService.loaded();
						$state.go('root');
					}, 0);
				}
			}
		});

	});
