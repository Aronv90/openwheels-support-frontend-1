'use strict';

angular.module('rpcServices', [])

    .service('resourceService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('resource.' + name);
      };
      this.search = m('search');
      this.get = m('get');
    })

    .service('personService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('person.' + name);
      };
      this.me = m('me');
      this.subscribe = m('subscribe');
      this.alter = m('alter');
      this.get = m('get');
      this.search = m('search');
      this.searchZip = m('searchZip');
      this.getByPhone = m('getByPhone');
      this.addPhoneWithPersonId = m('addPhoneWithPersonId');
      this.alterPhoneWithPhoneId = m('alterPhoneWithPhoneId');
      this.removePhone = m('dropPhoneWithPhoneId');
      this.uncheckedLicenseStatus = m('uncheckedLicenseStatus');
      this.addLicenseImages = m('addLicenseImages');
      this.blocked = m('blocked');
      this.blockedLike = m('blockedLike');
      this.tobankCheck = m('tobankCheck');
      this.ownerNotActive = m('ownerNotActive');
      this.addBadge = m('addBadge');
      this.alterBadge = m('alterBadge');
      this.removeBadge = m('removeBadge');
      this.enableGoogle2steps = m('enableGoogle2steps');
    })

    .service('ccomeService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('ccome.' + name);
      };
      this.unfinishedJobs = m('unfinishedJobs');
      this.getState = m('getState');
    })

    .service('phonecallService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('phonecall.' + name);
      };
      this.getRecentIncomingCalls = m('getRecentIncomingCalls');
    })

    .service('contractService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('contract.' + name);
      };
      this.get = m('get');
      this.alter = m('alter');
      this.create = m('create');
      this.allTypes = m('allTypes');
      this.forDriver = m('forDriver');
      this.forContractor = m('forContractor');
      this.addPerson = m('addPerson');
      this.removePerson = m('removePerson');
    })

    .service('contractTypeService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('contractType.' + name);
      };
      this.get = m('get');
    })

    .service('chipcardService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('chipcard.' + name);
      };
      this.forPerson = m('forPerson');
      this.create = m('create');
      this.alter = m('alter');
      this.getFish = m('getFish');
      this.createFish = m('createFish');
      this.deleteFish = m('deleteFish');
      this.block = m('block');
      this.unblock = m('unblock');
    })

    .service('voucherService', function (api) {
        var m = function (name) { return api.createRpcMethod('voucher.' + name ); };
        this.get = m('get');
        this.search = m('search');
        this.calculateRequiredCredit = m('calculateRequiredCredit');
        this.calculateCredit = m('calculateCredit');
        this.calculateDebt = m('calculateDebt');
        this.createVoucher = m('createVoucher');
        this.deleteVoucher = m('deleteVoucher');
        this.recalculate = m('recalculate');
      })

    .service('resourceService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('resource.' + name);
      };
      this.get = m('get');
      this.create = m('create');
      this.alter = m('alter');
      this.remove = m('remove');
      this.select = m('select');
      this.forOwner = m('forOwner');
      this.search = m('search');
      this.searchV2 = m('searchV2');
      this.allFleets = m('allFleets');
      this.getMembers = m('getMembers');
      this.addMember = m('addMember');
      this.removeMember = m('removeMember');
      this.addProperty = m('addProperty');
      this.removeProperty = m('remProperty');
    })

    .service('ratingService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('rating.' + name);
      };
      this.getResourceRatings = m('getResourceRatings');
      this.getDriverRatings = m('getDriverRatings');
    })

    .service('bookingService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('booking.' + name);
      };
      this.alterRequest = m('alterRequest');
      this.acceptRequest = m('acceptRequest');
      this.rejectRequest = m('rejectRequest');
      this.create = m('create');
      this.get = m('get');
      this.alter = m('alter');
      this.stop = m('stop');
      this.cancel = m('cancel');
      this.setTrip = m('setTrip');
      this.contract = m('contract');

      this.strangeKms = m('strangeKms');
      this.marked = m('marked');
      this.allLateBack = m('allLateBack');
      this.requested = m('requested');
      this.actualBooking = m('actualBooking');
      this.futureByNotActiveDriver = m('futureByNotActiveDriver');

      this.forResource = m('forResource');
      this.getBookingList = m('getBookingList');
      this.getFarFromHome = m('getFarFromHome');

      this.disapprovedBookings = m('disapprovedBookings');
      this.approve = m('approve');
      this.disapprove = m('disapprove');

      this.checked = m('checked');

      this.bookingWeekKPIData = m('bookingWeekKPIData');
    })

    .service('invoiceService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('invoice.' + name);
      };
      this.get = m('get');
      this.allGroups = m('allGroups');
      this.listGroups = m('listGroups');
      this.getGroup = m('getGroup');
      this.createInvoiceLine = m('createInvoiceRule');
      this.removeInvoiceLine = m('removeInvoiceRule');
      this.createGeneric = m('createGeneric');
      this.dropInvoice = m('dropInvoice');
      this.paymentsForPerson = m('paymentsForPerson');
      this.finalizeGroup = m('finalizeGroup');
      this.printLast = m('printLast');

      // TODO: this api call is going to be refactored in the backend to invoice
      var m2 = function (name) {
        return api.createRpcMethod('account.' + name);
      };
      this.alterInvoiceLine = m2('alterInvoiceRule');
    })

  .service('invoice2Service', function (api) {
    var m = function (name) { return api.createRpcMethod('invoice2.' + name ); };
    this.approve                    = m('approve');
    this.disapprove                 = m('disapprove');
    this.calculatePrice             = m('calculatePrice');
    this.get                        = m('get');
    this.getSent                    = m('getSent');
    this.getReceived                = m('getReceived');
    this.getInvoiceGroup            = m('getInvoiceGroup');
    this.getDebtors                 = m('getDebtors');
    this.getCreditors               = m('getCreditors');
    this.create                     = m('create');
    this.alter                      = m('alter');
    this.createSenderInvoiceGroup   = m('createSenderInvoiceGroup');
  })

  .service('paymentService', function (api) {
    var m = function (name) { return api.createRpcMethod('payment.' + name); };
    this.pay                    = m('pay');
    this.payBooking             = m('payBooking');
    this.payInvoiceGroup        = m('payInvoiceGroup');
    this.getInvoiceGroups       = m('getInvoiceGroups');
    this.getPayouts             = m('getPayouts');
    this.getPayments            = m('getPayments');
    this.processPayout          = m('processPayout');
    this.deletePayout           = m('deletePayout');
    this.payoutVoucher          = m('payoutVoucher');
    this.refundBooking          = m('refundBooking');
    this.payoutInvoiceGroup     = m('payoutInvoiceGroup');
  })

    .service('accountService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('account.' + name);
      };
      this.all = m('all');
      this.belowCredit = m('belowCredit');
      this.get = m('get');
      this.alter = m('alter');
      this.transactions = m('transactions');
      /*this.invoices = service.createMethod('invoices', {headers: authHeaderService.headers });
       this.createInvoiceLine = service.createMethod('createInvoiceLine', {headers: authHeaderService.headers });
       this.createInvoiceLine = service.createMethod('createInvoiceLine', {headers: authHeaderService.headers });
       */
      this.createMutation = m('createMutation');
      this.removeMutation = m('removeMutation');
      this.alterMutation = m('alterMutation');
      this.splitMutation = m('splitMutation');
    })

    .service('account2Service', function (api) {
      var m = function (name) {
        return api.createRpcMethod('account2.' + name);
      };
      this.search = m('search');
      this.approve = m('approve');
      this.disapprove = m('disapprove');
    })

    .service('discountService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('discount.' + name);
      };
      this.search = m('search');
      this.create = m('create');
      this.apply = m('apply');
      this.disable = m('disable');
      this.get = m('get');
    })

    .service('incassoService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('incasso.' + name);
      };
      this.createIncasso = m('create');
      this.createStorting = m('createStorting');
      this.all = m('all');
      this.batches = m('batches');
    })

    .service('boardcomputerService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('boardcomputer.' + name);
      };
      this.control = m('control');
      this.log = m('log');
      this.tripdata = m('tripdata');
    })

    .service('conversationService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('conversations.' + name);
      };
      this.getAll = m('getAllAsArray');
      this.getSingle = m('getSingle');
      this.count = m('count');
      this.getTypes = m('getTypesAsArray');
      this.getType = m('getTypeAsArray');
    })

    .service('bankService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('bank.' + name);
      };
      this.all = m('all');
      this.notLinkedToMutation = m('notLinkedToMutation');
      this.unknownAccount = m('unknownAccount');
      this.link = m('link');
      this.rematch = m('rematch');
    })

    .service('providerService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('provider.' + name);
      };
      this.getAll = m('getAll');
    })

    .service('rentalcheckService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('rentalcheck.' + name);
      };
      this.checkPerson = m('checkPerson');
      this.previousChecks = m('previousChecks');
    })

    .service('revisionsService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('revisions.' + name);
      };
      this.revisions = m('revisions');
    })

    .service('actionsService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('actions.' + name);
      };
      this.all = m('all');
      this.delete = m('delete');
    })

    .service('mailingruleService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('mailingrule.' + name);
      };
      this.get = m('getRulesAsArray');
    })

    .service('storedqueryService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('storedquery.' + name);
      };
      this.all = m('all');
      this.execute = m('execute');
      this.alter = m('alter');
      this.create = m('create');
      this.mute = m('mute');
      this.unmuted = m('unmuted');
    })
    .service('checklistService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('checklist.' + name);
      };
      this.all = m('all');
      this.alter = m('alter');
      this.create = m('create');
      this.get = m('get');
    })
    .service('queryreportService', function (api) {
      var m = function (name) {
        return api.createRpcMethod('queryreport.' + name);
      };
      this.all = m('all');
      this.alter = m('alter');
      this.create = m('create');
      this.get = m('get');
      this.execute = m('execute');
      this.addQuery = m('addQuery');
      this.remQuery = m('remQuery');
    })
    ;
