'use strict';

describe('Controller: TripShowTimeframeController', function () {

  var ctrl, $scope, bookingMock, contractsMock, BookingServiceMock, AlertServiceMock;

  beforeEach(angular.mock.module('openwheels.trip.show.timeframe'));

  beforeEach(function () {

    BookingServiceMock = {
      alterRequest: function(obj) {
        expect(obj.id).toEqual(8000244);
        expect(obj.timeFrame).toEqual({
          startDate: '2013-01-18 14:00',
          endDate: '2013-01-19 14:00'
        });
        expect(obj.remark).toEqual('Test remark requester');
        return;
      },
      alter: function(obj) {
        expect(obj.id).toBe(8000244);
        expect(obj.timeFrame).toEqual({
          startDate: '2013-01-18 14:00',
          endDate: '2013-01-19 14:00'
        });
        expect(obj.remark).toEqual('Test remark requester');
      },
      setTrip: function(obj) {
        expect(obj.id).toBe(8000244);
        expect(obj.begin).toEqual('2013-01-18 14:00');
        expect(obj.end).toEqual('2013-01-19 14:00');
        expect(obj.odoBegin).toEqual('100');
        expect(obj.odoEnd).toEqual('500');
        // wat is de timeframe voor een property?
        //expect(obj.timeframe).toEqual('2013-01-19 14:00'); ?
      }
    };

    AlertServiceMock = {
      add: function () {
      }
    };

    bookingMock = {
      'id':8000244,
      'requestUpdate':'2013-01-17 13:56',
      'responded':null,
      'version':4,
      'status':'accepted',
      'beginBooking': '2013-01-17 14:00',
      'endBooking':'2013-01-17 14:15',
      'riskReduction':false,
      'remarkRequester':'Test remark requester',
      'remarkAuthorizer':'Test remark authorizer',
      'beginRequested':null,
      'endRequested':null,
      'personId':31,
      'resource':{'id':5004, 'ownerId':500007},
      'trip':{
        'begin':'2013-01-17 14:00',
        'end':'2013-01-17 14:15',
        'odoBegin':200,
        'odoEnd':300,
        'invoice':null,
        'id':8000244,
        'userChip':null,
        'updated':false,
        'finalized':false,
        'remark':null,
        'booking_id':8000244
      }
    };

    contractsMock = {
      'id':8000244,
      'requestUpdate':'2013-01-17 13:56',
      'responded':null,
      'version':4,
      'status':'accepted',
      'beginBooking': '2013-01-17 14:00',
      'endBooking':'2013-01-17 14:15',
      'riskReduction':false,
      'remarkRequester':'Test remark requester',
      'remarkAuthorizer':'Test remark authorizer',
      'beginRequested':null,
      'endRequested':null,
      'personId':31,
      'resource':{'id':5004, 'ownerId':500007},
      'trip':{
        'begin':'2013-01-17 14:00',
        'end':'2013-01-17 14:15',
        'odoBegin':200,
        'odoEnd':300,
        'invoice':null,
        'id':8000244,
        'userChip':null,
        'updated':false,
        'finalized':false,
        'remark':null,
        'booking_id':8000244
      }
    };
  });

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    $scope = $rootScope.$new();

    ctrl = $controller('TripShowTimeframeController', {
      $scope: $scope,
      booking: bookingMock,
      driverContracts: contractsMock,
      bookingService: BookingServiceMock,
      alertService: AlertServiceMock
    });
  }));

  it('should put booking on scope', function () {
    expect($scope.booking).toEqual(bookingMock);
  });

  it('should alter a booking request', function () {


    $scope.booking = bookingMock;
    $scope.booking.beginRequested = '2013-01-18 14:00';
    $scope.booking.endRequested = '2013-01-19 14:00';
    $scope.booking.remarkRequester = 'Test remark requester';
    $scope.saveRequest();
  });

  it('should alter a booking', function () {


    $scope.booking = bookingMock;
    $scope.booking.beginBooking = '2013-01-18 14:00';
    $scope.booking.endBooking = '2013-01-19 14:00';
    // welke remark moet hier worden meegegeven? requester of authorizer?
    //$scope.booking.remarkRequester = 'Test remark requester';
    $scope.alterBooking();
  });

  it('should set a trip', function () {


    $scope.booking = bookingMock;
    $scope.booking.trip.begin = '2013-01-18 14:00';
    $scope.booking.trip.end = '2013-01-19 14:00';
    $scope.booking.trip.odoBegin = '100';
    $scope.booking.trip.odoEnd = '500';
    $scope.setTrip();
  });
});
