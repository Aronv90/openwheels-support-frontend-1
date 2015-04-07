'use strict';

angular.module('openwheels.mailer', [
	'openwheels.mailer.list'
])

	.config(function config($stateProvider) {

		/**
		 * mailer
		 */
		$stateProvider.state('root.mailer', {
			abstract: true,
			url: '/mailer',
			views: {
				'main@': {
					template: '<div ui-view></div>'
				}
			}
		});

		/**
		 * resource/:id/summary
		 * @resolve {promise} resource, from parent
		 */
		$stateProvider.state('root.mailer.list', {
			url: '',
			data: {pageTitle: 'Mailer conversations'},
			controller: 'MailerListController',
			templateUrl: 'mailer/list/mailer-list.tpl.html',
			resolve: {
				conversations: ['$stateParams', 'conversationService', function ($stateParams, conversationService) {
					return conversationService.getAll({}).then(function(result){
						return result.result;
					});
				}]
			}
		});

	})

;
