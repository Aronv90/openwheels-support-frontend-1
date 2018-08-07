'use strict';

angular.module('openwheels.person.edit.data.settings', [])

  .controller('PersonEditSettingsController', function ($scope, $filter, dialogService, alertService, personService, person) {

    var masterPerson = person;

    $scope.statusOptions = [
      {label: 'New', value: 'new'},
      {label: 'Active', value: 'active'},
      {label: 'Blocked', value: 'blocked'},
      {label: 'Unsubscribed', value: 'unsubscribed'},
      {label: 'Book only', value: 'book-only'}
    ];

    $scope.roleOptions = [
      {label: 'User', value: 'ROLE_USER'},
      {label: 'Admin', value: 'ROLE_ADMIN'},
      {label: 'Provider Admin', value: 'ROLE_PROVIDER_ADMIN'}
    ];

    $scope.visibilityOptions = [
      {label: 'Public', value: 'public'},
      {label: 'Rental relations', value: 'rentalrelation_only'},
      {label: 'Members', value: 'members'},
      {label: 'None', value: 'none'}
    ];

    $scope.driverLicenseStatusOptions = [
      {label: 'Niet gecontroleerd', value: 'unchecked'},
      {label: 'Ok', value: 'ok'},
      {label: 'Niet ok', value: 'nok'}
    ];

    $scope.preferenceOptions = [
      {label: 'Renter', value: 'renter'},
      {label: 'Owner', value: 'owner'},
      {label: 'Renter & Owner', value: 'both'}
    ];

    $scope.emailPreferenceOptions = [
      {label: 'All', value: 'all'},
      {label: 'Some', value: 'some'},
      {label: 'Minimum', value: 'min'}
    ];

    $scope.$watch('person.isCompany', function (newValue) {
      if (!newValue) {
        $scope.person.companyName = null;
      }
    });

    $scope.enable2Step = function enable2Step() {
      dialogService.showModal({}, {
        closeButtonText: 'Cancel',
        actionButtonText: 'OK',
        headerText: 'Are you sure?',
        bodyText: 'Do you really want to enable 2 step verification for ' + $filter('fullname')($scope.person) + ' (' + $scope.person.email + ')?'
      })
      .then(function(){
        personService.enableGoogle2steps({person: person.id});
      });
    };

    $scope.cancel = function () {
      $scope.person = angular.copy(masterPerson);
    };

    $scope.save = function () {
      var newProps = difference(masterPerson, $scope.person);
      personService.alter({
        id: masterPerson.id,
        newProps: newProps
      })
        .then(function (returnedPerson) {
          angular.extend(person, returnedPerson);
          masterPerson = returnedPerson;
          alertService.add('success', 'Person Modified.', 2000);
          $scope.cancel();
        },
        function (error) {
          alertService.add('danger', 'Edit Person failed: ' + error.message, 5000);
          $scope.cancel();
        });

    };

    $scope.isCancelDisabled = function () {
      return angular.equals(masterPerson, $scope.person);
    };

    $scope.isSaveDisabled = function () {
      return $scope.mywheelsDataForm.$invalid || angular.equals(masterPerson, $scope.person);
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
