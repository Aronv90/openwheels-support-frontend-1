'use strict';

angular.module('openwheels.resource.show.members', [])

.controller('ResourceShowMembersController', function ($scope, $log, $filter, $stateParams, resource, members, alertService, resourceService, personService) {
  var masterMembers = members;

  $scope.searchMember = null;
  $scope.cancel = function () {
    $scope.members = angular.copy(masterMembers);
    $scope.searchMember = null;
  };

  $scope.addMember = function (person) {
    resourceService.addMember({
      resource: resource.id,
      person: person.id
    }).then(function (members) {
      alertService.add('success', 'Person added', 3000);
      masterMembers = members;
      $scope.cancel();
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };

  $scope.removeMember = function (person) {
    resourceService.removeMember({
      resource: resource.id,
      person: person.id
    }).then(function (members) {
      alertService.add('success', 'Person removed', 3000);
      masterMembers = members;
      $scope.cancel();
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };

  $scope.isCancelDisabled = function () {
    return angular.equals(masterMembers, $scope.members);
  };

  $scope.isSaveDisabled = function () {
    return $scope.editResourceForm.$invalid || angular.equals(masterMembers, $scope.members);
  };

  /**
   * Typeahead Sender
   */
  $scope.searchPersons = function ($viewValue) {
    return personService.search({
      search: $viewValue
    });
  };
  $scope.formatPerson = function ($model) {
    var inputLabel = '';
    if ($model) {
      inputLabel = $filter('fullname')($model) + ' [' + $model.id + ']';
    }
    return inputLabel;
  };
  $scope.cancel();
})
;
