'use strict';

angular.module('filters.maintenanceType', [])

.filter('maintenanceTypeFilter', function () {
  return function(type) {
    var typeTranslated;
    if(type === 'coating') {
      typeTranslated = 'APK';
    } else if(type === 'apk') {
      typeTranslated = 'Garantie';
    } else if(type === 'guarantee') {
      typeTranslated = 'Onderhoudsbeurt';
    } else if(type === 'regular') {
      typeTranslated = 'Onderhoudsbeurt + APK';
    }
    return typeTranslated;
  };
});