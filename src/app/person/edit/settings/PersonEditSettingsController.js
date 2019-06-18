'use strict';

angular.module('openwheels.person.edit.data.settings', [])

  .controller('PersonEditSettingsController', function ($scope, $filter, dialogService, alertService, personService, person) {

    var masterPerson = person;

    $scope.statusOptions = [
      {label: 'New', value: 'new'},
      {label: 'Active', value: 'active'},
      {label: 'Blocked', value: 'blocked'},
      {label: 'Uitgeschreven', value: 'unsubscribed'},
      {label: 'Book only', value: 'book-only'}
    ];

    $scope.roleOptions = [
      {label: 'User', value: 'ROLE_USER'},
      {label: 'Admin', value: 'ROLE_ADMIN'},
      {label: 'Provider Admin', value: 'ROLE_PROVIDER_ADMIN'}
    ];

    $scope.visibilityOptions = [
      {label: 'Openbaar', value: 'public'},
      {label: 'Mijn huurders/verhuurders', value: 'rentalrelation_only'},
      {label: 'Alleen leden', value: 'members'},
      {label: 'Niet', value: 'none'}
    ];

    $scope.driverLicenseStatusOptions = [
      {label: 'Niet gecontroleerd', value: 'unchecked'},
      {label: 'Rijbewijs goedgekeurd', value: 'ok'},
      {label: 'Rijbewijs niet goedgekeurd', value: 'nok'},
      {label: 'Rijbewijs wordt gecontroleerd', value: 'pending'}
    ];

    $scope.preferenceOptions = [
      {label: 'Huren', value: 'renter'},
      {label: 'Verhuren', value: 'owner'},
      {label: 'Huren & verhuren', value: 'both'}
    ];

    $scope.emailPreferenceOptions = [
      {label: 'Alle', value: 'all'},
      {label: 'Enkele', value: 'some'},
      {label: 'Minimaal', value: 'min'}
    ];

    $scope.$watch('person.isCompany', function (newValue) {
      if (!newValue) {
        $scope.person.companyName = null;
      }
    });

    $scope.enable2Step = function enable2Step() {
      dialogService.showModal({}, {
        closeButtonText: 'Nee',
        actionButtonText: 'Ja',
        headerText: 'Weet je het zeker?',
        bodyText: 'Wil je tweestaps verificatie activeren voor ' + $filter('fullname')($scope.person) + ' (' + $scope.person.email + ')?'
      })
      .then(function(){
        personService.enableGoogle2steps({person: person.id});
      });
    };

    $scope.cancel = function () {
      $scope.person = angular.copy(masterPerson);
    };

    $scope.save = function () {
      if(masterPerson.status === 'active' && $scope.person.status !== 'active') {
        dialogService.showModal({}, {
          closeButtonText: 'Cancel',
          actionButtonText: 'OK',
          headerText: 'Wijziging status',
          bodyText: 'Wil je de status van ' + $scope.person.firstName + ' wijzigen van ' + masterPerson.status + ' naar ' + $scope.person.status + '? LET OP: de ritten van ' + $scope.person.firstName + ' kunnen geannuleerd worden!'
        })
        .then(function(){
          $scope.alterPerson();
        });
      } else {
        $scope.alterPerson();
      }
    };

    $scope.alterPerson = function () {
      var newProps = difference(masterPerson, $scope.person);
      personService.alter({
        id: masterPerson.id,
        newProps: newProps
      })
      .then(function (returnedPerson) {
        angular.extend(person, returnedPerson);
        masterPerson = returnedPerson;
        alertService.add('success', 'Persoon gewijzigd.', 2000);
        $scope.cancel();
      },
      function (error) {
        alertService.add('danger', 'Foutmelding bij het wijzigen: ' + error.message, 5000);
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
