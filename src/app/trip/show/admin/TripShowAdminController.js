'use strict';

angular.module('openwheels.trip.show.admin', [])

  .controller('TripShowAdminController', function ($scope, $q, booking, driverContracts,
                                                   bookingService, alertService, declarationService, contract, $uibModal) {
    //scope
    var masterBooking = booking;

    loadDeclarations();
    function loadDeclarations() {
      declarationService.forBooking({booking: booking.id})
      .then(function(res) {
        masterBooking.declarations = res;
        $scope.booking.declarations= res;
      });
    }

    $scope.booking = angular.copy(masterBooking);
    $scope.contract = contract;
    $scope.declaration = {};
    $scope.driverContracts = driverContracts;
    
    if(booking.trip.odoEnd - booking.trip.odoBegin > 0) {
      $scope.enableFinalize = true;
    }
    if(!booking.trip.odoEnd && !booking.trip.odoBegin) {
      $scope.enableFinalize = true;
    }

    $scope.dateConfig = {
      //model
      modelFormat: 'YYYY-MM-DD HH:mm',
      formatSubmit: 'yyyy-mm-dd',

      //view
      viewFormat: 'DD-MM-YYYY',
      format: 'dd-mm-yyyy',
      //options
      selectMonths: true

    };

    $scope.timeConfig = {
      //model
      modelFormat: 'YYYY-MM-DD HH:mm',
      formatSubmit: 'HH:i',

      //view
      viewFormat: 'HH:mm',
      format: 'HH:i',

      //options
      interval: 5
    };


    $scope.openModal = function (declaration) {
      $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'trip/show/admin/modal.tpl.html',
        controller: function($scope, $uibModalInstance, declaration) {
          $scope.ok = function () {
            $uibModalInstance.close();
          };
          $scope.declaration = declaration;
        },
        size: 'lg',
        resolve: {
          declaration: function () {
            return declaration;
          }
        }
      });
    };

    $scope.toggleAnimation = function () {
      $scope.animationsEnabled = !$scope.animationsEnabled;
    };


    $scope.addDeclaration = function() {
      if($scope.declaration && $scope.declaration.amount) {
        if(!$scope.declaration.file) {
          alertService.add('danger', 'Je moet de foto/scan van de tankbon nog toevoegen');
          return;
        }
        alertService.load();
        var params = {
          booking : $scope.booking.id,
          description: '',
          amount: $scope.declaration.amount,
        };

        declarationService.create(params, {image: $scope.declaration.file})
        .then(function (results) {
          alertService.add('success', 'Declaration successfuly added', 5000);
          $scope.booking.declarations.unshift(results);
          $scope.declaration = {};
        })
        .catch(function (err) {
          alertService.addError(err);
        })
        .finally(function () {
          alertService.loaded();
        });
      }
    };

    $scope.fileChanged = function(file) {
      $scope.declaration.file = file;
    };

    $scope.saveBooking = function () {

      var newProps;
      newProps = {};

      if ($scope.booking.beginBooking !== masterBooking.beginBooking || $scope.booking.endBooking !== masterBooking.endBooking) {
        newProps.beginBooking = $scope.booking.beginBooking;
        newProps.endBooking = $scope.booking.endBooking;
      }

      if ($scope.booking.remarkRequester !== masterBooking.remarkRequester) {
        newProps.remarkRequester = $scope.booking.remarkRequester;
      }

      if (masterBooking.contract ===  null || $scope.booking.contract.id !== masterBooking.contract.id) {
        newProps.contract = $scope.booking.contract.id;
      }

      if (! _.isEmpty(newProps)) {
        bookingService.alter({id: $scope.booking.id, newProps: newProps})
          .then(function (booking) {
            angular.extend($scope.booking, booking);
            masterBooking = angular.copy($scope.booking);
            alertService.add('success', 'Booking edited', 2000);
          }, function (error) {
            alertService.add('danger', error.message, 5000);
          }
        );
      }
    };

    $scope.setTrip = function () {
      bookingService.setTrip({
        id: $scope.booking.id,
        begin: $scope.booking.trip.begin,
        end: $scope.booking.trip.end,
        odoBegin: $scope.booking.trip.odoBegin,
        odoEnd: $scope.booking.trip.odoEnd
        //timeframe
      }).then(function (booking) {
        angular.extend($scope.booking.trip, booking.trip);
        $scope.enableFinalize = booking.trip.odoEnd - booking.trip.odoBegin > 0;
        //(trip.odoEnd - trip.odoBegin > 0);
        alertService.add('success', 'Trip set', 2000);
      }, function (error) {
        alertService.add('danger', error.message, 5000);
      });
    };
    
    $scope.finalize = function () {
      bookingService.finishTrip({
        booking: $scope.booking.id
      }).then(function (trip) {
        angular.extend($scope.booking.trip, trip);
        alertService.add('success', 'Trip afgesloten', 2000);
      }, function (error) {
        alertService.add('danger', error.message, 5000);
      });
    };

    //checks
    $scope.isTrip = function () {
      // status accepted and booking is passed
      return $scope.booking.status === 'accepted' && moment().isAfter(moment($scope.booking.beginBooking));
    };
    $scope.isBooking = function () {
      // status accepted and booking not yet passed
      return $scope.booking.status === 'accepted' && moment().isBefore(moment($scope.booking.beginBooking));
    };

    $scope.isFinished = function () {
      // endbooking has passed
      return moment($scope.booking.endBooking).isBefore( moment() );
    };

    $scope.isRequest = function () {
      // status requested or isBooking with a new request
      return $scope.booking.status === 'requested' || ( $scope.isBooking() && $scope.booking.beginRequested && $scope.booking.endRequested );
    };
    //booking functions
    $scope.isResponseDisabled = function () {
      console.log($scope.requestForm.$dirty);
      return $scope.requestForm.$dirty;
    };

  })
;
