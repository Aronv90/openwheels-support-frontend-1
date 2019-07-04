'use strict';

angular.module('openwheels.bank', [
	'openwheels.bank.transaction.list',
	'openwheels.bank.transaction.import',
	'openwheels.bank.transaction.link',
	'openwheels.bank.incasso.list',
	'openwheels.bank.incasso.show'
])

	.config(function ($stateProvider) {

		/**
		 * bank
		 */
		$stateProvider.state('root.bank', {
			url: '/bank',
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

		/**
		 * bank
		 */
		$stateProvider.state('root.bank.transaction', {
			url: '/transaction',
			abstract: true,
			template: '<div ui-view></div>'
		});


		/**
		 * bank/transaction/all
		 */
		$stateProvider.state('root.bank.transaction.all', {
			url: '/all',
			controller: 'BankTransactionListController',
			templateUrl: 'bank/transaction/list/bank-transaction-list.tpl.html',
			data: {pageTitle: 'All Bank Transactions'},
			resolve: {
				transactions: ['bankService', function (bankService) {
					return bankService.all();
				}]
			}
		});


		/**
		 * bank/unknownaccount
		 */
		$stateProvider.state('root.bank.transaction.unknownaccount', {
			url: '/unknownaccount',
			controller: 'BankTransactionListController',
			templateUrl: 'bank/transaction/list/bank-transaction-list.tpl.html',
			data: {pageTitle: 'Bank Transactions Unknown Account'},
			resolve: {
				transactions: ['bankService', function (bankService) {
					return bankService.unknownAccount();
				}]
			}
		});

		/**
		 * bank/todo
		 */
		$stateProvider.state('root.bank.transaction.todo', {
			url: '/todo',
			controller: 'BankTransactionListController',
			templateUrl: 'bank/transaction/list/bank-transaction-list.tpl.html',
			data: {pageTitle: 'Bank Transactions Todo'},
			resolve: {
				transactions: ['bankService', function (bankService) {
					return bankService.notLinkedToMutation();
				}]
			}
		});

		/**
		 * checklist/driverlicense
		 */
		$stateProvider.state('root.bank.transaction.import', {
			url: '/import',
			controller: 'BankTransactionImportController',
			templateUrl: 'bank/transaction/import/bank-transaction-import.tpl.html',
			data: {pageTitle: 'Import Bank Transactions'}
		});


		/**
		 * bank
		 */
		$stateProvider.state('root.bank.incasso', {
			url: '/incasso',
			abstract: true,
			template: '<div ui-view></div>'
		});


		/**
		 * bank/transaction/all
		 */
		$stateProvider.state('root.bank.incasso.all', {
			url: '/all',
			controller: 'BankIncassoListController',
			templateUrl: 'bank/incasso/list/bank-incasso-list.tpl.html',
			data: {pageTitle: 'All Bank Incassos'},
			resolve: {
				incassos: ['incassoService', function (incassoService) {
					return incassoService.all();
				}]
			}
		});

		/**
		 * bank/transaction/all
		 */
		$stateProvider.state('root.bank.incasso.show', {
			url: '/:batchId',
			controller: 'BankIncassoShowController',
			templateUrl: 'bank/incasso/show/bank-incasso-show.tpl.html',
			data: {pageTitle: 'Show Incasso'},
			resolve: {
				batch: ['$stateParams', 'incassoService', function ($stateParams, incassoService) {
					var batchId = $stateParams.batchId;
					return incassoService.batches({batch: batchId});
				}]
			}
		});

	});
