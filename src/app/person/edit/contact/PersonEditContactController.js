'use strict';

angular.module('openwheels.person.edit.data.contact', [])

.controller('PersonEditContactController', function ($scope, $timeout, dutchZipcodeService, personService, person) {

  var masterPerson = person;

  $scope.cancel = function () {
    $scope.person = angular.copy(masterPerson);
  };

  $scope.save = function () {
    personService.alter({
      id: masterPerson.id,
      newProps: difference(masterPerson, $scope.person)
    }).then(function () {
        masterPerson = $scope.person;
        angular.extend(person, masterPerson);
        $scope.cancel();
      });

  };

  $scope.isCancelDisabled = function () {
    return angular.equals(masterPerson, $scope.person);
  };

  $scope.isSaveDisabled = function () {
    return $scope.contactDataForm.$invalid || angular.equals(masterPerson, $scope.person);
  };

  $scope.cancel();


  // ZIP CODE LOOKUP
  
  $scope.isZipLookupBusy = false;
  $scope.lookupZip = function () {

    // Clear address fields immediately
    var result = {
      streetName : null,
      city       : null,
      country    : null,
      latitude   : null,
      longitude  : null
    };
    angular.extend($scope.person, result);

    // Start lookup
    $scope.isZipLookupBusy = true;
    dutchZipcodeService.autocomplete({
      zipcode      : $scope.person.zipcode,
      streetNumber : $scope.person.streetNumber
    })
    .then(function(data) {
      var item = data && data.length && data[0];
      if (item) {
        result = {
          streetName : item.street,
          zipcode    : item.nl_sixpp,
          city       : item.city,
          country    : 'Nederland',
          latitude   : item.lat,
          longitude  : item.lng
        };
      }
    })
    .catch(function() {
      // Do nothing on error
    })
    .finally(function() {
      // Fill results
      angular.extend($scope.person, result);
      $timeout(function() {
        $scope.isZipLookupBusy = false;
      }, 0);
    });
  };
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
