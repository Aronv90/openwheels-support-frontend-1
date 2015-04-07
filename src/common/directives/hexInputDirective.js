'use strict';

angular.module('hexinput', [])

.directive('hexInput', function($filter) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elm, attrs, ngModelCtrl) {
      function fromUser(input) {
        return $filter('hex2dec')(input || '');
      }

      function toUser(input) {
        return $filter('dec2hex')(input || '');
      }
      ngModelCtrl.$parsers.push(fromUser);
      ngModelCtrl.$formatters.push(toUser);
    }
  };
});