'use strict';

angular.module('oAuth2MessageListener', [])

.service('oAuth2MessageListener', function ($log, $window, $rootScope, tokenService, authService) {

  $window.addEventListener('message', messageHandler);

  function messageHandler (e) {
    var myOrigin = $window.location.protocol + '//' + $window.location.host;
    var message, token;

    if (e.origin !== myOrigin) {
      $log.debug('not a message for me...');
      return;
    }

    try {
      message = JSON.parse(e.data);
    } catch (e) {
      message = {};
    }

    $log.debug('message received', message);

    if (message.name === 'oAuthToken' && message.data) {
      token = tokenService.createToken(message.data);
      token.save();
      $rootScope.$broadcast('openwheels:auth-tokenReceived', token);
    }
    if (message.name === 'oAuthError' && message.data) {
      $rootScope.$broadcast('openwheels:auth-tokenError');
    }
  }

});
