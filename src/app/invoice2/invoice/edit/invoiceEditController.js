'use strict';

angular.module('openwheels.invoice2.invoice.edit', [])

.controller('InvoiceEditController', function ($scope, invoice, invoice2Service, alertService, $stateParams, personService, $state, bookingService, contractService) {

  $scope.finished = false; // prevent creating an invoice twice
  $scope.bookingError = false;
  $scope.loadBooking = false;

  $scope.taxRateOptions = [
    { label: '21%', value: 21 },
    { label:  '6%', value:  6 },
    { label:  '0%', value:  0 },
  ];

  $scope.typeOptions = [
    { label: 'Tankbon', value: 'receipt' },
    { label: 'Schade (eigen risico, reparatiekosten)', value: 'damage' },
    { label: 'Verkeersboete (parkeerboete, snelheidsovertreding)', value: 'traffic_ticket' },
    { label: 'Providerboete (roken, schooonmaken, te laat terugbrengen)', value: 'provider_penalty' },
    { label: 'Annuleringskosten', value: 'penalty' },
    { label: 'Administratiekosten (tankbon, verwerken boete, herinneringskosten)', value: 'administration_costs' },
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

  $scope.$watch('invoice.type', function (newValue) {
    if (['traffic_ticket', 'subscription_vga', 'verzekering_kosten'].indexOf(newValue) >= 0) {
      $scope.invoice.taxRate = 0;
    } else if (['reserveer_kosten', 'dag_owner_fee_kosten', 'verzekering_kosten'].indexOf(newValue) >= 0) {
      $scope.invoice.taxRate = 21;
    } else if ($scope.invoice.sender.isCompany && ['damage'].indexOf(newValue) < 0) {
      $scope.invoice.taxRate = 21;
    } else if (!$scope.invoice.sender.isCompany) {
      $scope.invoice.taxRate = 0;
    }


    if (newValue === 'damage' && $scope.invoice.price === 250) {
      $scope.invoice.taxRate = 0;
    }
  });

  $scope.$watch('invoice.price', function (newValue) {
    if (newValue === 250 && $scope.invoice.type === 'damage') {
      $scope.invoice.taxRate = 0;
    }
  });

  $scope.$watch('invoice.sender', function (newValue) {
    if (
      newValue.isCompany && 
      ['traffic_ticket', 'subscription_vga', 'verzekering_kosten'].indexOf($scope.invoice.type) < 0 && 
      ($scope.invoice.type !== 'damage' || $scope.invoice.price !== 250)
    ) {
      $scope.invoice.taxRate = 21;
    } else {
      $scope.invoice.taxRate = 0;      
    }
  });

  $scope.$watch('invoice.booking', function (newValue) {
    if (newValue.length === 6) {
      $scope.loadBooking = true;
      alertService.load();

      // get booking
      bookingService.get({
        id: newValue
      })
      .then(function(booking) {
        // get contractor
        contractService.get({
          id: booking.contract.id
        })
        .then(function(contract) {
          // set the sender and recipient
          $scope.invoice.sender = booking.resource.owner;
          $scope.invoice.recipient = contract.contractor;
        })
        .catch(function(err){
          $scope.bookingError = true;
        })
        .finally(function(){
          alertService.loaded();
          $scope.loadBooking = false;
        });

      })
      .catch(function(err){
        $scope.bookingError = true;
      })
      .finally(function(){
        alertService.loaded();
        $scope.loadBooking = false;
      });
    }
  });

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
