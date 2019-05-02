'use strict';

angular.module('authService', [])

	.run(function ($log, $rootScope, tokenService) {

		// verify token on each state change
		$rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {

			$log.debug('$stateChangeStart', (fromState.name || 'NULL') + ' > ' + toState.name);

			if (toState.name !== 'oauth2callback') {
				var savedToken = tokenService.getToken();
				if (savedToken) {
					if (savedToken.isFresh()) {
						$log.debug('saved token still fresh');
						$rootScope.$broadcast('openwheels:auth-tokenReceived', savedToken);
					}
					else {
						$log.debug('saved token is NOT fresh, try refresh');
						savedToken.refresh().then(function (freshToken) {
							$log.debug('authenticate using refreshed token');
							$rootScope.$broadcast('openwheels:auth-tokenReceived', freshToken);
						})
							.catch(function (err) {
								$log.debug('error refreshing token, use current token');
								$rootScope.$broadcast('openwheels:auth-tokenReceived', savedToken);
							});
					}
				} else {
					$rootScope.$broadcast('openwheels:auth-anonymous');
				}
			}
		});
	})

	.service('authService', function ($log, $q, $interval, $window, $state, $location, $rootScope,
												 settingsService, api, tokenService, alertService,
												 OAUTH_PATH, REFRESH_TOKEN_PATH, appConfig) {

		var popupElm;
		var asyncToken;
		var asyncUser = $q.defer();
		var isFirstAuthenticate = true;

		var roleHierarchy = {
			'ROLE_USER': [],
			'ROLE_PROVIDER_ADMIN': ['ROLE_USER'],
			'ROLE_ADMIN': ['ROLE_USER', 'ROLE_PROVIDER_ADMIN']
		};

		var userHasRole = function (role) {
			var identity = this.user.identity;
			return identity && identity.role && ( identity.role === role || roleHierarchy[identity.role].indexOf(role) !== -1 );
		}.bind(this);

		var user = {
			isPending: true,
			isAuthenticated: false,
			identity: null
		};

		this.loginPopup = loginPopup;
		this.loginRedirect = loginRedirect;
		this.logout = logout;
		this.logoutRedirect = logoutRedirect;
		this.subscribe = subscribe;
		this.user = user;
		this.userHasRole = userHasRole;

		// return user, authenticated or not
		this.userPromise = function () {
			return asyncUser.promise;
		};

		// included for compatibility:
		this.me = authenticatedUser;

		// included for compatibility:
		this.isLoggedIn = function () {
			$log.debug('DEPRECATED: authService.isLoggedIn(), use authService.user.isAuthenticated');
			return user.isAuthenticated;
		};

		// included for compatibility:
		this.invalidateMe = function () {
			$log.debug('DEPRECATED: authService.invalidateMe(), use authService.authenticatedUser(true) to reload');
			this.me(!!'forceReload');
		};

		// EVENTS

		// close popup when window is closed
		$window.addEventListener('beforeunload', closePopup);

		$rootScope.$on('openwheels:fatal-401', function (e, err) {
			$log.debug('openwheels:fatal-401');
			alertService.loaded();
			alertService.closeAll();

			tokenService.clearToken();
			user.isAuthenticated = false;
			user.identity = null;
			loginRedirect();
		});

		$rootScope.$on('openwheels:auth-anonymous', function (e, freshToken) {
			user.isAuthenticated = false;
			user.identity = null;
			user.isPending = false;
			if (asyncToken) {
				asyncToken.reject('anonymous');
				asyncToken = null;
			}
			if (asyncUser) {
				asyncUser.resolve(user);
			}
			isFirstAuthenticate = false;
		});

		$rootScope.$on('openwheels:auth-tokenReceived', function (e, freshToken) {
			var remaining;
			user.isAuthenticated = true;
			if (asyncToken) {
				asyncToken.resolve(freshToken);
				asyncToken = null;
			}
			if (isFirstAuthenticate) {
				remaining = moment.duration({seconds: freshToken.expiresIn()});
				$log.debug('[*] AUTHENTICATED, token expires in ' + remaining.humanize() + ' (' + remaining.asSeconds() + ' sec)');
				loadIdentity();
				isFirstAuthenticate = false;
			}
		});

		$rootScope.$on('openwheels:auth-tokenError', function (e, error) {
			if (asyncToken) {
				asyncToken.reject('no token received');
				asyncToken = null;
			}
		});

		function authenticatedUser(forceReload) {
			if (forceReload) {
				// reject pending
				if (asyncUser) {
					asyncUser.reject('forced reload');
				}
				// create new
				asyncUser = $q.defer();
				loadIdentity();
			}
			if (!user.isAuthenticated && !user.isPending) {
				return loginPopup().catch(function (err) {
					return $q.reject(new Error('Je bent niet ingelogd'));
				});
			}
			return asyncUser.promise.then(function (user) {
				return user.isAuthenticated ? user.identity : $q.reject(new Error('Je bent niet ingelogd'));
			});
		}

		function loginPopup() {
			if (user.isAuthenticated) {
				throw new Error('already logged in');
			}
			if (asyncToken) {
				asyncToken.reject(new Error('token canceled by popup'));
				asyncToken = null;
			}
			asyncToken = $q.defer();
			var loginPromise = asyncToken.promise.then(function () {
				return authenticatedUser(!!'forceReload');
			});
			alertService.closeAll();
			alertService.loaded();
			openPopup(authUrl('postMessage', 'postMessage'));
			return loginPromise;
		}

		function loginRedirect(errorPath, successPath) {
			if (user.isAuthenticated) {
				throw new Error('already logged in');
			}
			var currentPath = $location.url();
			$window.location.href = authUrl(errorPath, successPath || currentPath);
		}

		function loadIdentity() {
			$log.debug('--> ' + (user.identity ? 're-' : '') + 'load identity');
			user.isPending = true;
			api.invokeRpcMethod('person.me', {'version': 2}).then(function (identity) {
				$log.debug('<-- got identity');
				user.identity = identity;
				user.isPending = false;
				if (asyncUser) {
					asyncUser.resolve(user);
				}

				//check if user is customer care 
			    $rootScope.isInterswitch = user.identity && user.identity.id === 583599 ? true : false;
			    console.log($rootScope.isInterswitch);
			})
				.catch(function (err) {
					$log.debug('<!! got identity error');
					user.isPending = false;
					if (asyncUser) {
						user.isAuthenticated = false;
						user.identity = null;
						asyncUser.reject(err);
					}
				});
		}


		function getCurrentUrl() {
			return window.location.protocol + '//' + window.location.host + window.location.pathname;
		}

// server side / platform logout
		function logoutRedirect() {
			$log.debug('redirect to logout');
			tokenService.clearToken();
			var logoutUrl = settingsService.settings.server + '/logout?redirect_to=' + encodeURIComponent(getCurrentUrl());
			$window.location.href = logoutUrl;
		}

		// revoke access token by calling auth.logout
		function logout() {
			var dfd = $q.defer();

			if (asyncToken) {
				asyncToken.reject(new Error('token canceled by logout'));
				asyncToken = null;
			}

			$log.debug('--> logout');
			user.isPending = true;
			api.invokeRpcMethod('auth.logout').then(function () {
				$log.debug('<-- logged out');
				user.isAuthenticated = false;
				user.identity = null;
				user.isPending = false;
				tokenService.clearToken();
				if (asyncUser) {
					asyncUser.resolve(user);
				}
				dfd.resolve();
			})
				.catch(function () {
					$log.debug('<!! error logging out, clear user anyway');
					user.isAuthenticated = false;
					user.identity = null;
					user.isPending = false;
					tokenService.clearToken();
					if (asyncUser) {
						asyncUser.resolve(user);
					}
				});
			return dfd.promise;
		}

		function subscribe(params) {
			return api.invokeRpcMethod('person.subscribe', params, null, true);
		}

		// HELPERS

		function authUrl(errorPath, successPath) {
			var oAuth2CallbackUrl =
				$window.location.protocol + '//' +
				$window.location.host +
				$window.location.pathname +
				$state.href('oauth2callback') +
				'?' +
				( !successPath ? '' : '&successPath=' + encodeURIComponent(successPath) ) +
				( !errorPath ? '' : '&errorPath=' + encodeURIComponent(errorPath) );

			return settingsService.settings.server + OAUTH_PATH +
			'?client_id=' + appConfig.appId +
			'&response_type=' + 'token' +
			'&redirect_uri=' + encodeURIComponent(oAuth2CallbackUrl);
		}

		var closeTimer;

		function openPopup(url) {
			closePopup();
			var w = 960;
			var h = 840;
			var left = (screen.width / 2) - (w / 2);
			var top = (screen.height / 2) - (h / 2);
			popupElm = $window.open(url, 'Login', '' +
			', width=' + w +
			', height=' + h +
			', top=' + top +
			', left=' + left);

			// watch popup close
			$interval.cancel(closeTimer);
			closeTimer = $interval(function () {
				if (popupElm && popupElm.closed) {
					$interval.cancel(closeTimer);
					if (asyncToken) {
						asyncToken.reject('popup closed');
						asyncToken = null;
					}
				}
			}, 250);
			return popupElm;
		}

		function closePopup() {
			if (popupElm) {
				popupElm.close();
				popupElm = null;
			}
		}

	});
