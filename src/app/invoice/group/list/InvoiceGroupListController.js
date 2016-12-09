'use strict';

angular.module('openwheels.invoice.group.list', ['ngDragDrop'])

  .controller('InvoiceGroupListController', function ($window, $uibModal, $q, $scope, $state, $stateParams, $filter, dialogService,
																		FRONT_USER_INVOICEGROUP, settingsService, invoiceGroups, accountService, invoiceService, alertService) {
    $scope.moveMutation = function (test, ui, invoiceGroupId) {
      var paymentId = ui.draggable.prop('id');
      accountService.alterMutation({
        mutation: paymentId,
        groupedInvoice: invoiceGroupId
      })
        .then(function (response) {
          alertService.add('success', 'Payment edited', 2000);
        }, function (error) {
          alertService.add('success', error.message, 5000);
        });
    };

    $scope.invoiceGroupDate = null;

    $scope.params = {
      date: $stateParams.date || null,
      ltdate: $stateParams.ltdate || null,
      concept: $stateParams.concept === 'true' || null,
      page: $stateParams.page || 1,
      gtamount: $stateParams.gtamount ? parseInt($stateParams.gtamount, 10) : null,
      ltamount: $stateParams.ltamount ? parseInt($stateParams.ltamount, 10) : null,
      unpaid: $stateParams.unpaid === 'true' || false,
      overpaid: $stateParams.overpaid === 'true' || false,
      owner: $stateParams.owner === 'true' || false,
      renter: $stateParams.renter === 'true' || false,
      limit: $stateParams.limit || 20,
      neq_saldo: $stateParams.neq_saldo === 'true' || false,
      has_mandate: $stateParams.has_mandate  === 'true' || false,
      no_mandate: $stateParams.no_mandate  === 'true' || false
    };

    $scope.invoiceDateConfig = {
      //model
      modelFormat: 'YYYY-MM-DD',
      formatSubmit: 'yyyy-mm-dd',

      //view
      viewFormat: 'DD-MM-YYYY',
      format: 'dd-mm-yyyy',

      //options
      selectMonths: true
    };

    $scope.invoiceGroups = invoiceGroups.result;
    $scope.frontInvoiceGroupPath = settingsService.settings.server + FRONT_USER_INVOICEGROUP + '/';

    //pagination
    $scope.totalItems = invoiceGroups.cnt;
    $scope.maxSize = 7;

    $scope.amountOptions = [
      { label: 'Uitbetaling > ' + $filter('currency')(5), value: '-5', type: 'Uitbetaling' },
      { label: 'Uitbetaling > ' + $filter('currency')(10), value: '-10', type: 'Uitbetaling' },
      { label: 'Uitbetaling > ' + $filter('currency')(25), value: '-25', type: 'Uitbetaling' },
      { label: 'Uitbetaling > ' + $filter('currency')(100), value: '-100', type: 'Uitbetaling' },
      { label: 'Uitbetaling > ' + $filter('currency')(250), value: '-250', type: 'Uitbetaling' },
      { label: 'Uitbetaling > ' + $filter('currency')(500), value: '-500', type: 'Uitbetaling' },
      { label: 'Uitbetaling > ' + $filter('currency')(1000), value: '-1000', type: 'Uitbetaling' },

      { label: 'Incasso > ' + $filter('currency')(5), value: '5', type: 'Incasso' },
      { label: 'Incasso > ' + $filter('currency')(10), value: '10', type: 'Incasso' },
      { label: 'Incasso > ' + $filter('currency')(25), value: '25', type: 'Incasso' },
      { label: 'Incasso > ' + $filter('currency')(100), value: '100', type: 'Incasso' },
      { label: 'Incasso > ' + $filter('currency')(250), value: '250', type: 'Incasso' },
      { label: 'Incasso > ' + $filter('currency')(500), value: '500', type: 'Incasso' },
      { label: 'Incasso > ' + $filter('currency')(1000), value: '1000', type: 'Incasso' }
    ];

    $scope.limitOptions = [
      {label: 'All', value: '-1'},
      {label: '20', value: '20'},
      {label: '50', value: '50'},
      {label: '100', value: '100'}
    ];

    $scope.countPaid = function (invoiceGroup) {
      var total = 0;
      if (!$scope.invoiceGroups[invoiceGroup].payments || $scope.invoiceGroups[invoiceGroup].payments.length === 0) {
        return $scope.invoiceGroups[invoiceGroup].paid;
      }
      for (var i = $scope.invoiceGroups[invoiceGroup].payments.length - 1; i >= 0; i--) {
        total = total + parseFloat($scope.invoiceGroups[invoiceGroup].payments[i].total);
      }
      return total;
    };

    $scope.setPage = function (page) {
      $state.go('root.invoice.group.list', {
        page: page
      });
    };

    $scope.refresh = function () {
      $state.go($state.current.name, {
        date: $scope.params.date,
        ltdate: $scope.params.ltdate,
        concept: $scope.params.concept,
        ltamount: $scope.params.ltamount,
        gtamount: $scope.params.gtamount,
        unpaid: $scope.params.unpaid,
        overpaid: $scope.params.overpaid,
        owner: $scope.params.owner,
        renter: $scope.params.renter,
        limit: $scope.params.limit,
        neq_saldo: $scope.params.neq_saldo,
        has_mandate: $scope.params.has_mandate,
        no_mandate: $scope.params.no_mandate
      });
    };

    $scope.splitPayment = function (paymentId, amount, iGIndex, pIndex) {
      var iG = $scope.invoiceGroups[0].id;
      return accountService.splitMutation({
        id: paymentId,
        total: amount,
        group: iG
      }).then(function (newPayment) {
        $scope.invoiceGroups[0].payments.push(newPayment);
        $scope.invoiceGroups[iGIndex].payments[pIndex].total -= amount;
        $scope.invoiceGroups[iGIndex].payments[pIndex].description += ' *gesplitst*';
      });
    };

    $scope.transferMutation = function (accountId, iGId, iGIndex, amount) {

      //create empty mutation
      accountService.createMutation({
        sink: 1, //atijd 1 = mywheels
        source: accountId,
        passed: moment().format($scope.invoiceDateConfig.modelFormat),
        description: 'overgeheveld',
        groupedInvoice: iGId,
        total: 0
      })
        .then(function (newPayment) {
          $scope.invoiceGroups[iGIndex].payments.push(newPayment);
          //split mutation
          var pIndex = $scope.invoiceGroups[iGIndex].payments.length - 1;
          return $scope.splitPayment(newPayment.id, amount, iGIndex, pIndex);
        })
        .then(function () {
          return alertService.add('success', 'Payment split', 2000);
        }, function (error) {
          alertService.add('success', error.message, 5000);
        });
    };

    $scope.isNull = function (val) {
      return val === null;
    };

    var cachedDate;
    var cachedltDate;
    $scope.toggleConcept = function () {

      if ($scope.params.concept) {
        cachedDate = angular.copy($scope.params.date);
        cachedltDate = angular.copy($scope.params.ltdate);
        $scope.params.date = 'concept';
        $scope.params.ltdate = null;
      } else {
        $scope.params.date = cachedDate;
        $scope.params.ltdate = cachedltDate;
      }
    };
  })

;
