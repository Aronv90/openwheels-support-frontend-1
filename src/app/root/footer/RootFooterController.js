'use strict';

angular.module('openwheels.root.footer', [])

  .controller('RootFooterController', function ($scope, api) {
		$scope.$watch(api.getApiUrl, function(url){
			$scope.currentServer = url;
		});
  });
