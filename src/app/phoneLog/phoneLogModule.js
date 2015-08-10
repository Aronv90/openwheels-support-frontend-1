'use strict';

angular.module('openwheels.phoneLog', [
  'openwheels.phoneLog.slider'
])

.config(function ($stateProvider) {

  $stateProvider.state('phoneLog', {
    parent: 'root',
    url: '/phone-log',
    abstract: true,
    views: {
      'main@': {
        template: '<div ui-view></div>'
      }
    }
  });

  // $stateProvider.state('phoneLog.event', {
  //   url: '/example',
  //   templateUrl: '',
  //   controller: ''
  // });
});
