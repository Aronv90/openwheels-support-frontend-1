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
    role: 'ROLE_ADMIN',
    resolve: {
      queries: ['storedqueryService', function (storedqueryService) {
        return storedqueryService.all();
      }]
    }
  });
  $stateProvider.state('root.querytool.execute', {
    url: '/:query',
    templateUrl: 'querytool/execute.tpl.html',
    controller: 'QueryExecuteController'
  });
})
.controller('QueryListController', function($scope, storedqueryService, $log, queries) {
  $scope.queries = queries;
})
.controller('QueryExecuteController', function($scope, storedqueryService, $stateParams, $log, queries, alertService) {
  var current = queries.find(elem => elem.id === parseInt($stateParams.query));
  $scope.current = {};
  angular.extend($scope.current, current);
    
  storedqueryService.execute({storedquery: $stateParams.query}).then(function (data) {
    $scope.data = data;
  }, function (error) {
    $scope.error_message = error.message;
  });
  
  $scope.save = function(id, data) {
    $scope.data = {};
    delete $scope.error_message;
    storedqueryService.alter({
      storedquery: id,
      newProps: {
        query: data.query,
        name: data.name,
        type: data.type,
        renderas: data.renderas
      }
    }).then(function (query) {
      alertService.add('success', 'The query was saved successful', 2000);
      current.name = query.name;
      current.query = query.query;
      current.type = query.type;
      current.renderas = query.renderas;
      angular.extend($scope.current, current);
      
      return query;
    }, function (error) {
      alertService.add('danger', error.message, 5000);
      angular.extend($scope.current, current);
      return current;
    }).then(function (query) {
      return storedqueryService.execute({storedquery: query.id});
    }).then(function (data) {
      $scope.data = data;
    }, function (error) {
      $scope.error_message = error.message;
    });
  };
});
