'use strict';

angular.module('openwheels.fleet', [
	'openwheels.fleet.list'
])

	.config(function ($stateProvider) {

		/**
		 * person
		 */
		$stateProvider.state('root.fleet', {
			url: '/fleet',
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
		});

		$stateProvider.state('root.fleet.list', {
			url: '',
			controller: 'FleetListController',
			templateUrl: 'fleet/list/fleet-list.tpl.html',
			resolve: {
				fleets: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
					return resourceService.allFleets();
				}]
			}
		});
	})

;
