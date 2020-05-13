'use strict';

angular.module('openwheels.root', [
	'openwheels.root.help',
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
				'help': {
					templateUrl: 'root/help/root-help.tpl.html',
					controller: 'RootHelpController'
				},
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
				}
			},
			data: {pageTitle: 'Home'}
		});

		$stateProvider.state('root.home', {
			url: '/'
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
