
'use strict';

angular.module('alterDamageDialogDirective', [])

.directive('alterDamageDialog', function () {
  return {
    restrict: 'AE',
    transclude: true,
    templateUrl: 'directives/alterDamageDialogDirective/alterDamageDialogDirective.tpl.html',
    controller: function ($scope, $state, $stateParams, $mdDialog, $window, alertService, damageService, $mdMedia, contractService,
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
          controller: ['$scope', '$mdDialog', 'masterDamage', function($scope, $mdDialog, masterDamage) {
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
                damageDate: makeNewDateString($scope.damage.damageDate)
              });
            };
            $scope.cancel = $mdDialog.cancel;
          }],
        })
        .then(function(res) {
          var newProps = difference(res.masterDamage, res.damage);
          return damageService.alter({
            damage: damage.id,
            newProps: newProps
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