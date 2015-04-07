'use strict';

angular.module('openwheels.serverSentEventService', [])

.service('serverSentEventService', function($rootScope) {

  var service = {
    handleEvent: function (msg) {
      var msgObj = JSON.parse(msg.data);
      console.log( msg, msgObj);

      $rootScope.$apply(function () {
        $rootScope.$broadcast('serverPhoneEvent', msgObj );
      });
    }
  };

  var source = new EventSource('events');
  source.addEventListener('phone', service.handleEvent, false);

  return service;

})

;
