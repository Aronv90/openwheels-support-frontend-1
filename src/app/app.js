'use strict';

angular.module('openwheels', [

	'ui.router',
	'ui.unique',
	'ui.bootstrap',
	'angularMoment',
	'ngDragDrop',
	'ngProgress',
	'ngSanitize',
	'percentage',
	'google-maps',
	'LocalStorageModule',
	'pascalprecht.translate',
	'ngAutocomplete',
	'angularFileUpload',
	'jsonrpc',
	'ngTable',

	'templates-app',
	'templates-common',

	//services
	'api',
	'rpcServices',
	'authService',
	'tokenService',
	'oAuth2Callback',
	'oAuth2MessageListener',
	'stateAuthorizer',
	'openwheels.phoneLogService',
	'openwheels.environment',
  'openwheels.config',
	'front.paths',
	'alertService',
	'dialogService',

	// custom directives
	'form.validation',
	'pickadate',
	'hexinput',
	'nullIfEmpty',
	'findperson',
	'sortableColumn',
	'driverLicense',
	'showIfUserHasRole',
	'fileInputDirective',

	// custom filters
	'filters.getByPropertyFilter',
	'filters.fullname',
	'filters.avatar',
	'filters.satisfactionThumb',
	'filters.ratingStars',
	'filters.dirty',
	'filters.conversion',

	'openwheels.root',
	'openwheels.trip',
	'openwheels.provider',
	'openwheels.fleet',
	'openwheels.person',
	'openwheels.contract',
	'openwheels.resource',
	'openwheels.invoice',
  'openwheels.invoice2',
	'openwheels.mailer',
	'openwheels.bank',
	'openwheels.checklist',
	'openwheels.report',
	'openwheels.phoneLog',
	'flatObjectInterceptService',
	'settingsService',
	'transactionService',
	'DutchZipcodeService',
  'openwheels.querytool'
])

	.config(function myAppConfig($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');
	})

	.config(function setFlatObjectInterceptor($httpProvider) {
		$httpProvider.interceptors.push('flatObjectInterceptor');
	})

	.config(function ($translateProvider) {
		$translateProvider.translations('en', {
			'MyWheels': 'MyWheels',
			'SIGNUP': 'Signup',
			'LOGIN': 'Login',
			'LOGOUT': 'Logout',
			'RENT_CAR': 'Find a car',
			'SUBMIT_CAR': 'Submit your car',
			'HOW_IT_WORKS': 'How it works',
			'DASHBOARD': 'Dashboard',

			'SIGNUP_HEADING': 'Get started with a free account',
			'SIGNUP_DESCRIPTION': 'Sign up in 30 seconds. No credit card required.',
			'SIGNUP_TROUBLE': 'Trouble signing up?',
			'EMAIL': 'Email',
			'PASSWORD': 'Password',
			'PER_DAY': 'per day',
			'PER_HOUR': 'per hour',
			'PER_KM': 'per km',
			'PER_FUEL': 'fuel per km',
			'DATE_START': 'Start date',
			'DATE_END': 'End date',
			'BOOK_NOW': 'Book now',
			'FREE_KM': 'Includes 100 free kilometres each day',
			'ABOUT_CAR': 'About my car',
			'ABOUT_ME': 'About me',
			'MEMBER_SINCE': 'Member since:',
			'SHOW_PRICE': 'Show price',

			'BOOKING_REQUESTED': 'The car has been booked and the owner has received your request',
			'BOOKING_ACCEPTED': 'The booking has been accepted',
			'DATETIME_REQUIRED': 'Enter both a begin date and an end date'
		});

		$translateProvider.translations('nl', {
			'MyWheels': 'MyWheels',
			'SIGNUP': 'Word lid',
			'LOGIN': 'Login',
			'LOGOUT': 'Logout',
			'RENT_CAR': 'Auto huren',
			'SUBMIT_CAR': 'Auto verhuren',
			'HOW_IT_WORKS': 'Hoe het werkt',
			'DASHBOARD': 'Dashboard',

			'SIGNUP_HEADING': 'Het lidmaatschap MyWheels is helemaal gratis',
			'SIGNUP_DESCRIPTION': 'Aanmelden is binnen 10 seconden gepiept en je hoeft nog niks te betalen! Je kunt gelijk beginnen met het huren of verhuren van een auto',
			'SIGNUP_TROUBLE': 'Problemen met aanmelden?',
			'EMAIL': 'Email',
			'PASSWORD': 'Wachtwoord',
			'PER_DAY': 'per dag',
			'PER_HOUR': 'per uur',
			'PER_KM': 'per km',
			'PER_FUEL': 'brandstof per km',
			'DATE_START': 'Begintijd',
			'DATE_END': 'Eindtijd',
			'BOOK_NOW': 'Reserveer nu',
			'FREE_KM': 'Inclusief 100 km gratis per dag',
			'ABOUT_CAR': 'Over mijn auto',
			'ABOUT_ME': 'Over mij',
			'MEMBER_SINCE': 'Lid sinds:',
			'SHOW_PRICE': 'Toon prijs',

			'BOOKING_REQUESTED': 'De auto is gereserveerd en de verhuurder heeft een bericht ontvangen van je huurverzoek',
			'BOOKING_ACCEPTED': 'Het verzoek om de auto te reserveren is geaccepteerd',
			'DATETIME_REQUIRED': 'Vul zowel een begintijd als een eindtijd in'
		});

		$translateProvider.preferredLanguage('en');
	})

	.constant('API_DATE_FORMAT', 'YYYY-MM-DD HH:mm')
	.run(function(oAuth2MessageListener, stateAuthorizer){})
	.run(function ($window, $state, $stateParams, $rootScope, alertService) {

		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;

		//set moment lang
		$window.moment.lang('nl');

		// loading route message
		$rootScope.$on('$stateChangeStart', function () {
			alertService.load('info', 'loading...');
		});

		// loading route message
		$rootScope.$on('$stateChangeSuccess', function () {
			alertService.loaded();
		});

		// alert api errors on state change error
		$rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
			alertService.loaded();
			var msg = error ? error.message : '';
			alert('Api error! ' + msg);
		});
	})

	.controller('AppCtrl', function AppCtrl($scope) {


		//set page title on state change
		$scope.$on('$stateChangeSuccess', function (event, toState) {
			if ( angular.isDefined(toState.data) &&  angular.isDefined(toState.data.pageTitle)) {
				$scope.pageTitle = toState.data.pageTitle + ' | openwheels';
			}
		});

		$scope.safeApply = function (fn) {
			var phase = this.$root.$$phase;
			if (phase === '$apply' || phase === '$digest') {
				if (fn && (typeof(fn) === 'function')) {
					fn();
				}
			} else {
				this.$apply(fn);
			}
		};
	})

;

/**
 * Manual bootstrap
 */
(function() {
  var injector = angular.injector(['ng']);
  var $http    = injector.get('$http');
  var $window  = injector.get('$window');

  if (!window.jasmine) {

    if ($window.location.host.indexOf('127.0.0.1') >= 0) {
      $window.location.replace($window.location.href.replace('127.0.0.1', 'localhost'));
    } else {

      angular.element($window.document).ready(function () {
        $http.get('config.json').then(function (response) {
          var config = response.data;
          validateConfig(config);
          bootstrap(config);
        });
      });
    }
  }

  function bootstrap (config) {
    angular.module('openwheels.config', []).constant('appConfig', {
      appId    : config.app_id,
      appSecret: config.app_secret,
      backends : config.backends
    });
    angular.bootstrap(angular.element('html'), ['openwheels']);
  }

  function validateConfig (config) {
    if (!config.app_id) { throw new Error('app_id not configured'); }
    if (!config.app_secret) { throw new Error('app_secret not configured'); }
    if (!config.backends || !config.backends || !config.backends.length) {
      throw new Error('No backends configured');
    }
  }

}());
