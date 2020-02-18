'use strict';

angular.module('openwheels.trip.show.overview', []);

angular.module('openwheels.trip', [
	'openwheels.trip.dashboard',
	'openwheels.trip.list',
	'openwheels.trip.show',
	'openwheels.trip.create',
	'openwheels.trip.show.overview'
])

	.config(function config($stateProvider) {

		/**
		 * trip
		 */
		$stateProvider.state('root.trip', {
			abstract: true,
			url: '/trip',
			views: {
				'main@': {
					template: '<div ui-view></div>'
				}
			}
		});

		/**
		 * trip
		 */
		$stateProvider.state('root.trip.list', {
			abstract: true,
			url: '',
			views: {
				'main@': {
					template: '<div class="panel panel-default card"><div class="panel-body"><div ui-view></div></div></div>'
				}
			},
			role: 'ROLE_PROVIDER_ADMIN'
		});


		/**
		 * trip/
		 * @resolve {promise} booking
		 */
		$stateProvider.state('root.trip.list.default', {
			url: '',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list.tpl.html',
			data: {pageTitle: 'Ritten lijst'},
			resolve: {
				bookings: function () {
					return [];
				}
			},
			role: 'ROLE_PROVIDER_ADMIN'

		});

		/**
		 * trip/
		 * @resolve {promise} booking
		 */
		$stateProvider.state('root.trip.list.returned-late', {
			url: '/returned-late',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list--returned-late.tpl.html',
			data: {pageTitle: 'Te laat teruggebracht'},
			resolve: {
				bookings: ['bookingService', function (bookingService) {
					return bookingService.allLateBack();
				}]
			},
			role: 'ROLE_PROVIDER_ADMIN'
		});

		/**
		 * trip/
		 * @resolve {promise} booking
		 */
		$stateProvider.state('root.trip.list.remarked', {
			url: '/remarked',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list--remarked.tpl.html',
			data: {pageTitle: 'Ritten te laat teruggebracht'},
			resolve: {
				bookings: ['bookingService', function (bookingService) {
					return bookingService.marked();
				}]
			},
			role: 'ROLE_ADMIN'
		});

		/**
		 * trip/
		 * @resolve {promise} booking
		 */
		$stateProvider.state('root.trip.list.strange-kms', {
			url: '/strange-kms',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list--strange-kms.tpl.html',
			data: {pageTitle: 'Vreemde kilometerstanden'},
			resolve: {
				bookings: ['bookingService', function (bookingService) {
					return bookingService.strangeKms();
				}]
			},
			role: 'ROLE_ADMIN'
		});

		/**
		 * trip/
		 * @resolve {promise} booking
		 */
		$stateProvider.state('root.trip.list.current', {
			url: '/current',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list--current.tpl.html',
			data: {pageTitle: 'Lopende ritten'},
			resolve: {
				bookings: ['bookingService', function (bookingService) {
					return bookingService.actualBooking();
				}]
			},
			role: 'ROLE_PROVIDER_ADMIN'
		});

		/**
		 * trip/
		 * @resolve {promise} booking
		 */
		$stateProvider.state('root.trip.list.requested', {
			url: '/requested',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list--requested.tpl.html',
			data: {pageTitle: 'Ritten in aanvraag'},
			resolve: {
				bookings: ['bookingService', function (bookingService) {
					return bookingService.requested();
				}]
			},
			role: 'ROLE_PROVIDER_ADMIN'
		});

		/**
		 * trip/
		 * @resolve {promise} jobs
		 */
		$stateProvider.state('root.trip.list.jobs', {
			url: '/joblist',
			controller: 'TripJobsListController',
			templateUrl: 'trip/list/trip-job-list.tpl.html',
			data: {pageTitle: 'CCome opdrachten lijst'},
			resolve: {
				jobs: ['ccomeService', function (ccomeService) {
					return ccomeService.unfinishedJobs();
				}]
			},
			role: 'ROLE_ADMIN'
		});

		/**
		 * trip/
		 * @resolve {promise} booking
		 */
		$stateProvider.state('root.trip.list.notactive', {
			url: '/notactive',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list--not-active.tpl.html',
			data: {pageTitle: 'Niet actieve ritten'},
			resolve: {
				bookings: ['bookingService', function (bookingService) {
					return bookingService.futureByNotActiveDriver();
				}]
			},
			role: 'ROLE_ADMIN'
		});


		/**
		 * trip/disaproved
		 * @resolve {promise} booking
		 */
		$stateProvider.state('root.trip.list.disapproved', {
			url: '/disapproved',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list--disapproved.tpl.html',
			data: {pageTitle: 'Afgekeurde ritten'},
			resolve: {
				bookings: ['bookingService', function (bookingService) {
					return bookingService.disapprovedBookings();
				}]
			},
			role: 'ROLE_ADMIN'
		});

		/**
		 * trip/farfromhome
		 * @resolve {promise} booking
		 */
		$stateProvider.state('root.trip.list.farfromhome', {
			url: '/farfromhome',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list--farfromhome.tpl.html',
			data: {pageTitle: 'Ritten uit de buurt'},
			resolve: {
				bookings: ['bookingService', function (bookingService) {
					return bookingService.getFarFromHome({});
				}]
			},
			role: 'ROLE_PROVIDER_ADMIN'
		});

		/**
		 * trip/:id
		 * @resolve {promise} booking
		 */
		$stateProvider.state('root.trip.show', {
			abstract: true,
			url: '/:tripId',
			controller: 'TripShowController',
			templateUrl: 'trip/show/trip-show.tpl.html',
			data: {pageTitle: 'Rit'},
			resolve: {
				booking: ['$stateParams', 'bookingService', function ($stateParams, bookingService) {
					var bookingId = $stateParams.tripId;
					return bookingService.get({
						id: bookingId
					});
				}],
        contract: ['$stateParams', 'authService', 'contractService', function ($stateParams, authService, contractService) {
          return authService.me()
          .then(function(me) {
            return contractService.forBooking({
              booking: $stateParams.tripId
            });
          })
          .then(function(contract) {
            contract.type.canHaveDeclaration = false;
            if(contract.type.id === 60 || contract.type.id === 62 || contract.type.id === 50|| contract.type.id === 75 ) {
              contract.type.canHaveDeclaration = true;
            }
            return contract;
          });
        }],
				datacontext: ['$rootScope', 'booking', 'contract', function ($rootScope, booking, contract) {
					$rootScope.datacontext = {
						booking: booking,
						contract: contract,
						person: booking.person,
						contactPerson: booking.resource.contactPerson
					};
					return $rootScope.datacontext;
				}]
			},
			role: 'ROLE_PROVIDER_ADMIN'
		});

		/**
		 * trip/:id/summary
		 * @resolve {promise} trip, from parent
		 */
		$stateProvider.state('root.trip.show.summary', {
			url: '',
			templateUrl: 'trip/show/summary/trip-show-summary.tpl.html',
			controller: 'TripShowSummaryController'
		});

		/**
		 * trip/:id/summary
		 * @resolve {promise} trip, from parent
		 */
		$stateProvider.state('root.trip.dashboard', {
			url: '/dashboard/:tripId',
			templateUrl: 'trip/dashboard/trip-dashboard.tpl.html',
      controller: 'TripDashboardController',
			resolve: {
				booking: ['$stateParams', '$rootScope', 'bookingService', function ($stateParams, $rootScope, bookingService) {
					var bookingId = $stateParams.tripId;
					return bookingService.get({
						id: bookingId
					});
				}],
        contract: ['$stateParams', '$rootScope', 'authService', 'contractService', function ($stateParams, $rootScope, authService, contractService) {
          return authService.me()
          .then(function(me) {
            return contractService.forBooking({
              booking: $stateParams.tripId
            });
          })
          .then(function(contract) {
            contract.type.canHaveDeclaration = false;
            if(contract.type.id === 60 || contract.type.id === 62 || contract.type.id === 50) {
              contract.type.canHaveDeclaration = true;
            }
            return contract;
          });
        }],
				driverContracts: ['$stateParams', 'contractService', 'booking', function ($stateParams, contractService, booking) {
					return contractService.forDriver({
						person: booking.person.id
					}).then(function (contracts) {
            // why is this line --v here?
						//contracts.unshift({id: 50076, contractor: {firstName: 'Wheels4All'}, type: {name: ''}});
						return contracts;
					});
				}],
				datacontext: ['$rootScope', 'booking', 'contract', function ($rootScope, booking, contract) {
					$rootScope.datacontext = {
						booking: booking,
						contract: contract,
						person: booking.person,
						contactPerson: booking.resource.contactPerson
					};
					return $rootScope.datacontext;
				}]
			},
		});

		/**
		 * trip/:id/overview
		 * @resolve {promise} trip, from parent
		 * @resolve {promise} overview
		 */
		$stateProvider.state('root.trip.show.overview', {
			url: '/overview?person',
			controller: 'InvoiceTripShowController',
			templateUrl: 'invoice/trip/show/invoice-trip-show.tpl.html',
			data: {pageTitle: 'Rit overzicht'},
			resolve: {
				overview: ['$stateParams', 'invoiceService', 'booking', function ($stateParams, invoiceService, booking) {
					var bookingId = $stateParams.tripId;
					$stateParams.person = $stateParams.person || booking.person.id;
					return invoiceService.get({
						booking: bookingId,
						person: $stateParams.person
					});
				}]
			},
			role: 'ROLE_PROVIDER_ADMIN'
		});


		/**
		 * trip/:id/boardcomputer
		 * @resolve {promise} trip, from parent
		 * @resolve {promise} overview
		 */
		$stateProvider.state('root.trip.show.boardcomputer', {
			url: '/log',
			controller: 'ResourceShowLogController',
			templateUrl: 'resource/show/log/resource-show-log.tpl.html',
			data: {pageTitle: 'Rit boordcomputer log'},
			resolve: {
				logs: ['boardcomputerService', 'booking', function (boardcomputerService, booking) {
					var from;
					var to;
					from = booking.beginBooking;
					to = booking.endBooking;
					return boardcomputerService.log({resource: booking.resource.id, from: from, to: to});
				}]
			},
			role: 'ROLE_PROVIDER_ADMIN'
		});

		/**
		 * trip/:id/edit_booking
		 * @resolve {promise} trip, from parent
		 */
		$stateProvider.state('root.trip.show.edit_booking', {
			url: '/edit_booking',
			controller: 'TripShowEditBookingController',
			templateUrl: 'trip/show/edit_booking/trip-show-edit-booking.tpl.html',
			data: {pageTitle: 'Rit wijzigen'},
			role: 'ROLE_PROVIDER_ADMIN'
		});

		/**
		 * trip/:id/timeframe
		 * @resolve {promise} person, from parent.personId
		 */
		$stateProvider.state('root.trip.show.admin', {
			url: '/admin',
			controller: 'TripShowAdminController',
			templateUrl: 'trip/show/admin/trip-show-admin.tpl.html',
			data: {pageTitle: 'Rit admin'},
			resolve: {
				driverContracts: ['$stateParams', 'contractService', 'booking', function ($stateParams, contractService, booking) {
					return contractService.forDriver({
						person: booking.person.id
					}).then(function (contracts) {
						contracts.unshift({id: 50076, contractor: {firstName: 'Wheels4All'}, type: {name: ''}});
						return contracts;
					});
				}]
			},
			role: 'ROLE_PROVIDER_ADMIN'
		});

		/**
		 * trip/:id/lock
		 * @resolve {promise} resource, from parent.resource
		 */
		$stateProvider.state('root.trip.show.lock', {
			url: '/lock',
			controller: 'ResourceShowBoardcomputerController',
			templateUrl: 'resource/show/boardcomputer/resource-show-boardcomputer.tpl.html',
			data: {pageTitle: 'Rit auto openen / sluiten'},
			resolve: {
				resource: ['booking', function (booking) {
					return booking.resource;
				}]
			},
			role: 'ROLE_PROVIDER_ADMIN'
		});

		$stateProvider.state('root.trip.show.revisions', {
			url: '/revisions',
			templateUrl: 'trip/show/revisions/trip-show-revisions.tpl.html',
			controller: 'TripShowRevisionsController',
			data: {pageTitle: 'Rit wijzigingen'}
		});

	})

;
