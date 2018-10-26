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
            booking: $scope.booking,
            contract: $scope.contract,
            resource: $scope.resource   
          },
          controller: ['$scope', '$mdDialog', 'booking', 'contract', 'resource', function($scope, $mdDialog, booking, contract, resource) {
            $scope.maintenance = [];
            $scope.maintenance.files = [];

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

            $scope.done = function() {
              $mdDialog.hide({
                maintenance: $scope.maintenance,
                maintenanceDate: makeNewDateString($scope.maintenance.maintenanceDate),
                resource: $scope.resource,
                files: $scope.maintenance.files,
                booking: $scope.booking
              });
            };
            $scope.cancel = $mdDialog.cancel;
          }]
        })
        .then(function(res) {
          //save new maintenance
          return maintenanceService.add({
            booking: res.booking ? res.booking.id : undefined,
            resource: res.resource.id,
            garage: res.maintenance.garage.id,
            newProps: {
              amountAgreed: res.maintenance.amountAgreed,
              amountInvoice: res.maintenance.amountInvoice,
              description: res.maintenance.description,
              type: res.maintenance.type,
              odo: res.maintenance.odo,
              apk: res.maintenance.apk,
              regular: res.maintenance.regular,
              finalized: res.maintenance.finalized,
              maintenanceDate: res.maintenanceDate,
              paidBy: res.maintenance.paidBy
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
            if(!res.booking) {
              $scope.maintenances.unshift(res);
            }
            alertService.add('success', 'De onderhoudsmelding is succesvol opgeslagen.', 5000);
          })
          .catch(function(err) {
            alertService.add('warning', 'De onderhoudsmelding kon niet opgeslagen worden: ' + err.message, 5000);
          });
        });
      };

    }
  };
});