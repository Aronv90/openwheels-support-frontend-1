
'use strict';

angular.module('alterDamageDialogDirective', [])

.directive('alterDamageDialog', function () {
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: 'directives/alterDamageDialogDirective/alterDamageDialogDirective.tpl.html',
    controller: function ($scope, $state, settingsService, $stateParams, $mdDialog, $window, alertService, damageService, $mdMedia, contractService,
      API_DATE_FORMAT, maintenanceService) {

      $scope.alterDamage = function(damage) {
        $window.scrollTo(0, 0);
        var masterDamage = angular.copy(damage);
        $scope.damage = damage;
        $scope.resource = damage.resource;

        //only if damage is linked to a booking
        if(damage.booking) {
          $scope.booking = damage.booking;

          contractService.get({contract: damage.booking.contract.id})
          .then(function(contract) {
            $scope.contract = contract;
          });
        } else {
          $scope.damage.booking = [];
          $scope.damage.booking.id = null;
        }

        $mdDialog.show({
          fullscreen: $mdMedia('xs'),
          preserveScope: true,
          scope: $scope,
          locals: {
            masterDamage: masterDamage
          },
          templateUrl: 'directives/alterDamageDialogDirective/alterDamageDialog.tpl.html',
          clickOutsideToClose:true,
          controller: ['$scope', '$mdDialog', 'masterDamage', 'settingsService', function($scope, $mdDialog, masterDamage, settingsService) {
            $scope.newFiles = [];

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

            initFiles();

            function initFiles() {
              $scope.currentFiles = createArray($scope.damage.files);
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

            //on file upload add the selected files to damage.files
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

            //only if damage is linked to a person/booking
            if($scope.damage.person) {
              $scope.age = moment().diff($scope.damage.person.dateOfBirth, 'years');
              if(isNaN($scope.age)) {
                $scope.age = 'Onbekend';
              }
            }

            $scope.save = function() {
              //don't update files
              masterDamage.files = [];
              $scope.damage.files = [];
              $scope.damage.damageDate = makeNewDateString($scope.damage.damageDate);
              var newProps = difference(masterDamage, $scope.damage);

              if($scope.damage.garage) {
                newProps.garage = $scope.damage.garage.id;
              }

              if($scope.damage.booking && !masterDamage.booking) {
                newProps.booking = $scope.damage.booking.id;
              }

              damageService.alter({
                damage: $scope.damage.id,
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
                $scope.damage.files = res.files;
                alertService.add('success', 'De schademelding is succesvol opgeslagen.', 5000);
              })
              .catch(function(err) {
                $scope.newFiles = [];
                alertService.add('warning', 'De schademelding kon niet opgeslagen worden: ' + err.message, 5000);
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
        var diff = difference(template[name], override[name]);
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