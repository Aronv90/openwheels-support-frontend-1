'use strict';

angular.module('openwheels.invoice', [
	'openwheels.invoice.line.dialog',
	'openwheels.invoice.payment.dialog',
	'openwheels.invoice.group',
	'openwheels.invoice.trip',
	'openwheels.invoice.transaction',
	'openwheels.invoice.account',
	'openwheels.invoice.incasso'
])

	.config(function config($stateProvider) {

		/**
		 * invoice
		 */
		$stateProvider.state('root.invoice', {
			abstract: true,
			url: '/invoice',
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

		/**
		 * invoice/account
		 */
		$stateProvider.state('root.invoice.account', {
			abstract: true,
			url: '/account',
			views: {
				'main@': {
					template: '<div ui-view></div>'
				}
			}
		});


		/**
		 * invoice/account
		 * @resolve {promise} invoiceGroups
		 */
		$stateProvider.state('root.invoice.account.list', {
			url: '?page&limit&due&amount',
			controller: 'InvoiceAccountListController',
			templateUrl: 'invoice/account/list/invoice-account-list.tpl.html',
			data: {pageTitle: 'Account List'},
			resolve: {
				accounts: ['$stateParams', 'accountService', function ($stateParams, accountService) {
					return accountService.all();
				}]
			}
		});

		/**
		 * invoice/account/belowcredit
		 * @resolve {promise} invoiceGroups
		 */
		$stateProvider.state('root.invoice.account.belowcredit', {
			url: '/belowcredit?page&limit&due&amount',
			controller: 'InvoiceAccountListController',
			templateUrl: 'invoice/account/list/invoice-account-list.tpl.html',
			data: {pageTitle: 'Account List'},
			resolve: {
				accounts: ['$stateParams', 'accountService', function ($stateParams, accountService) {
					return accountService.belowCredit();
				}]
			}
		});

		/**
		 * invoice/group
		 */
		$stateProvider.state('root.invoice.group', {
			abstract: true,
			url: '/group',
			views: {
				'main@': {
					template: '<div ui-view></div>'
				}
			}
		});


		/**
		 * invoice/group?limit=20&page=1&due=concept&amount=25&unpaid=true
		 * @resolve {promise} invoiceGroups
		 */
		$stateProvider.state('root.invoice.group.list', {
			url: '?page&limit&date&ltdate&concept&gtamount&ltamount&unpaid&overpaid&owner&renter&neq_saldo&has_mandate&no_mandate',
			controller: 'InvoiceGroupListController',
			templateUrl: 'invoice/group/list/invoice-group-list.tpl.html',
			data: {pageTitle: 'Invoice List'},
			resolve: {
				invoiceGroups: ['$stateParams', 'invoiceService', function ($stateParams, invoiceService) {
					var limit = $stateParams.limit === '-1' ? undefined : parseInt($stateParams.limit, 10) || 20;
					var page = $stateParams.page || 1;
					var due;
					if ($stateParams.concept === 'true') {
						due = 'concept';
					} else {
						due = $stateParams.date === 'false' ? null : $stateParams.date;
					}
					var ltDue = $stateParams.ltdate || undefined;
					var gtAmount = $stateParams.gtamount ? parseInt($stateParams.gtamount, 10) : null;
					var ltAmount = $stateParams.ltamount ? parseInt($stateParams.ltamount, 10) : null;
					var unpaid = $stateParams.unpaid === 'true';
					var overpaid = $stateParams.overpaid === 'true';
					var has_mandate = $stateParams.has_mandate === 'true';
					var no_mandate = $stateParams.no_mandate === 'true';
					var preference;
					if( ($stateParams.owner === 'true' && $stateParams.renter === 'true') || ( $stateParams.owner !== 'true' && $stateParams.renter !== 'true')){
						preference = 'both';
					}else if($stateParams.owner === 'true'){
						preference = 'owner';
					}else if($stateParams.renter === 'true'){
						preference = 'renter';
					}

					var neq_saldo = $stateParams.neq_saldo === 'true';

					var direct_debit = null;

					if(has_mandate && !no_mandate){
						direct_debit = true;
					}

					if(no_mandate && !has_mandate) {
						direct_debit = false;
					}

					return invoiceService.allGroups({
						limit: limit,
						page: page - 1,
						filter: {
							due: due,
							ltDue: ltDue,
							ltAmount: ltAmount,
							gtAmount: gtAmount,
							unpaid: unpaid,
							overpaid: overpaid,
							preference: preference,
							neq_saldo: neq_saldo,
							direct_debit: direct_debit
						}
					});
				}],
				payments: function () {
					return [];
				}
			}

		});

		/**
		 * invoice/:id
		 * @resolve {promise} invoiceGroup
		 */
		$stateProvider.state('root.invoice.group.show', {
			url: '/:invoiceGroupId',
			controller: 'InvoiceGroupShowController',
			templateUrl: 'invoice/group/show/invoice-group-show.tpl.html',
			data: {pageTitle: 'Person invoice group'},
			resolve: {
				invoiceGroup: ['$stateParams', 'invoiceService', function ($stateParams, invoiceService) {
					var invoiceGroupId = $stateParams.invoiceGroupId;
					return invoiceService.getGroup({
						group: invoiceGroupId
					});
				}]
			}
		});


	})

;
