'use strict';

angular.module('openwheels.phoneLogService', [])

.service('phoneLogService', function($rootScope, personService) {

  var MAX_EVENTS = 20;
  var TEST_NUMBER = 'TEST-CALL';
  var uid = 0;

  var service = {
    events: [],
    sliderOptions: {
      historyVisible: false
    }
  };

  var source = new EventSource('events');
  source.addEventListener('phone', handleEvent, false);
  source.addEventListener('phonehangup', handleEvent, false);

  function handleEvent (e) {
    var data = JSON.parse(e.data);
    var eventInfo;
    console.log(e, data);

    // deactivate current events
    service.events.forEach(function (e) {
      e.active = false;
    });

    if (e.event === 'phone') {
      // add to backlog
      eventInfo = {
        id: e.id,
        active: true,
        timestamp: new Date(),
        data: data,
        person: null,
        personPending: false
      };
      service.events.push(eventInfo);

      // rotate backlog
      while (service.events.length > MAX_EVENTS) {
        service.events.shift();
      }

      // lookup additional info
      if (data.tel && data.tel !== TEST_NUMBER) {
        lookupPhoneNumber(eventInfo, data.tel);
      }
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
    handleEvent({ id: ((uid++) + ''), event: 'phone', data: JSON.stringify({ event: 'phone', tel: phoneNumber || 'TEST-CALL' }) });
  };

  service.testHangup = function () {
    handleEvent({ id: ((uid++) + ''), event: 'phonehangup', data: JSON.stringify({ event: 'phonehangup' }) });
  };

  return service;
});
