'use strict';

angular.module('openwheels.phoneLogService', [])

.service('phoneLogService', function($rootScope, personService) {

  var MAX_EVENTS = 20;
  var uid = 0;

  var service = {
    events: [],
    sliderOptions: {
      historyVisible: false
    }
  };

  var source = new EventSource('events');
  source.addEventListener('phone', handlePhoneEvent, false);

  function handlePhoneEvent (e) {
    var data = JSON.parse(e.data);

    var eventInfo = {
      id: (uid++) + '',
      active: true,
      timestamp: new Date(),
      data: data,
      person: null,
      personPending: false
    };

    // deactivate other events
    service.events.forEach(function (e) {
      e.active = false;
    });
    service.events.push(eventInfo);
    console.log(data);

    // rotate events
    while (service.events.length > MAX_EVENTS) {
      service.events.shift();
    }

    // lookup additional info
    if (data.tel) {
      lookupPhoneNumber(eventInfo, data.tel);
    }
  }

  function lookupPhoneNumber (eventInfo, phoneNumber) {
    eventInfo.person = null;
    eventInfo.personPending = true;
    personService.getByPhone({ id: phoneNumber }).then(function (person) {
      eventInfo.person = person;
    })
    .finally(function () {
      eventInfo.personPending = false;
    });
  }

  service.testCall = function (phoneNumber) {
    handlePhoneEvent({ data: JSON.stringify({ tel: phoneNumber || 'TEST-CALL' }) });
  };

  return service;
});
