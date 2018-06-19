'use strict';

angular.module('openwheels.checklist', [
	'openwheels.checklist.driverlicense',
	'openwheels.checklist.bankcheck',
	'openwheels.checklist.dashboard',
	'openwheels.checklist.ownerNotActive',
])

	.config(function ($stateProvider) {

		/**
		 * checklist
		 */
		$stateProvider.state('root.checklist', {
			url: '/checklist',
			views: {
				'main@': {
					template: '<div ui-view></div>'
				}
			}
		});

		/**
		 * checklist/dashboard
		 */
		$stateProvider.state('ow-dashboard', {
	      parent: 'root.checklist',
	      url: '/dashboard',
	      controller: 'DashboardController',
	      templateUrl: 'checklist/dashboard/dashboard.tpl.html',
	      data: {pageTitle: 'Dashboard'},
    	  resolve: {
        	queries: ['checklistService', function (checklistService) {
              return checklistService.all()
                  .then(function (lists) {
                    return lists.filter(function(item) { return item.onDashboard; });
                  });
            }]
          }
	    });

		/**
		 * checklist/driverlicense
		 */
		$stateProvider.state('root.checklist.driverlicense', {
			url: '/driverlicense',
			controller: 'ChecklistDriverlicenseController',
			templateUrl: 'checklist/driverlicense/checklist-driverlicense.tpl.html',
			data: {pageTitle: 'Check Driver Licenses'},
			resolve: {
				persons: ['personService', function (personService) {
					return personService.uncheckedLicenseStatus();
				}]
			}
		});

		/**
		 * checklist/owner-not-active
		 * List owners with currently active resources, but an unchecked driver's license
		 */
		$stateProvider.state('root.checklist.ownerNotActive', {
			url: '/owner-not-active',
			controller: 'ChecklistOwnerNotActiveController',
			templateUrl: 'checklist/ownerNotActive/checklist-ownerNotActive.tpl.html',
			data: {pageTitle: 'Owner not active'},
			resolve: {
				persons: ['personService', function (personService) {
					return personService.ownerNotActive();
				}]
			},
			role: 'ROLE_ADMIN'
		});

		/**
		 * checklist/bankcheck
		 */
		$stateProvider.state('root.checklist.bankcheck', {
			url: '/bankcheck',
			controller: 'ChecklistBankcheckController',
			templateUrl: 'checklist/bankcheck/checklist-bankcheck.tpl.html',
			data: {pageTitle: 'Bankcheck'},
			resolve: {
				persons: ['personService', function (personService) {
					return personService.tobankCheck();
				}]
			},
			role: 'ROLE_ADMIN'
		});

		/**
		 * checklist/:queryid
		 */
		$stateProvider.state('root.checklist.generic', {
			url: '/{queryid:int}',
			controller: ['$scope', 'query', function ($scope, query) {$scope.query = query; }],
			templateUrl: 'checklist/generic/generic.tpl.html',
			data: {pageTitle: 'Checklist'},
			resolve: {
        query: ['$stateParams', 'checklistService', function ($stateParams, checklistService) {
            return checklistService.get({query: $stateParams.queryid});
          }]
			},
			role: 'ROLE_ADMIN'
		});
	});
