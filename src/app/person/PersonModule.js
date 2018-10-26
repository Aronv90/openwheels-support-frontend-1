'use strict';

angular.module('openwheels.person', [
	'openwheels.person.show',
	'openwheels.person.blacklist',
	'openwheels.person.create',
	'openwheels.person.search',
	'openwheels.person.edit.data',
	'openwheels.person.rentalcheck',
	'openwheels.person.show.payouts',
	'openwheels.contract.request',
	'openwheels.person.show.damage'
])

	.config(function ($stateProvider) {

		/**
		 * person
		 */
		$stateProvider.state('root.person', {
			abstract: true,
			url: '/person',
			views: {
				'main@': {
					template: '<div ui-view></div>'
				}
			}
		});

		/**
		 * person/search
		 */
		$stateProvider.state('root.person.search', {
			url: '/search',
			controller: 'PersonSearchController',
			templateUrl: 'person/search/person-search.tpl.html',
			data: {pageTitle: 'Search person'}
		});

		/**
		 * person/create
		 */
		$stateProvider.state('root.person.create', {
			url: '/create',
			controller: 'PersonCreateController',
			templateUrl: 'person/create/person-create.tpl.html',
			data: {pageTitle: 'Create Resource'}
		});

		/**
		 * checklist/blacklist
		 * @resolve {promise} persons
		 */
		$stateProvider.state('root.person.blacklist', {
			url: '/blacklist',
			controller: 'PersonBlacklistController',
			templateUrl: 'person/blacklist/person-blacklist.tpl.html',
			data: {pageTitle: 'Person Blacklist'},
			resolve: {
				persons: ['$stateParams', 'personService', function ($stateParams, personService) {
					return personService.blocked({params: {}});
				}]
			},
			role: 'ROLE_ADMIN'
		});

		/**
		 * person/:id
		 * @resolve {promise} person
		 */
		$stateProvider.state('root.person.show', {
			abstract: true,
			url: '/:personId',
			controller: 'PersonShowController',
			templateUrl: 'person/show/person-show.tpl.html',
			resolve: {
				person: ['$stateParams', 'personService', function ($stateParams, personService) {
					var personId = $stateParams.personId;
					return personService.get({
						id: personId,
						version: 2
					});
				}]
			}
		});

		/**
		 * person/:id/summary
		 * @resolve {promise} person, from parent
		 */
		$stateProvider.state('root.person.show.summary', {
			url: '',
			controller: 'PersonShowSummaryController',
			templateUrl: 'person/show/summary/person-show-summary.tpl.html',
			data: {pageTitle: 'Person summary'},
			resolve: {
				bookings: ['$stateParams', 'bookingService', function ($stateParams, bookingService) {
					var startDate = moment().subtract(1, 'd');
					var endDate = moment().add(1, 'w');

					return bookingService.getBookingList({
						person: $stateParams.personId,
						cancelled: true,
						timeFrame: {
							startDate: startDate.format('YYYY-MM-DD HH:mm'),
							endDate: endDate.format('YYYY-MM-DD HH:mm')
						},
						limit: 50
					});
				}]
			}
		});

		/**
		 * person/:id/trip
		 * @resolve {promise} person, from parent
		 * @resolve {promise} bookings
		 */
		$stateProvider.state('root.person.show.trip', {
			url: '/trip?startDate&endDate',
			controller: 'TripListController',
			templateUrl: 'trip/list/trip-list.tpl.html',
			data: {pageTitle: 'Person Trip list'},
			resolve: {
				bookings: ['$stateParams', 'bookingService', function ($stateParams, bookingService) {
					var startDate = $stateParams.startDate ? moment($stateParams.startDate) : moment().subtract(1, 'months');
					var endDate = $stateParams.endDate ? moment($stateParams.endDate) : moment().add(1, 'months');

					return bookingService.getBookingList({
						person: $stateParams.personId,
						cancelled: true,
						timeFrame: {
							startDate: startDate.format('YYYY-MM-DD HH:mm'),
							endDate: endDate.format('YYYY-MM-DD HH:mm')
						},
						limit: 50
					});
				}]
			}
		});

		/**
		 * person/:id/data
		 * @resolve {promise} person, from parent
		 */
		$stateProvider.state('root.person.show.data', {
			abstract: true,
			url: '/data',
			templateUrl: 'person/show/data/person-show-data.tpl.html',
			data: {pageTitle: 'Person data'}
		});

		/**
		 * person/:id/data/personal
		 * @resolve {promise} person, from parent
		 */
		$stateProvider.state('root.person.show.data.personal', {
			url: '',
			controller: 'PersonEditPersonalController',
			templateUrl: 'person/edit/personal/person-edit-personal.tpl.html',
			data: {pageTitle: 'Personal data'}
		});

		/**
		 * person/:id/data/account
		 * @resolve {promise} person, from parent
		 */
		$stateProvider.state('root.person.show.data.account', {
			url: '/account',
			controller: 'PersonEditAccountController',
			templateUrl: 'person/edit/account/person-edit-account.tpl.html',
			data: {pageTitle: 'Person account data'},
			resolve: {
				account: ['$stateParams', 'accountService', function ($stateParams, accountService) {
					return accountService.get({
						person: $stateParams.personId
					});
				}]
			}
		});

		/**
		 * person/:id/data/contact
		 * @resolve {promise} person, from parent
		 */
		$stateProvider.state('root.person.show.data.contact', {
			url: '/contact',
			controller: 'PersonEditContactController',
			templateUrl: 'person/edit/contact/person-edit-contact.tpl.html',
			data: {pageTitle: 'Person data'}
		});

		/**
		 * person/:id/data/settings
		 * @resolve {promise} person, from parent
		 */
		$stateProvider.state('root.person.show.data.settings', {
			url: '/settings',
			controller: 'PersonEditSettingsController',
			templateUrl: 'person/edit/settings/person-edit-settings.tpl.html',
			data: {pageTitle: 'Person data'}
		});

		/**
		 * person/:id/data/phonenumbers
		 * @resolve {promise} person, from parent
		 */
		$stateProvider.state('root.person.show.data.phonenumbers', {
			url: '/phonenumbers',
			controller: 'PersonEditPhonenumberListController',
			templateUrl: 'person/edit/phonenumber/list/person-edit-phonenumber-list.tpl.html',
			data: {pageTitle: 'Person Phonenumbers'}
		});

		/**
		 * person/:id/invoice-group
		 * @resolve {promise} person, from parent
		 */
		$stateProvider.state('root.person.show.invoice-group', {
			abstract: true,
			url: '/invoice-group',
			template: '<div ui-view></div>',
			data: {pageTitle: 'Person invoice group list'}
		});

		/**
		 * person/:id/invoice-group?page=
		 * @resolve {promise} person, from parent
		 * @resolve {promise} invoiceGroups
		 */
		$stateProvider.state('root.person.show.invoice-group.list', {
			url: '?page&limit&due&amount&unpaid&overpaid&owner',
			controller: 'InvoiceGroupListController',
			templateUrl: 'invoice/group/list/invoice-group-list.tpl.html',
			data: {pageTitle: 'Person invoice group list'},
			resolve: {
				invoiceGroups: ['$stateParams', '$q', '$log', 'invoiceService', function ($stateParams, $q, $log, invoiceService) {
					var personId = $stateParams.personId;

					var limit = $stateParams.limit || 20;
					var page = $stateParams.page || 1;
					var due = $stateParams.due === 'false' ? null : $stateParams.due;
					var gtAmount = ( $stateParams.amount > 0 ) ? $stateParams.amount : null;
					var ltAmount = ( $stateParams.amount < 0 ) ? $stateParams.amount : null;
					var ltDue = $stateParams.ltdue || null;
					var unpaid = $stateParams.unpaid === 'true';
					var overpaid = $stateParams.overpaid === 'true';
					var owner = $stateParams.owner === 'true';
					return $q.all([invoiceService.allGroups({
						limit: limit,
						page: page - 1,
						filter: {
							due: due,
							ltDue: ltDue,
							ltAmount: ltAmount,
							gtAmount: gtAmount,
							person: personId,
							unpaid: unpaid,
							overpaid: overpaid,
							owner: owner
						}
					}), invoiceService.paymentsForPerson({
						person: $stateParams.personId
					})])
						.then(function (results) {
							for (var i = results[0].result.length - 1; i >= 0; i--) {
								//maak payments array aan
								results[0].result[i].payments = [];
								for (var j = results[1].length - 1; j >= 0; j--) {
									if (results[1][j].id === results[0].result[i].id) {
										results[0].result[i].payments = results[1][j].payments;
										break;
									}
								}
							}
							return results[0];
						});
				}]
			}
		});

    /**
     * Invoice module version 2
     **/
    $stateProvider.state('root.person.show.invoiceGroupV2', {
      abstract: true,
      url: '/invoice-group/v2',
      template: '<div ui-view></div>',
      data: {pageTitle: 'Person invoice group list'}
    });

    $stateProvider.state('root.person.show.invoiceGroupV2.list', {
      url: '?status&from&until&max',
      controller: 'v2_InvoiceGroupListController',
      templateUrl: 'invoice2/invoiceGroup/list/v2_invoiceGroupList.tpl.html',
      data: {pageTitle: 'Person invoice group list'},
      resolve: {
        ungroupedReceivedInvoices: ['$stateParams', 'invoice2Service', function ($stateParams, invoice2Service) {
          return invoice2Service.getReceived({
            person: $stateParams.personId,
            grouped: 'ungrouped'
          });
        }],
        ungroupedSentInvoices: ['$stateParams', 'invoice2Service', function ($stateParams, invoice2Service) {
          return invoice2Service.getSent({
            person: $stateParams.personId,
            grouped: 'ungrouped'
          });
        }],
        invoiceGroups: ['$stateParams', 'paymentService', function ($stateParams, paymentService) {
          var req = $stateParams;
          var params = {
            person: $stateParams.personId
          };
          if (req.status) { params.status = req.status; }
          if (req.from)   { params.from   = req.from; }
          if (req.until)  { params.until  = req.until; }
          if (req.max)    {
            try {
              params.max = parseInt(req.max);
            } catch (e) {
            }
          }
          return paymentService.getInvoiceGroups(params);
        }],
        accounts: ['$stateParams', 'account2Service', function ($stateParams, account2Service) {
          return account2Service.search({person: $stateParams.personId, unchecked: null});
        }]
      }
    });


	/**
	 * person/:id/invoice-group/:id
	 * @resolve {promise} person, from parent
	 * @resolve {promise} invoiceGroup
	 */
	$stateProvider.state('root.person.show.invoice-group.show', {
		url: '/:invoiceGroupId',
		controller: 'InvoiceGroupShowController',
		templateUrl: 'invoice/group/show/invoice-group-show.tpl.html',
		data: {pageTitle: 'Person invoice group'}
		/*resolve: {
		 invoiceGroupId: function ($stateParams) {
		 return $stateParams.invoiceGroupId;
		 }
		 }*/
	});

	/**
	 * person/:id/contracts
	 * @resolve {promise} person, from parent
	 * @resolve {promise} ownerContracts
	 * @resolve {promise} driverContracts
	 */
	$stateProvider.state('root.person.show.contracts', {
		url: '/contracts',
		controller: 'PersonShowContractsController',
		templateUrl: 'person/show/contracts/person-show-contracts.tpl.html',
		data: {pageTitle: 'Person contracts'},
		resolve: {
			contracts: ['$stateParams', '$q', 'contractService', function ($stateParams, $q, contractService) {
				return contractService.forDriver({
					person: $stateParams.personId,
					onlyActive: false
				});

			}]
		}
	});

	/**
	 * person/:id/chipcards
	 * @resolve {promise} person, from parent
	 * @resolve {promise} chipcards
	 */
	$stateProvider.state('root.person.show.chipcards', {
		url: '/chipcards',
		controller: 'PersonShowChipcardsController',
		templateUrl: 'person/show/chipcards/person-show-chipcards.tpl.html',
		data: {pageTitle: 'Person chipcards'},
		resolve: {
			chipcards: ['$stateParams', 'chipcardService', function ($stateParams, chipcardService) {
				return chipcardService.forPerson({
					person: $stateParams.personId,
					onlyActive: false
				});
			}],
			fish: ['$stateParams', 'chipcardService', function ($stateParams, chipcardService) {
				return chipcardService.getFish({person: $stateParams.personId});
			}]
		}
	});

	/**
	 * person/:id/rating
	 * @resolve {promise} person, from parent
	 */
	$stateProvider.state('root.person.show.rating', {
		url: '/rating',
		controller: 'PersonShowRatingController',
		templateUrl: 'person/show/rating/person-show-rating.tpl.html',
		data: {pageTitle: 'Person rating'},
		resolve: {
			ratings: ['$stateParams', 'ratingService', function ($stateParams, ratingService) {
				return ratingService.getDriverRatings({
					driver: $stateParams.personId
				});
			}]
		}
	});

	/**
	 * person/:id/badges
	 * @resolve {promise} person, from parent
	 */
	$stateProvider.state('root.person.show.badges', {
		url: '/badges',
		controller: 'PersonShowBadgesController',
		templateUrl: 'person/show/badges/person-show-badges.tpl.html',
		data: {pageTitle: 'Person Badges'}
	});

    $stateProvider.state('root.person.show.messages', {
      url: '/messages',
      controller: 'PersonShowMessagesController',
      templateUrl: 'person/show/messages/person-show-messages.tpl.html',
      data: {pageTitle: 'Person Messages'},
      resolve: {
        messages: ['$stateParams', 'messageService', 'perPage', function ($stateParams, messageService, perPage) {
          var params = {};
          params.person = $stateParams.personId;
          params.limit = perPage;
          params.offset = 0;

          return messageService.getMessages(params);
        }],
        perPage: function(){ return 20;}
      }
    });

    $stateProvider.state('root.person.show.messagesms', {
      url: '/messagesms',
      controller: 'PersonShowMessageSmsController',
      templateUrl: 'person/show/messagesms/person-show-messagesms.tpl.html',
      data: {pageTitle: 'Person Push Messages'},
      resolve: {
        messagesms: ['$stateParams', 'messageService', 'perPage', function ($stateParams, messageService, perPage) {
          var params = {};
          params.person = $stateParams.personId;
          params.limit = perPage;
          params.offset = 0;

          return messageService.getPushMessages(params);
        }],
        perPage: function(){ return 20;}
      }
    });

    $stateProvider.state('root.person.show.communication', {
      url: '/communication',
      controller: 'PersonShowCommunicationController',
      templateUrl: 'person/show/communication/person-show-communication.tpl.html',
      data: {pageTitle: 'Person Communication Messages'},
      resolve: {
        communication: ['$stateParams', 'conversationService', 'perPage', function ($stateParams, conversationService, perPage) {
          var params = {};
          params.person = $stateParams.personId;
          params.limit = perPage;
          params.offset = 0;

          return conversationService.getCommunicationMessages(params);
        }],
        perPage: function(){ return 20;}
      }
    });

	/* Vouchers */
	$stateProvider.state('root.person.show.vouchers', {
		url: '/vouchers',
		controller: 'PersonShowVouchersController',
		templateUrl: 'person/show/vouchers/person-show-vouchers.tpl.html',
		data: {pageTitle: 'Person Vouchers'},
	});

	/* Payouts */
	$stateProvider.state('root.person.show.payouts', {
		url: '/payouts',
		controller: 'PersonShowPayoutsController',
		templateUrl: 'person/show/payouts/payouts.tpl.html',
		data: {pageTitle: 'Person Payouts'},
  		resolve: {
  			payouts: ['$stateParams', 'paymentService', function ($stateParams, paymentService) {
    			return paymentService.getPayouts({person: $stateParams.personId});
			}]
		}
	});

	$stateProvider.state('root.person.show.revisions', {
		url: '/revisions',
		controller: 'PersonShowRevisionsController',
		templateUrl: 'person/show/revisions/person-show-revisions.tpl.html',
		data: {pageTitle: 'Person Revisions'},
		resolve: {
			contracts: ['$stateParams', 'contractService', function ($stateParams, contractService) {
				var personId = $stateParams.personId;
				return contractService.forDriver({
					person: personId,
					onlyActive: false
				});
			}]
		}
	});

	$stateProvider.state('root.person.show.actions', {
		url: '/actions',
		controller: 'PersonShowActionsController',
		templateUrl: 'person/show/actions/person-show-actions.tpl.html',
		data: {pageTitle: 'Person Actions'},
		resolve: {
			actions: ['$stateParams', 'actionsService', function ($stateParams, actionsService) {
				var personId = $stateParams.personId;
				return actionsService.all({
					person: personId
				});
			}]
		}
	});


	/**
	 * person/:id/transaction
	 * @resolve {promise} person, from parent
	 */
	$stateProvider.state('root.person.show.transaction', {
		abstract: true,
		url: '/transaction',
		template: '<div ui-view></div>',
		data: {pageTitle: 'Person transaction list'},
		resolve: {
			account: ['$stateParams', 'accountService', function ($stateParams, accountService) {
				var personId = $stateParams.personId;
				return accountService.get({
					person: personId
				});
			}]
		}
	});

	/**
	 * person/:id/transaction?page=
	 * @resolve {promise} person, from parent
	 * @resolve {promise} invoiceGroups
	 */
	$stateProvider.state('root.person.show.transaction.list', {
		url: '?page&limit',
		controller: 'InvoiceTransactionListController',
		templateUrl: 'invoice/transaction/list/invoice-transaction-list.tpl.html',
		data: {pageTitle: 'Person transaction list'},
		resolve: {
			transactions: ['$stateParams', 'accountService', 'account', function ($stateParams, accountService, account) {
				return accountService.transactions({
					id: account.id
				});
			}]
		}
	});

	/**
	 * person/:id/resource
	 * @resolve {promise} person, from parent
	 */
	$stateProvider.state('root.person.show.resource', {
		abstract: true,
		url: '/resource',
		template: '<div ui-view></div>',
		data: {pageTitle: 'Person resource list'}
	});

	/**
	 * person/:id/resource?page=
	 * @resolve {promise} person, from parent
	 * @resolve {promise} resource
	 */
	$stateProvider.state('root.person.show.resource.list', {
		url: '?page',
		controller: 'ResourceListController',
		templateUrl: 'resource/list/resource-list.tpl.html',
		data: {pageTitle: 'Person resource list'},
		resolve: {
			resources: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
				var personId = $stateParams.personId;
				return resourceService.search({
					owner: personId,
					page: 0,
					perPage: 25
				});
			}],
			resourceMembers: ['$stateParams', 'resourceService', function ($stateParams, resourceService) {
				var personId = $stateParams.personId;
				return resourceService.getMemberResources({
					person: personId
				});
			}]
		}
	});

	/**
	 * person/:id/driverlicense
	 * @resolve {promise} person, from parent
	 */
	$stateProvider.state('root.person.show.data.driverlicense', {
		url: '/driverlicense',
		controller: 'PersonEditDriverlicenseController',
		templateUrl: 'person/edit/driverlicense/person-edit-driverlicense.tpl.html',
		data: {pageTitle: 'Person Driver License'},
		resolve: {
			blockedLike: ['$q', '$stateParams', 'personService', 'authService', function ($q, $stateParams, personService, authService) {
				var personId = $stateParams.personId;
      return personService.blockedLike({
        person: personId
      });
			}],
			similar: ['$q', '$stateParams', 'personService', 'authService', function ($q, $stateParams, personService, authService) {
				var personId = $stateParams.personId;
      return personService.similar({
        person: personId
      });
			}],
			account: ['$stateParams', 'accountService', function ($stateParams, accountService) {
				return accountService.get({
					person: $stateParams.personId
				});
			}]
		}
	});

	/**
	 * person/:id/rentalcheck
	 * @resolve {promise} person, from parent
	 */
	$stateProvider.state('root.person.show.data.rentalcheck', {
		url: '/rentalcheck',
		controller: 'PersonRentalcheckController',
		templateUrl: 'person/rentalcheck/person-rentalcheck.tpl.html'
	});


	/**
	 * person /:id/damage
	 * @resolve {promise} person
	 */
	$stateProvider.state('root.person.show.damage', {
		url: '/damage?finalized&max&offset',
		controller: 'PersonShowDamageController',
		templateUrl: 'person/show/damage/person-show-damage.tpl.html',
		data: {pageTitle: 'Person damage'},
		resolve: {
			damages: ['$stateParams', 'damageService', 'person', 'perPage', function ($stateParams, discountService, person, perPage) {
				var params = {};
				params.personId = person.id;
      			params.finalized = $stateParams.finalized;
      			params.max = perPage;
      			params.offset = 0;
				return discountService.search(params);
			}],
			perPage: function(){ return 20;},
		}
	});


	})

;
