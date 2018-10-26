'use strict';

angular.module('alterMaintenanceDialogDirective', [])

.directive('alterMaintenanceDialog', function () {
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: 'directives/alterMaintenanceDialogDirective/alterMaintenanceDialogDirective.tpl.html',
    controller: function ($scope, $state, $stateParams, $mdDialog, $window, alertService, maintenanceService, $mdMedia, contractService,
      API_DATE_FORMAT, settingsService) {

      $scope.alterMaintenance = function(maintenance) {
        $window.scrollTo(0, 0);
        var masterMaintenance = angular.copy(maintenance);
        $scope.maintenance = maintenance;
        $scope.resource = maintenance.resource;

        //only if maintenance is linked to a booking
        if(maintenance.booking) {
          $scope.booking = maintenance.booking;

          contractService.get({contract: maintenance.booking.contract.id})
          .then(function(contract) {
            $scope.contract = contract;
          });
        }

        $mdDialog.show({
          fullscreen: $mdMedia('xs'),
          preserveScope: true,
          scope: $scope,
          locals: {
            masterMaintenance: masterMaintenance
          },
          templateUrl: 'directives/alterMaintenanceDialogDirective/alterMaintenanceDialog.tpl.html',
          clickOutsideToClose:true,
          controller: ['$scope', '$mdDialog', 'masterMaintenance', function($scope, $mdDialog, masterMaintenance) {
            $scope.newFiles = [];
            function makeNewDateString(date) {
              var newDate = moment(date);
              return newDate.format('YYYY-MM-DD');
            }

            //on file upload add the selected files to maintenance.files
            $scope.$on('fileSelected', function (event, args) {
              $scope.$apply(function (index) {
                $scope.newFiles.push(args.file);
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

            initFiles();

            function initFiles() {
              $scope.currentFiles = createArray($scope.maintenance.files);
            }

            function createArray(files) {
              var out = [];
              angular.forEach(files, function (file) {
                out.push({
                  url: settingsService.settings.server + '/' + 'mw-docs-storage/' + file.id + '/' + file.name,
                  originalName: file.original
                });
              });
              return out;
            }

            $scope.save = function() {
              $scope.files = 
              //don't update files
              masterMaintenance.files = [];
              $scope.maintenance.files = [];
              $scope.maintenance.maintenanceDate = makeNewDateString($scope.maintenance.maintenanceDate);
              var newProps = difference(masterMaintenance, $scope.maintenance);

              //only change garage id
              if(newProps.garage) {
                newProps.garage = newProps.garage.id;
              }

              maintenanceService.alter({
                maintenance: $scope.maintenance.id,
                newProps: newProps
              }, {
                'files[0]': $scope.newFiles[0] ? $scope.newFiles[0] : undefined,
                'files[1]': $scope.newFiles[1] ? $scope.newFiles[1] : undefined,
                'files[2]': $scope.newFiles[2] ? $scope.newFiles[2] : undefined,
                'files[3]': $scope.newFiles[3] ? $scope.newFiles[3] : undefined,
                'files[4]': $scope.newFiles[4] ? $scope.newFiles[4] : undefined,
                'files[5]': $scope.newFiles[5] ? $scope.newFiles[5] : undefined,
                'files[6]': $scope.newFiles[6] ? $scope.newFiles[6] : undefined,
                'files[7]': $scope.newFiles[7] ? $scope.newFiles[7] : undefined,
                'files[8]': $scope.newFiles[8] ? $scope.newFiles[8] : undefined,
                'files[9]': $scope.newFiles[9] ? $scope.newFiles[9] : undefined
              })
              .then(function(res) {
                $mdDialog.hide();
                $scope.maintenance.files = res.files;
                alertService.add('success', 'De onderhoudsmelding is succesvol opgeslagen.', 5000);
              })
              .catch(function(err) {
                $scope.newFiles = [];
                alertService.add('warning', 'De onderhoudsmelding kon niet opgeslagen worden: ' + err.message, 5000);
              });
            };

            $scope.cancel = $mdDialog.cancel;
          }],
        });
      };

    }
  };
});

function difference(template, override) {
  var ret = {};
  for (var name in template) {
    if (name in override) {
      if (_.isObject(override[name]) && !_.isArray(override[name])) {
        var diff;
        if(_.isEmpty(template[name]) && !_.isEmpty(override[name])){
          diff = override[name];
        }else{
          diff = difference(template[name], override[name]);
        }
        if (!_.isEmpty(diff)) {
          ret[name] = diff;
        }
      } else if (!_.isEqual(template[name], override[name])) {
        ret[name] = override[name];
      }
    }
  }
  return ret;
}