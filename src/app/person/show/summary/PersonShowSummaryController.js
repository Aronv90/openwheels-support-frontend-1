'use strict';

angular.module('openwheels.person.show.summary', [])

.controller('PersonShowSummaryController', function ($scope, person, bookings) {
  $scope.person = person;
  $scope.bookings = bookings.result;

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
      message: 'user has no valid name'
    });
  }

  if( person.male === null ){
    warnings.personal.push({
      message: 'user has no gender'
    });
  }

  if( !person.dateOfBirth ){
    warnings.personal.push({
      message: 'user has no date of birth'
    });
  }

  /**
   * contact data warnings
   */

  if( !person.emailValid ){
    warnings.contact.push({
      message: 'email not validated'
    });
  }

  if( !person.streetName || !person.streetNumber || !person.zipcode || !person.city ){
    warnings.contact.push({
      message: 'invalid address'
    });
  }

  if( !person.latitude || !person.longitude ){
    warnings.contact.push({
      message: 'invalid latitude or longitude'
    });
  }

  /**
   * mywheels data warnings
   */

  if( person.status !== 'active' ){
    warnings.mywheels.push({
      message: 'user status not active'
    });
  }

  if( !person.preference ){
    warnings.mywheels.push({
      message: 'invalid user preference'
    });
  }

  if( person.driverLicenseStatus !== 'ok' ){
    warnings.mywheels.push({
      message: 'Driver license not ok'
    });
  }

  /**
   * phone data warnings
   */

  if( person.phoneNumbers && person.phoneNumbers.length === 0){
    warnings.phone.push({
      message: 'user has no phone number'
    });
  }

  $scope.warnings = warnings;
})
;
