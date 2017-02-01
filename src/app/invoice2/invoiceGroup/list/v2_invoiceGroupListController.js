'use strict';

angular.module('openwheels.invoice2.invoiceGroup.list', [])

.controller('v2_InvoiceGroupListController', function (
  $scope,
  $state,
  $stateParams,
  settingsService,
  alertService,
  account2Service,
  invoiceGroups,
  ungroupedReceivedInvoices,
  ungroupedSentInvoices,
  invoice2Service,
  accounts,
  paymentService,
  voucherService,
  API_DATE_FORMAT
  ) {

  $scope.invoiceGroups = invoiceGroups;
  $scope.ungroupedReceivedInvoices = ungroupedReceivedInvoices;
  $scope.ungroupedReceivedInvoicesTotal = calculateTotal(ungroupedReceivedInvoices);
  $scope.ungroupedSentInvoices = ungroupedSentInvoices;
  $scope.ungroupedSentInvoicesTotal = calculateTotal(ungroupedSentInvoices);
  $scope.accounts = accounts;

  $scope.FRONT_BASE = settingsService.settings.server;

  function calculateTotal (invoices) {
    var sum = 0;
    var hasError = false;
    angular.forEach(invoices, function (invoice) {
      var invoiceTotal;
      try {
        invoiceTotal = parseFloat(invoice.total);
        sum += invoiceTotal;
      } catch (e) {
        hasError = true;
      }
    });
    return hasError ? null : sum;
  }

  $scope.removeInvoiceGroup = function(id) {
    alertService.load();
    alertService.closeAll();
    invoice2Service.removeInvoiceGroup({invoiceGroup: id})
    .then(function(res) {
      $scope.invoiceGroups = _.without($scope.invoiceGroups, _.findWhere($scope.invoiceGroups, {
          id: id 
      }));
    })
    .catch(alertService.addError).finally(alertService.loaded);

  };

  /* approve an account */
  $scope.approve = function (account) {
    alertService.load($scope);
    account2Service.approve({
      person: account.person.id,
      iban: account.iban
    })
    .then(function () {
      account.approved = true;
    })
    .catch(alertService.addError).finally(alertService.loaded);
  };

  /* disapprove an account */
  $scope.disapprove = function (account) {
    alertService.load($scope);
    account2Service.disapprove({
      person: account.person.id,
      iban: account.iban
    })
    .then(function () {
      account.approved = false;
    })
    .catch(alertService.addError).finally(alertService.loaded);
  };

  // 1) verzamel invoices
  // 2) verzoek om uitbetaling verzamelfactuur
  $scope.payoutInvoices = function () {
    alertService.load($scope);
    invoice2Service.createSenderInvoiceGroup({ person: $stateParams.personId }).then(function (invoiceGroup) {
      $scope.ungroupedSentInvoices.length = 0;
      $scope.invoiceGroups = $scope.invoiceGroups || [];
      $scope.invoiceGroups.push(invoiceGroup);
      return $scope.payoutInvoiceGroup(invoiceGroup);
    })
    .catch(alertService.addError).finally(alertService.loaded);
  };

  // verzoek om uitbetaling verzamelfactuur
  $scope.payoutInvoiceGroup = function (invoiceGroup) {
    alertService.load($scope);
    return paymentService.payoutInvoiceGroup({ invoiceGroup: invoiceGroup.id }).then(function (result) {
      // add fake payout request
      invoiceGroup.payoutRequest = {
        created: moment().format(API_DATE_FORMAT)
      };
    })
    .catch(alertService.addError).finally(alertService.loaded);
  };

  // verzoek om verzamelfactuur als voucher uit te betalen
  $scope.payoutToVoucher = function (invoiceGroup) {
    alertService.load($scope);
    return voucherService.payoutToVoucher({ group: invoiceGroup.id }).then(function (result) {
      // set invoiceGroup to paid
      invoiceGroup.paid = moment().format(API_DATE_FORMAT);
    })
    .catch(alertService.addError).finally(alertService.loaded);
  };
  
  // bundle alle ontvangen invoice lines tot een invoiceGroup
  $scope.createRecipientGroup = function (user) {
    alertService.load($scope, 'Bundeling invoices');
    invoice2Service.createRecipientInvoiceGroup({person: user, positiveOnly: false})
    .then($scope.refresh);
  };

  $scope.params = (function () {
    var p = {
      status: $stateParams.status || '',
      from  : $stateParams.from   || '',
      until : $stateParams.until  || '',
      max   : $stateParams.max    || ''
    };
    return p;
  })();

  $scope.maxOptions = [
    {label: '', value: '' },
    {label: '20', value: '20'},
    {label: '50', value: '50'},
    {label: '100', value: '100'}
  ];

  $scope.statusOptions = [
    {label: '', value: '' },
    {label: 'Unpaid', value: 'unpaid'},
    {label: 'Paid', value: 'paid'},
    {label: 'Both', value: 'both'}
  ];

  $scope.dateConfig = {
    //model
    modelFormat: 'YYYY-MM-DD',
    formatSubmit: 'yyyy-mm-dd',

    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',

    //options
    selectMonths: true
  };

  $scope.refresh = function () {
    $state.go($state.current.name, $scope.params, {reload: true});
  };

});
