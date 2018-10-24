'use strict';

angular.module('addDamageDialogDirective', [])

.directive('addDamageDialog', function () {
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: 'directives/addDamageDialogDirective/addDamageDialogDirective.tpl.html',
    controller: function ($scope, $state, $stateParams, $mdDialog, $window, alertService, damageService, $mdMedia, contractService,
      API_DATE_FORMAT) {

      $scope.addDamage = function() {
        $window.scrollTo(0, 0);
        $mdDialog.show({
          fullscreen: $mdMedia('xs'),
          templateUrl: 'directives/addDamageDialogDirective/addDamageDialog.tpl.html',
          parent: angular.element(document.body),
          clickOutsideToClose:true,
          locals: {
            booking: $scope.booking,
            contract: $scope.contract,
            resource: $scope.resource
          },
          controller: ['$scope', '$mdDialog', 'booking', 'contract', 'resource', function($scope, $mdDialog, booking, contract, resource) {
            $scope.damage = [];
            $scope.damage.files = [];

            //create damage with or without a booking
            if (booking) {
              $scope.booking = booking;
              $scope.contract = contract;
              $scope.resource = booking.resource;

              $scope.age = moment().diff(booking.person.dateOfBirth, 'years');
              if(isNaN($scope.age)) {
                $scope.age = 'Onbekend';
              }
            } else {
              $scope.resource = resource;
            }

            //on file upload add the selected files to damage.files
            $scope.$on('fileSelected', function (event, args) {
              $scope.$apply(function (index) {
                $scope.damage.files.push(args.file);
              });
            });

            $scope.damageTypes = [
              {label: 'Bekleding', value: 'coating'},
              {label: 'Diefstal', value: 'theft'},
              {label: 'Lakschade', value: 'paint'},
              {label: 'Motorisch', value: 'motor'},
              {label: 'Roken', value: 'smoking'},
              {label: 'Ruitschade', value: 'window'}
            ];

            function makeNewDateString(date) {
              var newDate = moment(date);
              return newDate.format('YYYY-MM-DD');
            }

            $scope.done = function() {
              $mdDialog.hide({
                damage: $scope.damage,
                damageDate: makeNewDateString($scope.damage.damageDate),
                resource: $scope.resource,
                files: $scope.damage.files
              });
            };
            $scope.cancel = $mdDialog.cancel;
          }]
        })
        .then(function(res) {
          if(!$scope.booking) {
            res.damage.withoutBooking = true;
          }
          //save new damage
          return damageService.add({
            booking: res.damage.withoutBooking ? undefined : $scope.booking.id,
            resource: res.resource.id,
            person: res.damage.withoutBooking ? undefined : $scope.booking.person.id,
            newProps: {
              ownRiskAmountMyWheels: res.damage.ownRiskAmountMyWheels,
              ownRiskAmountPerson: res.damage.ownRiskAmountPerson,
              damageAmountAgreed: res.damage.damageAmountAgreed,
              damageAmountInvoice: res.damage.damageAmountInvoice,
              description: res.damage.description,
              type: res.damage.type,
              odo: res.damage.odo,
              ticketNumbers: res.damage.ticketNumbers,
              notify: res.damage.notify,
              finalized: res.damage.finalized,
              damageDate: res.damageDate
            }
          }, {
            'files[0]': res.files[0] ? res.files[0] : undefined,
            'files[1]': res.files[1] ? res.files[1] : undefined,
            'files[2]': res.files[2] ? res.files[2] : undefined,
            'files[3]': res.files[3] ? res.files[3] : undefined,
            'files[4]': res.files[4] ? res.files[4] : undefined,
            'files[5]': res.files[5] ? res.files[5] : undefined,
            'files[6]': res.files[6] ? res.files[6] : undefined,
            'files[7]': res.files[7] ? res.files[7] : undefined,
            'files[8]': res.files[8] ? res.files[8] : undefined,
            'files[9]': res.files[9] ? res.files[9] : undefined
          })
          .then(function(res) {
            alertService.add('success', 'De schademelding is succesvol opgeslagen.', 5000);
          })
          .catch(function(err) {
            alertService.add('warning', 'De schademelding kon niet opgeslagen worden: ' + err.message, 5000);
          });
        });
      };

    }
  };
});