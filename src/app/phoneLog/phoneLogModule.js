'use strict';

angular.module('openwheels.phoneLog', [
  'openwheels.phoneLog.slider',
  'openwheels.phoneLog.history',
  'openwheels.phoneLog.current',
  'openwheels.phoneLog.edit',
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

  $stateProvider.state('phoneLog.edit', {
    url: '/edit/:iCall',
    templateUrl: 'phoneLog/edit/phoneEdit.tpl.html',
    controller: 'PhoneEditController'
  });

})

.directive('phoneCallTable', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'phoneLog/phoneCallTable.tpl.html',
        controller: function($scope, $state, telecomService) {

            $scope.checkOutPerson = function (call, oPerson)
            {
                // Assign this call to the admin taking the call
                telecomService.assignAdmin({ sExtId: call.sExtId });

                // Assign the selected person to the call
                telecomService.assignPerson({ sExtId: call.sExtId, iPerson: oPerson.id });

                // Go to check out the person
                $state.go('root.person.show.summary', { personId: oPerson.id });
            };

            $scope.editCall = function (call)
            {
                // Assign this call to the admin taking the call
                telecomService.assignAdmin({ sExtId: call.sExtId }).then(function(oCall) {
                    $state.go('phoneLog.edit', { iCall: oCall.id });
                });
            };

        }
    };
});