'use strict';

angular.module('openwheels.trip.dashboard', [])

.controller('TripDashboardController', function ($scope, booking, contract, invoice2Service, $q) {
  $scope.booking = booking;
  $scope.contract = contract;

  var invoicesRenterReceived = invoice2Service.getReceived({person: booking.person.id, booking: booking.id});
  var invoicesRenterSent = invoice2Service.getSent({person: booking.person.id, booking: booking.id});

  var invoicesOwnerReceived = invoice2Service.getReceived({person: booking.resource.owner.id, booking: booking.id});
  var invoicesOwnerSent = invoice2Service.getSent({person: booking.resource.owner.id, booking: booking.id});

  $q.all({renterReceived: invoicesRenterReceived, renterSent: invoicesRenterSent, ownerReceived: invoicesOwnerReceived, ownerSent: invoicesOwnerSent})
  .then(function(res) {

    var markSent = function(invoice) {
      invoice.invoiceLines = _.map(invoice.invoiceLines, function(invoiceLine) {
        invoiceLine.relationType = 'sent';
        invoiceLine.invoice = invoice;
        invoiceLine.invoice.groupId = invoiceLine.invoice.senderInvoiceGroup.id;
        return invoiceLine;
      });
      return invoice;
    };
    var markReceived = function(invoice) {
      invoice.invoiceLines = _.map(invoice.invoiceLines, function(invoiceLine) {
        invoiceLine.relationType = 'received';
        invoiceLine.invoice = invoice;
        invoiceLine.invoice.groupId = invoiceLine.invoice.recipientInvoiceGroup.id;
        return invoiceLine;
      });
      return invoice;
    };


    res.ownerSent = _.map(res.ownerSent, markSent);
    res.ownerReceived = _.map(res.ownerReceived, markReceived);
    res.renterSent = _.map(res.renterSent, markSent);
    res.renterReceived = _.map(res.renterReceived, markReceived);

    var merged = {owner: [], renter: []};
    merged.owner = merged.owner.concat(res.ownerSent, res.ownerReceived);
    merged.renter = merged.renter.concat(res.renterSent, res.renterReceived);
    
    merged.owner = _.sortBy(_.flatten(_.pluck(merged.owner, 'invoiceLines')), 'position');
    merged.renter = _.sortBy(_.flatten(_.pluck(merged.renter, 'invoiceLines')), 'position');

    return merged;
  })
  .then(log)
  .then(function(res) { $scope.invoicesOwner = res.owner; $scope.invoicesRenter = res.renter; return res; })
  ;

  function log(x) {
    console.log(x); return x;
  }
})

;
