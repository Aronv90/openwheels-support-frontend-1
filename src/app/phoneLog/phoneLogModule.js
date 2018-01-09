'use strict';

angular.module('openwheels.phoneLog', [
  'openwheels.phoneLog.slider',
  'openwheels.phoneLog.history',
  'openwheels.phoneLog.current'
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
    url: '/history/:sDate',
    templateUrl: 'phoneLog/history/phoneHistory.tpl.html',
    controller: 'PhoneHistoryController'
  });

  $stateProvider.state('phoneLog.current', {
    url: '/current',
    templateUrl: 'phoneLog/current/phoneCurrent.tpl.html',
    controller: 'PhoneCurrentController'
  });
});
