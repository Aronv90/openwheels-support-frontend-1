'use strict';

angular.module('alertService', [])

.factory('alertService', function($rootScope, $timeout) {
  var alertService = {};

  // create an array of alerts available globally
  $rootScope.alerts = [];
  $rootScope.loader = undefined;

  // loading route message
  $rootScope.$on('$stateChangeSuccess', function () {
    alertService.loaded();
  });

  alertService.load = function(type, msg) {
    $rootScope.loader = {'type': type, 'msg': msg};
  };

  alertService.loaded = function() {
    $rootScope.loader = undefined;
  };

  alertService.add = function(type, msg, timeout) {
    $rootScope.alerts.push({'type': type, 'msg': msg});
    if(timeout) {
      $timeout(function() {
        alertService.closeAlert( $rootScope.alerts.length-1 );
      }, timeout);
    }
  };

  alertService.addError = function (err) {
    var level   = err.level   || 'danger';
    var message = err.message || 'An error has occurred';
    alertService.add(level, message, 8000);
  };

  alertService.closeAlert = function(index) {
    $rootScope.alerts.splice(index, 1);
  };

  alertService.closeAll = function() {
    $rootScope.alerts = [];
  };

  return alertService;
})

;
