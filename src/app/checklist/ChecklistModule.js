'use strict';

angular.module('openwheels.checklist', [
	'openwheels.checklist.driverlicense',
	'openwheels.checklist.bankcheck'
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
		 * checklist/driverlicense
		 */
		$stateProvider.state('root.checklist.driverlicense', {
			url: '/driverlicense',
			controller: 'ChecklistDriverlicenseController',
			templateUrl: 'checklist/driverlicense/checklist-driverlicense.tpl.html',
			data: {pageTitle: 'Check Driver Licenses'},
			resolve: {
				uncheckedPersons: ['personService', function (personService) {
					return personService.uncheckedLicenseStatus();
				}]
			}
		});

		/**
		 * checklist/driverlicense
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


	});
