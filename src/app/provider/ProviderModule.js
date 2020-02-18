'use strict';

angular.module('openwheels.provider', [
	'openwheels.provider.list',
	'openwheels.provider.create'
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
			resolve: {
				datacontext: ['$rootScope', function ($rootScope) {
					$rootScope.datacontext = {};
					return $rootScope.datacontext;
				}]
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

		$stateProvider.state('root.provider.create', {
			url: '/create',
			controller: 'ProviderCreateController',
			templateUrl: 'provider/create/provider-create.tpl.html',
			data: {pageTitle: 'Create Provider'}
		});

	})

;
