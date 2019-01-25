'use strict';

angular.module('addDamageDialogDirective', [])

.directive('addDamageDialog', function () {
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: 'directives/addDamageDialogDirective/addDamageDialogDirective.tpl.html',
    controller: function ($scope, $state, $stateParams, $mdDialog, $window, alertService, damageService, $mdMedia, contractService,
      API_DATE_FORMAT, maintenanceService) {

      $scope.addDamage = function() {
        $window.scrollTo(0, 0);
        $mdDialog.show({
          fullscreen: $mdMedia('xs'),
          templateUrl: 'directives/addDamageDialogDirective/addDamageDialog.tpl.html',
          parent: angular.element(document.body),
          locals: {
            damages: $scope.damages,
            booking: $scope.booking,
            contract: $scope.contract,
            resource: $scope.resource
          },
          controller: ['$scope', '$mdDialog', 'booking', 'contract', 'resource', 'damages', function($scope, $mdDialog, booking,
            contract, resource, damages) {
            $scope.damage = [];
            $scope.damage.files = [];
            $scope.damages = damages;

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

            if(typeof !$scope.resource.garage === 'undefined'){
              $scope.damage.resource.garage = {};
              $scope.damage.resource.garage.id = null;
              $scope.damage.resource.garage.name = null;
            } else {
              $scope.damage.garage = $scope.resource.garage;
            }

            //on file upload add the selected files to damage.files
            $scope.$on('fileSelected', function (event, args) {
              $scope.$apply(function (index) {
                $scope.damage.files.push(args.file);
              });
            });

            /**
             * Typeahead Garages
             */
            $scope.searchGarages = function ($viewValue) {
              return maintenanceService.searchGarage({
                search: $viewValue
              })
              .then(function(garages){
                return garages.result;
              });
            };

            $scope.formatGarage = function ($model) {
              var inputLabel = '';
              if ($model) {
                inputLabel = $model.name + ' ' + '[' + $model.id + ']';
              }
              return inputLabel;
            };

            $scope.damageTypes = [
              {label: 'Banden', value: 'tires'},
              {label: 'Bekleding', value: 'coating'},
              {label: 'Bestickering', value: 'stickers'},
              {label: 'Diefstal', value: 'theft'},
              {label: 'Lakschade', value: 'paint'},
              {label: 'Motorisch', value: 'motor'},
              {label: 'Roken', value: 'smoking'},
              {label: 'Ruitschade', value: 'window'}
            ];

            $scope.paidByOptions = [
              {label: 'Eigenaar (niet MyWheels)', value: 'owner'},
              {label: 'MyWheels', value: 'mywheels'},
              {label: 'Niet gerepareerd', value: 'unrepaired'},
              {label: 'Verzekering', value: 'insurance'}
            ];

            function makeNewDateString(date) {
              var newDate = moment(date);
              return newDate.format('YYYY-MM-DD');
            }

            $scope.save = function() {
              if(!$scope.booking) {
                $scope.damage.withoutBooking = true;
              }
              //save new damage
              return damageService.add({
                booking: $scope.damage.withoutBooking ? undefined : $scope.booking.id,
                resource: $scope.resource.id,
                garage: $scope.damage.garage ? $scope.damage.garage.id : undefined,
                person: $scope.damage.withoutBooking ? undefined : $scope.booking.person.id,
                newProps: {
                  ownRiskAmountMyWheels: $scope.damage.ownRiskAmountMyWheels,
                  ownRiskAmountPerson: $scope.damage.ownRiskAmountPerson,
                  amountAgreed: $scope.damage.amountAgreed,
                  amountInvoice: $scope.damage.amountInvoice,
                  description: $scope.damage.description,
                  type: $scope.damage.type,
                  odo: $scope.damage.odo ? $scope.damage.odo : undefined,
                  ticketNumbers: $scope.damage.ticketNumbers,
                  notify: $scope.damage.notify,
                  finalized: $scope.damage.finalized,
                  damageDate: makeNewDateString($scope.damage.damageDate),
                  paidBy: $scope.damage.paidBy,
                  reminderAccidentReport: $scope.damage.reminderAccidentReport
                }
              }, {
                'files[0]': $scope.damage.files[0] ? $scope.damage.files[0] : undefined,
                'files[1]': $scope.damage.files[1] ? $scope.damage.files[1] : undefined,
                'files[2]': $scope.damage.files[2] ? $scope.damage.files[2] : undefined,
                'files[3]': $scope.damage.files[3] ? $scope.damage.files[3] : undefined,
                'files[4]': $scope.damage.files[4] ? $scope.damage.files[4] : undefined,
                'files[5]': $scope.damage.files[5] ? $scope.damage.files[5] : undefined,
                'files[6]': $scope.damage.files[6] ? $scope.damage.files[6] : undefined,
                'files[7]': $scope.damage.files[7] ? $scope.damage.files[7] : undefined,
                'files[8]': $scope.damage.files[8] ? $scope.damage.files[8] : undefined,
                'files[9]': $scope.damage.files[9] ? $scope.damage.files[9] : undefined
              })
              .then(function(res) {
                $mdDialog.hide();
                $scope.damages.unshift(res);
                alertService.add('success', 'De schademelding is succesvol opgeslagen.', 5000);
              })
              .catch(function(err) {
                $scope.damage.files = [];
                alertService.add('warning', 'De schademelding kon niet opgeslagen worden: ' + err.message, 5000);
              });
            };

            $scope.cancel = $mdDialog.cancel;
          }]
        });
      };

    }
  };
});