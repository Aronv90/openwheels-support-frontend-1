'use strict';

angular.module('openwheels.querytool', ['ui.bootstrap'])
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
  $stateProvider.state('root.querytool.create', {
    url: '/create',
    templateUrl: 'querytool/create.tpl.html',
    controller: 'QueryCreateController'
  });
  $stateProvider.state('root.querytool.execute', {
    url: '/:query?page',
    templateUrl: 'querytool/execute.tpl.html',
    controller: 'QueryExecuteController'
  });
})
.controller('QueryListController', function($scope, storedqueryService, $log, queries) {
  $scope.queries = queries;
})
.controller('QueryCreateController', function($scope, storedqueryService, $log, queries, alertService, $state) {
  $scope.current = {
    type: 'dql',
    renderas: 'default'
  };
  $scope.save = function(data) {
    storedqueryService.create({
      name: data.name,
      query: data.query,
      otherProps: {
        type: data.type,
        renderas: data.renderas
      }
    }).then(function(query) {
      queries.push(query);
      $state.go('root.querytool.execute', {query: query.id});
    },function (error) {
      alertService.add('danger', error.message, 5000);
    });
  };
})
.controller('QueryExecuteController', function($scope, storedqueryService, $stateParams, $log, queries, alertService) {
  var current = queries.find(function (elem) {return elem.id === parseInt($stateParams.query); }),
    limit = 20,
    templateResolver = {
      default: 'querytool/renderas/table.tpl.html',
      resource: 'querytool/renderas/resource.tpl.html',
      person: 'querytool/renderas/person.tpl.html',
      boeking: 'querytool/renderas/booking.tpl.html'
    },
    displayRows = function (data) {
      $scope.data = data.result;
      $scope.pages = [];
      for(var i = 0; i < data.total / limit; i++) {
        $scope.pages.push({query: current.id, page: i });
      }
    },
    displayError = function (error) {
      $scope.error_message = error.message;
    },
    updateCurrent = function(query) {
      current.name = query.name;
      current.query = query.query;
      current.type = query.type;
      current.hide = query.hide;
      current.renderas = query.renderas;
      
      return query;
    },
    executeQuery = function(query) {
      $scope.data = {};
      delete $scope.error_message;
      
      $scope.current = {};
      angular.extend($scope.current, query);
      
      return storedqueryService.execute({
        storedquery: $stateParams.query,
        offset: $stateParams.page * limit,
        limit: limit
      });
    },
    alterQuery = function(id, data) {
      $scope.data = {};
      delete $scope.error_message;
      return storedqueryService.alter({
        storedquery: id,
        newProps: {
          query: data.query,
          name: data.name,
          type: data.type,
          hide: data.hide,
          renderas: data.renderas
        }
      });
    };
    
  executeQuery(current)
  .then(displayRows, displayError);
  
  $scope.template = templateResolver;
  $scope.template_name = [];
  for(var key in templateResolver) {
    if(templateResolver.hasOwnProperty(key)) {
      $scope.template_name.push(key);
    }
  }
  $scope.save = function(id, data) {
    alterQuery(id, data)
    .then(function (query) {
      updateCurrent(query);
      alertService.add('success', 'The query was saved successful', 2000);
      return query;
    }, function (error) {
      alertService.add('danger', error.message, 5000);
      return current;
    })
    .then(executeQuery)
    .then(displayRows, displayError);
  };
});
