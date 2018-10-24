'use strict';

angular.module('filters.damageType', [])

.filter('damageTypeFilter', function () {
  return function(type) {
    var typeTranslated;
    if(type === 'coating') {
      typeTranslated = 'Bekleding';
    } else if(type === 'theft') {
      typeTranslated = 'Diefstal';
    } else if(type === 'paint') {
      typeTranslated = 'Lakschade';
    } else if(type === 'motor') {
      typeTranslated = 'Motorisch';
    } else if(type === 'smoking') {
      typeTranslated = 'Roken';
    } else if(type === 'window') {
      typeTranslated = 'Ruitschade';
    }
    return typeTranslated;
  };
});