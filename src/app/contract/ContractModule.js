'use strict';

angular.module('openwheels.contract', [
	'openwheels.contract.create_edit',
	'openwheels.contract.persons',
	'openwheels.contract.type.list',
	'openwheels.contract.type.show'
])
	.config(function ($stateProvider) {

		$stateProvider.state('root.contract', {
			url: '/contract',
			abstract: true
		});

		$stateProvider.state('root.contract.type', {
			url: '/type',
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

		$stateProvider.state('root.contract.type.list', {
			url: '',
			controller: 'ContractTypeListController',
			templateUrl: 'contract/type/list/contract-type-list.tpl.html',
			resolve: {
				contractTypes: ['$stateParams', 'contractService', function ($stateParams, contractService) {
					return contractService.allTypes();
				}]
			}
		});

		$stateProvider.state('root.contract.type.show', {
			url: '/:contractTypeId',
			controller: 'ContractTypeShowController',
			templateUrl: 'contract/type/show/contract-type-show.tpl.html',
			resolve: {
				contractType: ['$stateParams', 'contractTypeService', function ($stateParams, contractTypeService) {
					return contractTypeService.get({contractType: $stateParams.contractTypeId});
				}]
			}
		});
	})

;
