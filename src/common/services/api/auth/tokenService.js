'use strict';

angular.module('tokenService', [])

.factory('tokenService', function ($window, $log, $q, $injector, $rootScope, settingsService, appConfig, OAUTH_PATH, REFRESH_TOKEN_PATH) {

  var KEY                = 'auth';
  var DEFAULT_EXPIRES_IN = 4 * 7 * 24 * 3600; // 4 weeks
  var storage            = $window.localStorage;
  var tokenService       = {};
  var pendingRefreshToken;

  var tokenPrototype = {
    isExpired: function () {
      return this.expiryDate ? moment().isAfter(moment(this.expiryDate)) : false;
    },
    expiresIn: function () {
      return this.expiryDate ? moment(this.expiryDate).diff(moment(), 'milliseconds') / 1000 : DEFAULT_EXPIRES_IN;
    },
    isFresh: function () {
      var minRemainingSec = 15 * 60; // 15 minutes
      return this.expiresIn() >= minRemainingSec;
    },
    save: function () {
      storage[KEY] = JSON.stringify({
        tokenType   : this.tokenType,
        accessToken : this.accessToken,
        refreshToken: this.refreshToken,
        expiryDate  : this.expiryDate
      });
      return this;
    },
    refresh: function () {
      return refreshToken(this);
    }
  };

  tokenService.createToken = function (data) {
    var token = Object.create(tokenPrototype);
    angular.extend(token, {
      tokenType   : data.tokenType,
      accessToken : data.accessToken,
      refreshToken: data.refreshToken,
      expiryDate  : moment().add(data.expiresIn || DEFAULT_EXPIRES_IN, 'seconds').toDate()
    });
    return token;
  };

  tokenService.getToken = function () {
    var data, token;
    try {
      data = JSON.parse(storage[KEY]);
      token = Object.create(tokenPrototype);
      angular.extend(token, {
        tokenType: data.tokenType,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiryDate: moment(data.expiryDate).toDate()
      });
      return token;
    } catch (e) {
      return null;
    }
  };

  tokenService.clearToken = function () {
    delete storage[KEY];
  };

  function refreshToken (token) {
    var err;
    if (!token || !token.refreshToken) {
      err = new Error('don\'t have a refresh token');
      return $q.reject(err);
    }
    if (pendingRefreshToken) {
      return pendingRefreshToken;
    }

    $log.debug('--> refresh token');
    pendingRefreshToken = $injector.get('$http')({
      method: 'POST',
      url: settingsService.settings.server + REFRESH_TOKEN_PATH,
      data: 'client_id='      + appConfig.appId +
            '&client_secret=' + appConfig.appSecret +
            '&grant_type='    + 'refresh_token' +
            '&refresh_token=' + token.refreshToken,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function (response) {
      $log.debug('<-- got fresh token');
      pendingRefreshToken = null;
      var freshToken = tokenService.createToken({
        tokenType   : response.data.token_type,
        accessToken : response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn   : response.data.expires_in
      });
      freshToken.save();
      $rootScope.$broadcast('openwheels:auth-tokenReceived', freshToken);
      return freshToken;
    });
    pendingRefreshToken.catch(function (err) {
      $log.debug('<!! error getting fresh token (remove refresh token)');
      pendingRefreshToken = null;
      token.refreshToken = null;
      token.save();
      $rootScope.$broadcast('openwheels:auth-tokenError', err);
    });
    return pendingRefreshToken;
  }

  return tokenService;
});
