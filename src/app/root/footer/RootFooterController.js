'use strict';

angular.module('openwheels.root.footer', [])

  .controller('RootFooterController', function ($scope, api, authService) {
		$scope.$watch(api.getApiUrl, function(url){
			$scope.currentServer = url;
		});

		$scope.user = authService.user;
  });
