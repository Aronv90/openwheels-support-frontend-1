'use strict';

angular.module('openwheels.person.edit.data.account', [])

.controller('PersonEditAccountController', function ($scope, accountService, personService, person, account, alertService) {

  var masterAccount = account;

  $scope.cancel = function () {
    $scope.account = angular.copy(masterAccount);
  };

  $scope.save = function () {
    var newProps = difference(masterAccount, $scope.account);
    accountService.alter({
      id: account.id,
      newProps: newProps
    }).then(function () {
        masterAccount = $scope.account;
        $scope.cancel();
        alertService.add('success', 'Account gewijzigd', 2000);
      }, function(error) {
        alertService.add('danger', error.message, 5000);
      });

  };

  $scope.isCancelDisabled = function () {
    return angular.equals(masterAccount, $scope.account);
  };

  $scope.isSaveDisabled = function () {
    return $scope.accountDataForm.$invalid || angular.equals(masterAccount, $scope.account);
  };

  $scope.cancel();


  $scope.toggleVerified = function(person){
    personService.alter({id: person.id, newProps: {bankCheck: !person.bankCheck} }).then(
      function(person){
        $scope.person = person;
      },
      function(error){}
    );
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
