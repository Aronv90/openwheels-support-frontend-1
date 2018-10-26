'use strict';

angular.module('filters.maintenanceType', [])

.filter('maintenanceTypeFilter', function () {
  return function(type) {
    var typeTranslated;
    if(type === 'boardcomputer') {
      typeTranslated = 'Boordcomputer';
    } else if(type === 'guarantee') {
      typeTranslated = 'Garantie';
    } else if(type === 'regular') {
      typeTranslated = 'Onderhoudsbeurt';
    }
    return typeTranslated;
  };
});