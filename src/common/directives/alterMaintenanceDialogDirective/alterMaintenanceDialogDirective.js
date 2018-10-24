
'use strict';

angular.module('alterMaintenanceDialogDirective', [])

.directive('alterMaintenanceDialog', function () {
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: 'directives/alterMaintenanceDialogDirective/alterMaintenanceDialogDirective.tpl.html',
    controller: function ($scope, $state, $stateParams, $mdDialog, $window, alertService, maintenanceService, $mdMedia, contractService,
      API_DATE_FORMAT) {

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
          controller: ['$scope', '$mdDialog', 'masterDamage', function($scope, $mdDialog, masterMaintenance) {
            $scope.maintenanceTypes = [
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

            //on file upload add the selected files to maintenance.files
            $scope.$on('fileSelected', function (event, args) {
              $scope.$apply(function (index) {
                $scope.maintenance.files.push(args.file);
              });
            });

            //only if maintenance is linked to a person/booking
            if($scope.maintenance.person) {
              $scope.age = moment().diff($scope.maintenance.person.dateOfBirth, 'years');
              if(isNaN($scope.age)) {
                $scope.age = 'Onbekend';
              }
            }

            $scope.done = function() {
              $mdDialog.hide({
                maintenance: $scope.maintenance,
                masterMaintenance: masterMaintenance,
                maintenanceDate: makeNewDateString($scope.maintenance.maintenanceDate),
                files: $scope.maintenance.files
              });
            };
            $scope.cancel = $mdDialog.cancel;
          }],
        })
        .then(function(res) {
          //don't update files
          res.masterMaintenance.files = [];
          res.maintenance.files = [];
          var newProps = difference(res.masterMaintenance, res.maintenance);
          
          return maintenanceService.alter({
            maintenance: maintenance.id,
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