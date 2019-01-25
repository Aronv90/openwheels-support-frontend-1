'use strict';

angular.module('addMaintenanceDialogDirective', [])

.directive('addMaintenanceDialog', function () {
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: 'directives/addMaintenanceDialogDirective/addMaintenanceDialogDirective.tpl.html',
    controller: function ($scope, $state, $stateParams, $mdDialog, $window, alertService, maintenanceService, $mdMedia, contractService,
      API_DATE_FORMAT) {

      $scope.addMaintenance = function() {
        $window.scrollTo(0, 0);
        $mdDialog.show({
          fullscreen: $mdMedia('xs'),
          templateUrl: 'directives/addMaintenanceDialogDirective/addMaintenanceDialog.tpl.html',
          parent: angular.element(document.body),
          clickOutsideToClose:true,
          locals: {
            maintenances: $scope.maintenances,
            booking: $scope.booking,
            contract: $scope.contract,
            resource: $scope.resource   
          },
          controller: ['$scope', '$mdDialog', 'booking', 'contract', 'resource', 'maintenances', function($scope, $mdDialog, booking,
            contract, resource, maintenances) {
            $scope.maintenance = [];
            $scope.maintenance.files = [];
            $scope.maintenances = maintenances;

            //create maintenance with or without a booking
            if (booking) {
              $scope.booking = booking;
              $scope.resource = booking.resource;
            } else {
              $scope.booking = null;
              $scope.resource = resource;
            }

            if(typeof !$scope.resource.garage === 'undefined'){
              $scope.maintenance.resource.garage = {};
              $scope.maintenance.resource.garage.id = null;
              $scope.maintenance.resource.garage.name = null;
            } else {
              $scope.maintenance.garage = $scope.resource.garage;
            }

            //on file upload add the selected files to maintenance.files
            $scope.$on('fileSelected', function (event, args) {
              $scope.$apply(function (index) {
                $scope.maintenance.files.push(args.file);
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

            $scope.maintenanceTypes = [
              {label: 'Boordcomputer', value: 'boardcomputer'},
              {label: 'Garantie', value: 'guarantee'},
              {label: 'Onderhoudsbeurt', value: 'regular'}
            ];

            $scope.paidByOptions = [
              {label: 'Eigenaar (niet MyWheels)', value: 'owner'},
              {label: 'Leasemaatschappij', value: 'lease'},
              {label: 'MyWheels', value: 'mywheels'},
              {label: 'Niet gerepareerd', value: 'unrepaired'},
              {label: 'Verzekering', value: 'insurance'}
            ];

            function makeNewDateString(date) {
              var newDate = moment(date);
              return newDate.format('YYYY-MM-DD');
            }

            $scope.save = function() {
              //save new maintenance
              maintenanceService.add({
                booking: $scope.booking ? $scope.booking.id : undefined,
                resource: $scope.resource.id,
                garage: $scope.maintenance.garage ? $scope.maintenance.garage.id : undefined,
                newProps: {
                  amountAgreed: $scope.maintenance.amountAgreed,
                  amountInvoice: $scope.maintenance.amountInvoice,
                  description: $scope.maintenance.description,
                  type: $scope.maintenance.type,
                  odo: $scope.maintenance.odo ? $scope.maintenance.odo : undefined,
                  apk: $scope.maintenance.apk,
                  regular: $scope.maintenance.regular,
                  finalized: $scope.maintenance.finalized,
                  maintenanceDate: makeNewDateString($scope.maintenance.maintenanceDate),
                  paidBy: $scope.maintenance.paidBy
                }
              }, {
                'files[0]': $scope.maintenance.files[0] ? $scope.maintenance.files[0] : undefined,
                'files[1]': $scope.maintenance.files[1] ? $scope.maintenance.files[1] : undefined,
                'files[2]': $scope.maintenance.files[2] ? $scope.maintenance.files[2] : undefined,
                'files[3]': $scope.maintenance.files[3] ? $scope.maintenance.files[3] : undefined,
                'files[4]': $scope.maintenance.files[4] ? $scope.maintenance.files[4] : undefined,
                'files[5]': $scope.maintenance.files[5] ? $scope.maintenance.files[5] : undefined,
                'files[6]': $scope.maintenance.files[6] ? $scope.maintenance.files[6] : undefined,
                'files[7]': $scope.maintenance.files[7] ? $scope.maintenance.files[7] : undefined,
                'files[8]': $scope.maintenance.files[8] ? $scope.maintenance.files[8] : undefined,
                'files[9]': $scope.maintenance.files[9] ? $scope.maintenance.files[9] : undefined
              })
              .then(function(res) {
                $mdDialog.hide();
                if(!$scope.booking) {
                  $scope.maintenances.unshift(res);
                }
                alertService.add('success', 'De onderhoudsmelding is succesvol opgeslagen.', 5000);
              })
              .catch(function(err) {
                $scope.maintenance.files = [];
                alertService.add('warning', 'De onderhoudsmelding kon niet opgeslagen worden: ' + err.message, 5000);
              });
            };

            $scope.cancel = $mdDialog.cancel;
          }]
        });
      };

    }
  };
});