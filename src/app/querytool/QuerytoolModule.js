'use strict';

angular.module('openwheels.querytool', [])
.config(function ($stateProvider) {
  $stateProvider.state('root.querytool', {
    url: '/querytool',
    views: {
      'main@': {
        //template: '<div ui-view class="row"></div>'
        templateUrl: 'querytool/list.tpl.html',
        controller: 'QueryListController'
      }
    },
    role: 'ROLE_ADMIN'
  });
  $stateProvider.state('root.querytool.execute', {
    url: '/:query',
    templateUrl: 'querytool/execute.tpl.html',
    controller: 'QueryExecuteController'
  });
})
.controller('QueryListController', function($scope, storedqueryService, $log) {
  storedqueryService.all().then(function (res) {
    $scope.queries = res;
  });
})
.controller('QueryExecuteController', function($scope, storedqueryService, $stateParams, $log) {
  storedqueryService.execute({storedquery: $stateParams.query}).then(function (data) {
    $log.log('data gotten', data);
    $scope.data = data;
  });
});
