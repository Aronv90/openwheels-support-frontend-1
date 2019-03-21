'use strict';

angular.module('openwheels.person.edit.data.personal', [])

.controller('PersonEditPersonalController', function ($scope, personService, person, alertService) {

  var masterPerson = person;

  $scope.dateConfig = {
    //model
    modelFormat: 'YYYY-MM-DD',
    formatSubmit: 'yyyy-mm-dd',

    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',

    //options
    selectMonths: true,
    selectYears: '100',
    max: true
  };

  $scope.genderOptions = [
    {label: 'Man', value: true},
    {label: 'Vrouw', value: false}
  ];

  $scope.cancel = function () {
    $scope.person = angular.copy(masterPerson);
  };

  $scope.save = function () {
    personService.alter({
      id: masterPerson.id,
      newProps: difference(masterPerson, $scope.person)
    }).then(function (person) {
        alertService.add('success', 'Persoon gewijzigd', 3000);
        masterPerson = person;
        angular.extend(person, masterPerson);
        $scope.cancel();
      }, function(error) {
        alertService.add('danger', error.message, 5000);
      });

  };

  $scope.isCancelDisabled = function () {
    return angular.equals(masterPerson, $scope.person);
  };

  $scope.isSaveDisabled = function () {
    return $scope.personalDataForm.$invalid || angular.equals(masterPerson, $scope.person);
  };

  $scope.cancel();
})

;

// dit moet misschien in een speciale service?
// of id property bij functies die een alter doen deleten
// of via form dirty property op fields controleren en alleen die meesturen
// http://stackoverflow.com/questions/16588263/angular-form-send-only-changed-fields
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
