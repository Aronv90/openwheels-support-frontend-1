'use strict';

angular.module('filters.fullname', [])

.filter('fullname', function () {
  return function(person) {
    var fullname = '',
      firstName = '',
      preposition = '',
      surname = '';
    if(person) {
      firstName = angular.isString(person.firstName) ? person.firstName : '';
      preposition = angular.isString(person.preposition) ? person.preposition : '';
      surname = angular.isString(person.surname) ? person.surname : '';

      fullname = firstName + ' ' + (preposition ? preposition + ' ' : '') + surname;
    }
    return fullname;
  };
})

;
