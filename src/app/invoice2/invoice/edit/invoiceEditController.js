'use strict';

angular.module('openwheels.invoice2.invoice.edit', [])

.controller('InvoiceEditController', function ($scope, invoice, invoice2Service, alertService, $stateParams, personService, $state) {

  $scope.finished = false; // prevent creating an invoice twice

  $scope.taxRateOptions = [
    { label: '21%', value: 21 },
    { label:  '6%', value:  6 },
    { label:  '0%', value:  0 },
  ];

  $scope.typeOptions = [
    { label: 'Tankbon', value: 'receipt' },
    { label: 'Schade', value: 'damage' },
    { label: 'Verkeersboete', value: 'traffic_ticket' },
    { label: 'Providerboete', value: 'provider_penalty' },
    { label: 'Administratiekosten', value: 'administration_costs' },
    { label: 'Abonnement VGA', value: 'subscription_vga' },
    { label: 'Boekingskosten huurder', value: 'reserveer_kosten' },
    { label: 'Boekingskosten verhuurder', value: 'dag_owner_fee_kosten' },
    { label: 'Afkoop eigen risico', value: 'afkoop' },
    { label: 'Huur (alleen credit)', value: 'huur_kosten' },
    { label: 'Brandstof (geen tankbon)', value: 'brandstof_kosten' },
    { label: 'Kilometer (alleen credit)', value: 'kilometer_kosten' },
    { label: 'Ritverzekering', value: 'verzekering_kosten' },
    { label: 'Beheerdersvergoeding', value: 'beheerdersvergoeding' },
    { label: 'Inleg', value: 'inleg_rente' },
    { label: 'Other', value: 'custom' }
  ];

  $scope.save = function (invoice) {
    return invoice.id ? alterInvoice(invoice) : createInvoice(invoice);
  };

  if (invoice) {
    initExistingInvoice(invoice);
  } else {
    initNewInvoice();
  }

  $scope.swapSenderRecipient = function() {
    var oldRecipient = $scope.invoice.recipient;
    $scope.invoice.recipient = $scope.invoice.sender;
    $scope.invoice.sender = oldRecipient;
  };

  function initNewInvoice () {
    var recipient;
    var invoice = {
      quantity: 1,
      taxRate: $scope.taxRateOptions[0].value
    };

    if($stateParams.person) {
      personService.get({person: $stateParams.person})
      .then(function(person) {
        recipient = person;
        $scope.invoice = invoice;
        $scope.invoice.recipient = recipient;
      });
    } else {
        $scope.invoice = invoice;
    }
  }

  function initExistingInvoice (invoice) {
    $scope.invoice = invoice;
    if(invoice.booking) {
      $scope.invoice.booking = invoice.booking.id;
    }
  }

  function alterInvoice (invoice) {
    alertService.load();

    invoice2Service.alter({
      invoice: invoice.id,
      newProps: {
        description: invoice.description,
        price: invoice.price,
        quantity: invoice.quantity,
        recipient: invoice.recipient.id,
        sender: invoice.sender.id,
        taxRate: invoice.taxRate,
        type: invoice.type
      }
    })
    .then(function () {
      alertService.add('success', 'Saved', 5000);
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  }

  function redirect() {
    if($stateParams.person) {
      $state.go('root.person.show.invoiceGroupV2.list', {personId: $stateParams.person});
    }
  }

  function createInvoice (invoice) {
    var params = angular.copy(invoice);

    if (params.sender) { params.sender = params.sender.id; }
    if (params.recipient) { params.recipient = params.recipient.id; }
    if (params.booking) { params.booking = params.booking; }

    alertService.load();

    invoice2Service.create(params).then(function () {
      $scope.finished = true;
      alertService.add('success', 'Saved', 5000);
      redirect(invoice);
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      alertService.loaded();
    });
  }
})
;
