'use strict';

angular.module('openwheels.person.show.summary', [])

.controller('PersonShowSummaryController', function ($scope, person, bookings) {
  $scope.person = person;
  $scope.bookings = bookings;

  var warnings = {
    total: function(){
      return this.personal.length;
    },
    personal: [],
    contact: [],
    mywheels: [],
    phone: []
  };

  /**
   * personal data warnings
   */

  if( !person.firstName || !person.surname ){
    warnings.personal.push({
      message: 'Geen voor- of achternaam.'
    });
  }

  if( person.male === null ){
    warnings.personal.push({
      message: 'Geen geslacht.'
    });
  }

  if( !person.dateOfBirth ){
    warnings.personal.push({
      message: 'Geen geboortedatum.'
    });
  }

  /**
   * contact data warnings
   */

  if( !person.emailValid ){
    warnings.contact.push({
      message: 'Het e-mailadres is nog niet geverifieerd.'
    });
  }

  if( !person.streetName || !person.streetNumber || !person.zipcode || !person.city ){
    warnings.contact.push({
      message: 'Geen adresgegevens.'
    });
  }

  if( !person.latitude || !person.longitude ){
    warnings.contact.push({
      message: 'Geen long- en latitude.'
    });
  }

  /**
   * mywheels data warnings
   */

  if( person.status !== 'active' ){
    warnings.mywheels.push({
      message: 'Account is nog niet geactiveerd.'
    });
  }

  if( !person.preference ){
    warnings.mywheels.push({
      message: 'Geen voorkeur voor huren of verhuren.'
    });
  }

  if( person.driverLicenseStatus !== 'ok' ){
    warnings.mywheels.push({
      message: 'Rijbewijs is nog niet goedgekeurd.'
    });
  }

  /**
   * phone data warnings
   */

  if( person.phoneNumbers && person.phoneNumbers.length === 0){
    warnings.phone.push({
      message: 'Nog geen telefoonnummer.'
    });
  }

  $scope.warnings = warnings;
})
;
