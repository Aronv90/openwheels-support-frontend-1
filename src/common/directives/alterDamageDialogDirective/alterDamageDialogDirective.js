
'use strict';

angular.module('alterDamageDialogDirective', [])

.directive('alterDamageDialog', function () {
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: 'directives/alterDamageDialogDirective/alterDamageDialogDirective.tpl.html',
    controller: function ($scope, $state, settingsService, $stateParams, $mdDialog, $window, alertService, damageService, $mdMedia, contractService,
      API_DATE_FORMAT) {

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
            $scope.damage.newFiles = [];

            $scope.damageTypes = [
              {label: 'Banden', value: 'tires'},
              {label: 'Bekleding', value: 'coating'},
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
                $scope.damage.newFiles.push(args.file);
              });
            });

            //only if damage is linked to a person/booking
            if($scope.damage.person) {
              $scope.age = moment().diff($scope.damage.person.dateOfBirth, 'years');
              if(isNaN($scope.age)) {
                $scope.age = 'Onbekend';
              }
            }
            $scope.done = function() {
              $mdDialog.hide({
                damage: $scope.damage,
                masterDamage: masterDamage,
                damageDate: makeNewDateString($scope.damage.damageDate),
                files: $scope.damage.newFiles
              });
            };
            $scope.cancel = $mdDialog.cancel;
          }],
        })
        .then(function(res) {
          //don't update files
          res.masterDamage.files = [];
          res.damage.files = [];
          var newProps = difference(res.masterDamage, res.damage);
          
          return damageService.alter({
            damage: damage.id,
            newProps: newProps
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