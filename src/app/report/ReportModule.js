'use strict';

angular.module('openwheels.report',
	['openwheels.report.report1']
)

	.config(function ($stateProvider) {

		/**
		 * person
		 */
		$stateProvider.state('root.report', {
			url: '/report',
			views: {
				'main@': {
					template: '<div ui-view></div>'
				}
			},
			role: 'ROLE_ADMIN'
		});

		/**
		 * person/create
		 */
		$stateProvider.state('root.report.report1', {
			url: '/report1',
			controller: 'Report1Controller',
			templateUrl: 'report/report1/report-report1.tpl.html',
			data: {pageTitle: 'Report 1'}
		});

	})

;
