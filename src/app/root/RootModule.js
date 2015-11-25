'use strict';

angular.module('openwheels.root', [
	'openwheels.root.navigation',
	'openwheels.root.alert',
	'openwheels.root.settings',
	'openwheels.root.footer',
	'openwheels.phoneLog',
  'googlechart'
])

	.config(function config($stateProvider) {

		/**
		 * basepath: ''
		 */
		$stateProvider.state('root', {
			url: '',
			views: {
				'navigation': {
					templateUrl: 'root/navigation/root-navigation.tpl.html',
					controller: 'RootNavigationController'
				},
				'alerts': {
					templateUrl: 'root/alert/root-alert.tpl.html',
					controller: 'RootAlertController'
				},
				'footer': {
					templateUrl: 'root/footer/root-footer.tpl.html',
					controller: 'RootFooterController'
				},
				'bottom-right': {
					templateUrl: 'phoneLog/phoneSlider.tpl.html',
					controller: 'PhoneSliderController'
				},
        'main@': {
          template: '<div google-chart style="height:600px; width:100%;"></div>',
          controller: ['$scope', function ($scope, bookingStats) {
            $scope.bookingStats = [['weekNr', 'rittenEigenAutos', 'rittenP2pAutos']];
            for(var idx in bookingStats) {
              $scope.bookingStats.push([bookingStats[idx].weekNr,
                bookingStats[idx].rittenEigenAutos, bookingStats[idx].rittenP2pAutos]);
            }
          }],
          resolve: {
            bookingStats: ['authService', 'bookingService', function (authService, bookingService) {
              return [{
                weekNr: 33,
                rittenEigenAutos: 2089,
                rittenP2pAutos: 236
              },
              {
                weekNr: 34,
                rittenEigenAutos: 2340,
                rittenP2pAutos: 258
              },
              {
                weekNr: 35,
                rittenEigenAutos: 2530,
                rittenP2pAutos: 345
              },
              {
                weekNr: 36,
                rittenEigenAutos: 2492,
                rittenP2pAutos: 306
              },
              {
                weekNr: 37,
                rittenEigenAutos: 2476,
                rittenP2pAutos: 331
              }];
            }]
          }
        }
			},
			data: {pageTitle: 'Home'}
		});

		$stateProvider.state('root.home', {
			url: '/',
		});

		/**
		 * basepath: /settings
		 */
		$stateProvider.state('root.settings', {
			url: '/settings',
			views: {
				'main@': {
					templateUrl: 'root/settings/root-settings.tpl.html',
					controller: 'RootSettingsController'
				}
			},
			resolve: {
				user: ['authService', function (authService) {
					return authService.userPromise();
				}]
			},
			data: {pageTitle: 'Home'}
		});

	})

;
