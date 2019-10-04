'use strict';

angular.module('openwheels.resource', [
	'openwheels.resource.show',
	'openwheels.resource.edit',
	'openwheels.resource.create',
	'openwheels.resource.creategarage',
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
		resolve: {
			datacontext: ['$rootScope', function ($rootScope) {
				$rootScope.datacontext = {};
				return $rootScope.datacontext;
			}]
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
		data: {pageTitle: 'Auto toevoegen'},
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
	 * resource/creategarage
	 */
	$stateProvider.state('root.resource.creategarage', {
		url: '/creategarage',
		controller: 'ResourceCreateGarageController',
		templateUrl: 'resource/createGarage/resource-create-garage.tpl.html',
		data: {pageTitle: 'Garage toevoegen'}
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
		data: {pageTitle: 'Auto'},
		resolve: {
			resource: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
				var resourceId = $stateParams.resourceId;
				return resourceService.get({
					id: resourceId
				});
			}],
			datacontext: ['$rootScope', 'resource', function ($rootScope, resource) {
				$rootScope.datacontext = {
					resource: resource,
					person: resource.owner || resource.contactPerson
				};
				return $rootScope.datacontext;
			}]
		},
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
		data: {pageTitle: 'Auto ritten lijst'},
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
		data: {pageTitle: 'Auto wijzigen'},
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
		data: {pageTitle: 'Auto vrienden'},
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
		data: {pageTitle: 'Auto kortingscodes'},
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
   * resource/:id/damage
   * @resolve {promise} resource
   */
  $stateProvider.state('root.resource.show.damage', {
    url: '/damage?finalized&max&offset',
    controller: 'ResourceShowDamageController',
    templateUrl: 'resource/show/damage/resource-show-damage.tpl.html',
    data: {pageTitle: 'Auto schade'},
    resolve: {
      damages: ['$stateParams', 'damageService', 'resource', 'perPage', function ($stateParams, damageService, resource, perPage) {
        var params = {};
        params.resourceId = resource.id;
            params.finalized = $stateParams.finalized;
            params.max = perPage;
            params.offset = 0;
        return damageService.search(params);
      }],
      perPage: function(){ return 20;},
    }
  });

  /**
   * resource/:id/reports
   * @resolve {promise} resource
   */
  $stateProvider.state('root.resource.show.reports', {
    url: '/reports?finalized&type&person&booking&max&offset',
    controller: 'ResourceShowReportsController',
    templateUrl: 'resource/show/reports/resource-show-reports.tpl.html',
    data: {pageTitle: 'Auto rapporten'},
    resolve: {
      reports: ['$stateParams', 'damageService', 'resource', 'perPage', function ($stateParams, damageService, resource, perPage) {
        var params = {};
        // personId
        // bookingId
        params.resourceId = resource.id;
        //if ($stateParams.type) {
        //  params.type = $stateParams.type;
        //}

        params.max = perPage;
        params.offset = 0;
        return damageService.searchReports(params);
      }],
      perPage: function(){ return 20;},
    }
  });

	/**
	 * resource/:id/maintenance
	 * @resolve {promise} resource
	 */
	$stateProvider.state('root.resource.show.maintenance', {
		url: '/maintenance?finalized&max&offset',
		controller: 'ResourceShowMaintenanceController',
		templateUrl: 'resource/show/maintenance/resource-show-maintenance.tpl.html',
		data: {pageTitle: 'Auto onderhoud'},
		resolve: {
			maintenances: ['$stateParams', 'maintenanceService', 'resource', 'perPage', function ($stateParams, maintenanceService, resource, perPage) {
				var params = {};
				params.resourceId = resource.id;
      			params.finalized = $stateParams.finalized;
      			params.max = perPage;
      			params.offset = 0;
				return maintenanceService.search(params);
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
			data: {pageTitle: 'Auto boordcomputer'}
		});

    /**
     * resource/:id/myfms/requests
     * @resolve {promise} resource
     */
    $stateProvider.state('root.resource.show.myfmschipcard', {
      url: '/myfms/requests',
      controller: 'ResourceShowMyFMSChipcardRequestController',
      templateUrl: 'resource/show/myfms/request/resource-show-myfms-chipcard-request.tpl.html',
      data: {pageTitle: 'Resource myfmschipcard'},
      resolve: {
        chipcardrequest: ['$stateParams', 'resource', 'chipcardService', 'perPage', function ($stateParams, resource, chipcardService, perPage) {
          var params = {};
          params.resource = $stateParams.resourceId;
          params.limit = perPage;
          params.offset = 0;

          return chipcardService.requests(params);
        }],
        perPage: function(){ return 20;}
      }
    });

    /**
     * resource/:id/myfms/log
     * @resolve {promise} resource
     */
    $stateProvider.state('root.resource.show.myfmslog', {
      url: '/myfms/log',
      controller: 'ResourceShowMyFMSLogRequestController',
      templateUrl: 'resource/show/myfms/log/resource-show-myfms-chipcard-log.tpl.html',
      data: {pageTitle: 'Resource MyFMS Log'},
      resolve: {
        logrequest: ['$stateParams', 'resource', 'chipcardService', 'perPage', function ($stateParams, resource, chipcardService, perPage) {
          var params = {};
          params.resource = $stateParams.resourceId;
          params.limit = perPage;
          params.offset = 0;

          return chipcardService.logs(params);
        }],
        perPage: function(){ return 20;}
      }
    });

	/**
	 * resource/:id/device/log/event
	 * @resolve {promise} resource
	 */
	$stateProvider.state('root.resource.show.device-event-log', {
		url: '/device/log/event',
		controller: 'ResourceShowDeviceEventLogController',
		templateUrl: 'resource/show/device/event/resource-show-device-event-log.tpl.html',
		data: {pageTitle: 'Event Log'},
		resolve: {
			eventLog: ['$stateParams', 'resource', 'deviceService', 'perPage', 'start', 'end', function ($stateParams, resource, deviceService, perPage, start, end) {
				var params = {};
				params.resource = $stateParams.resourceId;
				params.limit = perPage;
				params.start = start;
				params.end = end;
				params.offset = 0;

				return deviceService.eventLog(params);
			}],
			perPage: function () {
				return 20;
			},
			start: function () {
				return moment().format("YYYY-MM-DD 00:00");
			},
			end: function () {
				return moment().format("YYYY-MM-DD 23:59");
			}
		}
	});

	/**
	 * resource/:id/device/log/status/control
	 * @resolve {promise} resource
	 */
	$stateProvider.state('root.resource.show.device-status-control-log', {
		url: '/device/log/status/control',
		controller: 'ResourceShowDeviceStatusControlLogController',
		templateUrl: 'resource/show/device/statuslog/resource-show-device-status-control-log.tpl.html',
		data: {pageTitle: 'Open en sluit log'},
		resolve: {
			statusLog: ['$stateParams', 'resource', 'deviceService', 'perPage', 'start', 'end', function ($stateParams, resource, deviceService, perPage, start, end) {
				var params = {};
				params.resource = $stateParams.resourceId;
				params.limit = perPage;
				params.start = start;
				params.end = end;
				params.offset = 0;

				return deviceService.statusControlLog(params);
			}],
			perPage: function () {
				return 20;
			},
			start: function () {
				return moment().format("YYYY-MM-DD 00:00");
			},
			end: function () {
				return moment().format("YYYY-MM-DD 23:59");
			}
		}
	});

		/**
     * resource/:id/log?startDate&endDate
     * @resolve {promise} resource
     */
		$stateProvider.state('root.resource.show.log', {
			url: '/log?startDate&endDate',
			controller: 'ResourceShowLogController',
			templateUrl: 'resource/show/log/resource-show-log.tpl.html',
			data: {pageTitle: 'Resource Boardcomputer Log'},
			resolve: {
				logs: ['$stateParams', 'resource', 'boardcomputerService', function ($stateParams, resource, boardcomputerService) {
					var startDate = $stateParams.startDate ? moment($stateParams.startDate).format('YYYY-MM-DD HH:mm') : moment().startOf('day').format('YYYY-MM-DD HH:mm');
					var endDate = $stateParams.endDate ? moment($stateParams.endDate).format('YYYY-MM-DD HH:mm') : moment().endOf('day').format('YYYY-MM-DD HH:mm');

					return boardcomputerService.log({
						resource: resource.id, 
						from: startDate, 
						to: endDate
					});
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
			data: {pageTitle: 'Resource Revisions'},
            resolve: {
                revisionlog: ['$stateParams', 'resource', 'revisionsService', 'perPage', function ($stateParams, resource, revisionsService, perPage) {
                    var params = {};
                    params.id = $stateParams.resourceId;
                    params.type = 'OpenWheels\\ApiBundle\\Entity\\Resource';
                    params.limit = perPage;
                    params.offset = 0;

                    return revisionsService.revisions(params);
                }],
                perPage: function(){ return 20;}
            }
		});

    /**
     * resource/:id/remark
     * @resolve {promise} resource
     */
    $stateProvider.state('root.resource.show.remarklog', {
      url: '/remarks',
      controller: 'ResourceShowRemarkController',
      templateUrl: 'resource/show/remark/resource-show-remark.tpl.html',
      data: {pageTitle: 'Resource Remark Log'},
      resolve: {
        remarklog: ['$stateParams', 'resource', 'remarkService', 'perPage', function ($stateParams, resource, remarkService, perPage) {
          var params = {};
          params.resource = $stateParams.resourceId;
          params.limit = perPage;
          params.offset = 0;

          return remarkService.forResource(params);
        }],
        perPage: function(){ return 20;}
      }
    });

	})

;
