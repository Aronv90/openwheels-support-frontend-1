'use strict';

function determineType(data) {
  if (angular.isArray(data)) {
    return 'array';
  } else if (data === null) {
    return 'null';
  } else {
    return typeof data;
  }
}

angular.module('openwheels.components')

.directive('jsonViewerNode', function() {
  return {
    restrict: 'E',
    scope: {
      data: '=',
      node: '=',
    },
    templateUrl: 'components/jsonViewer/jsonViewerNode.tpl.html',
    controller: function ($scope) {
      $scope.actualType = determineType($scope.data);
      if ($scope.node.type !== $scope.actualType) {
        $scope.typeError = true;
      }

      /*
      if ($scope.node.type === 'object') {
        $scope.properties = $scope.node.properties.concat(
          Object.entries($scope.data)
          .filter(function (entry) {
            return !_.find($scope.node.properties, function (prop) {
              return prop.key === entry[0];
            });
          })
          .map(function (entry) {
            return {
              type: determineType(entry[1]),
              key: entry[0],
              description: '[Unknown]',
              value: entry[1],
            };
          })
        );
      }
      */
    },
  };
})

.directive('jsonViewer', function() {
  return {
    restrict: 'E',
    scope: {
      schema: '=', // root node
      jsonText: '=',
    },
    templateUrl: 'components/jsonViewer/jsonViewer.tpl.html',
    controller: function ($scope) {

      $scope.$watch('jsonText', parse);

      parse();

      function parse () {
        try {
          $scope.data = JSON.parse($scope.jsonText);
          $scope.parseError = false;
        } catch (error) {
          $scope.data = null;
          $scope.parseError = error.message;
        }
      }
    },
  };
});
