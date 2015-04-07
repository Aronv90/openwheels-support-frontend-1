'use strict';

angular.module('openwheels.provider', [
	'openwheels.provider.list'
])

	.config(function ($stateProvider) {

		/**
		 * person
		 */
		$stateProvider.state('root.provider', {
			url: '/provider',
			abstract: true,
			views: {
				'main@': {
					template: '<div ui-view></div>'
				}
			},
			role: 'ROLE_ADMIN'
		});

		$stateProvider.state('root.provider.list', {
			url: '',
			controller: 'ProviderListController',
			templateUrl: 'provider/list/provider-list.tpl.html',
			resolve: {
				providers: ['$stateParams', 'providerService', function ($stateParams, providerService) {
					return providerService.getAll();
				}]
			}
		});
	})

;
