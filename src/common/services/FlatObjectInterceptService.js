'use strict';

angular.module('flatObjectInterceptService', [])
.factory('flatObjectInterceptor', function () {
  return {
    request: function (config) {
      // first check if this request qualifies for intercepting
      if (
          'POST' === config.method &&
          config.hasOwnProperty('data') &&
          config.data.hasOwnProperty('method') &&
          /\w+\.alter$/.test(config.data.method) && // check if the method ends with alter
          config.data.hasOwnProperty('params') &&
          config.data.params.hasOwnProperty('newProps')
         )
      {
        // loop through the properties in newProps and check if they are objects with an id property
        angular.forEach(config.data.params.newProps, function(value, key){
          /**
           * Replace entities in newProps with their id
           */
          if(value && typeof(value) === 'object' && value.hasOwnProperty('id')) {
            config.data.params.newProps[key] = value.id;
          }
          /**
           * Replace empty strings with null
           */
          if(value === ''){
            config.data.params.newProps[key] = null;
          }
        });
      }

      return config;
    }
  };
});