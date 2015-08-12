'use strict';

angular.module('openwheels.phoneLog', [
  'openwheels.phoneLog.slider',
  'openwheels.phoneLog.history'
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

  $stateProvider.state('phoneLog.history', {
    url: '/history',
    templateUrl: 'phoneLog/history/phoneHistory.tpl.html',
    controller: 'PhoneHistoryController'
  });
});
