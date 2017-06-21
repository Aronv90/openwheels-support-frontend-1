'use strict';

angular.module('openwheels.resource', [
	'openwheels.resource.show',
	'openwheels.resource.edit',
	'openwheels.resource.create',
	'openwheels.resource.list',
  	'infinite-scroll'
])

	.config(function config($stateProvider) {

		/**
		 * resource
		 */
		$stateProvider.state('root.resource', {
			abstract: true,
			url: '/resource',
			views: {
				'main@': {
					template: '<div ui-view></div>'
				}
			},
			role: 'ROLE_ADMIN'
		});

		/**
		 * resource/create
		 */
		$stateProvider.state('root.resource.create', {
			url: '/create',
			controller: 'ResourceCreateController',
			templateUrl: 'resource/create/resource-create.tpl.html',
			data: {pageTitle: 'Create Resource'},
			resolve: {
				resource: function () {
					return {latitude: 0, longtitude: 0, fleet: {}};
				},
				fleets: ['resourceService', function (resourceService) {
					return resourceService.allFleets();
				}]
			}
		});

		/**
		 * resource/:id
		 * @resolve {promise} resource
		 */
		$stateProvider.state('root.resource.show', {
			abstract: true,
			url: '/:resourceId',
			controller: 'ResourceShowController',
			templateUrl: 'resource/show/resource-show.tpl.html',
			data: {pageTitle: 'Resource'},
			resolve: {
				resource: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
					var resourceId = $stateParams.resourceId;
					return resourceService.get({
						id: resourceId
					});
				}]
			}
		});


		/**
		 * resource/:id/summary
		 * @resolve {promise} resource, from parent
		 */
		$stateProvider.state('root.resource.show.summary', {
			url: '',
			templateUrl: 'resource/show/summary/resource-show-summary.tpl.html',
			controller: 'ResourceShowSummaryController',
			resolve: {
				bookings: ['$stateParams', 'bookingService', function ($stateParams, bookingService) {
					var startDate = moment().subtract(1, 'd');
					var endDate = moment().add(1, 'w');

					return bookingService.forResource({
						resource: $stateParams.resourceId,
						timeFrame: {
							startDate: startDate.format('YYYY-MM-DD HH:mm'),
							endDate: endDate.format('YYYY-MM-DD HH:mm')
						}
					});
				}]
			}
		});

		/**
		 * resource/:id/rating
		 * @resolve {promise} resource, from parent
		 */
		$stateProvider.state('root.resource.show.rating', {
			url: '/rating',
			templateUrl: 'resource/show/rating/resource-show-rating.tpl.html',
			controller: 'ResourceShowRatingController',
			resolve: {
				ratings: ['$stateParams', 'ratingService', 'resource', function ($stateParams, ratingService, resource) {
					return ratingService.getResourceRatings({
						resource: resource.id
					});
				}]
			}
		});

		/**
		 * resource/:id/trip
		 * @resolve {promise} resource, from parent
		 * @resolve {promise} bookings
		 */
		$stateProvider.state('root.resource.show.trip', {
			url: '/trip?startDate&endDate',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list.tpl.html',
			data: {pageTitle: 'Resource Trip list'},
			resolve: {
				bookings: ['$stateParams', 'bookingService', function ($stateParams, bookingService) {
					var startDate = $stateParams.startDate ? moment($stateParams.startDate) : moment().subtract(1, 'months');
					var endDate = $stateParams.endDate ? moment($stateParams.endDate) : moment().add(1, 'months');

					return bookingService.forResource({
						resource: $stateParams.resourceId,
						timeFrame: {
							startDate: startDate.format('YYYY-MM-DD HH:mm'),
							endDate: endDate.format('YYYY-MM-DD HH:mm')
						},
						cancelled: true
					});
				}]
			}
		});

		/**
		 * resource/:id/data
		 * @resolve {promise} resource
		 */
		$stateProvider.state('root.resource.show.edit', {
			url: '/edit',
			controller: 'ResourceEditController',
			templateUrl: 'resource/edit/resource-edit.tpl.html',
			data: {pageTitle: 'Resource edit'},
			resolve: {
				fleets: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
					return resourceService.allFleets();
				}]
			}
		});

		/**
		 * resource/:id/members
		 * @resolve {promise} resource
		 */
		$stateProvider.state('root.resource.show.members', {
			url: '/members',
			controller: 'ResourceShowMembersController',
			templateUrl: 'resource/show/members/resource-show-members.tpl.html',
			data: {pageTitle: 'Resource members'},
			resolve: {
				members: ['$stateParams', 'resourceService', 'resource', function ($stateParams, resourceService, resource) {
					return resourceService.getMembers({
						resource: resource.id
					});
				}]
			}
		});

		/**
		 * resource/:id/discount
		 * @resolve {promise} resource
		 */
		$stateProvider.state('root.resource.show.discount', {
			url: '/discount?validFrom&validUntil&global&multiple',
			controller: 'ResourceShowDiscountController',
			templateUrl: 'resource/show/discount/resource-show-discount.tpl.html',
			data: {pageTitle: 'Resource discount'},
			resolve: {
				discounts: ['$stateParams', 'discountService', 'resource', 'perPage', function ($stateParams, discountService, resource, perPage) {
					var params = {};
					params.resource = resource.id;
					if ($stateParams.validFrom) { params.validFrom = $stateParams.validFrom; }
					if ($stateParams.validUntil) { params.validUntil = $stateParams.validUntil; }
					params.multiple = $stateParams.multiple === 'true' || null;
					params.global = $stateParams.global === 'true' || null;
          params.limit = perPage;
          params.offset = 0;
					return discountService.search(params);
				}],
        perPage: function(){ return 20;},
			}
		});

		/**
     * resource/:id/boardcomputer
     * @resolve {promise} resource
     */
		$stateProvider.state('root.resource.show.boardcomputer', {
			url: '/boardcomputer',
			controller: 'ResourceShowBoardcomputerController',
			templateUrl: 'resource/show/boardcomputer/resource-show-boardcomputer.tpl.html',
			data: {pageTitle: 'Resource boardcomputer'},
			resolve: {
				booking: function () {
					return;
				}
			}
		});

		/**
     * resource/:id/log
     * @resolve {promise} resource
     */
		$stateProvider.state('root.resource.show.log', {
			url: '/log',
			controller: 'ResourceShowLogController',
			templateUrl: 'resource/show/log/resource-show-log.tpl.html',
			data: {pageTitle: 'Resource Boardcomputer Log'},
			resolve: {
				logs: ['resource', 'boardcomputerService', function (resource, boardcomputerService) {
					var from;
					var to;
					from = moment().subtract(1, 'week').format('YYYY-MM-DD HH:mm');
					to = moment().add(1, 'week').format('YYYY-MM-DD HH:mm');
					return boardcomputerService.log({resource: resource.id, from: from, to: to});
				}]
			}
		});

		/**
		 * resource/:id/tripdata
		 * @resolve {promise} resource
		 */
		$stateProvider.state('root.resource.show.tripdata', {
			url: '/tripdata',
			controller: 'ResourceShowTripdataController',
			templateUrl: 'resource/show/tripdata/resource-show-tripdata.tpl.html',
			data: {pageTitle: 'Resource Boardcomputer Tripdata'},
			resolve: {
//				records: ['resource', 'boardcomputerService', function (resource, boardcomputerService) {
//					return boardcomputerService.tripdata({
//            resource: resource.id,
//            limit: 25,
//            offset: 0
//          });
//				}]
			}
		});

		$stateProvider.state('root.resource.show.revisions', {
			url: '/revisions',
			controller: 'ResourceShowRevisionsController',
			templateUrl: 'resource/show/revisions/resource-show-revisions.tpl.html',
			data: {pageTitle: 'Resource Revisions'}
		});

	})

;
