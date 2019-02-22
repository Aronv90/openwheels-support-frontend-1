'use strict';

angular.module('openwheels.contract.persons', [])

.controller('ContractPersonsController', function ($scope, $filter, $uibModalInstance, dialogService, alertService,
  extraDriverService,
  $log,
  $q,
  contractService, personService, contract, person
) {

    $scope.contract = contract;
    $scope.person = person;

    /**
     * Filter contracts list
     */
    $scope.filterPerson =  function(person) {
      return function( item ) {
        return person.id !== item.id;
      };
    };

    /**
     * Typeahead Person
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

    $scope.dismiss = function () {
      $uibModalInstance.dismiss();
    };

    $scope.all = false;

    $scope.loadingInviteRequests = true;
    $scope.loadInviteRequests = function () {
      return $q(function (resolve, reject) {
        $scope.loadingInviteRequests = true;

        extraDriverService.getRequestsForContract({
          contract: contract.id,
          limit: 999,
          offset: 0,
          all: $scope.all, // also return "removed", "revoked", and "declined" requests
        })
        .then(function (response) {
          $scope.inviteRequests = response.result.map(function (req) {
            req.newStatus = req.status;
            return req;
          });
          $scope.loadingInviteRequests = false;
          resolve();
        })
        .catch(function (err) {
          alertService.addError(err);
          reject();
        });
      });
    };

    $scope.inviteRequestStatuses = [
      { value: 'invited',  label: 'Uitgenodigd' },
      { value: 'declined', label: '├ Afgewezen' },
      { value: 'accepted', label: '└ Geaccepteerd' },
      { value: 'revoked',  label: '. ├ Ingetrokken' },
      { value: 'removed',  label: '. └ Verwijderd' },
    ];

    $scope.acceptNewPerson = true;
    
    $scope.addInviteRequest = function (newPerson) {
      var accept = $scope.acceptNewPerson;

      extraDriverService.invitePersonForContract({
        contract: contract.id,
        email: newPerson.email || newPerson,
      })
      .then(function (newInviteRequest) {
        newInviteRequest.newStatus = newInviteRequest.status;
        $scope.inviteRequests.push(newInviteRequest);

        alertService.add('success', 'Person added', 2000);

        if (accept) {
          // try to accept it
          $scope.updateInviteRequestStatus(newInviteRequest, 'accepted');
        }
      })
      .catch(function (error) {
        alertService.add('danger', error.message, 5000);
      });
    };

    $scope.updateInviteRequestStatus = function (inviteRequest, newStatus) {
      newStatus = newStatus || inviteRequest.newStatus;
      var promise;

      switch (newStatus) {
        case 'declined': {
          promise = extraDriverService.declineContractRequest({ id: inviteRequest.id });
          break;
        }
        case 'accepted': {
          promise = extraDriverService.acceptContractRequest({ id: inviteRequest.id });
          break;
        }
        case 'revoked': {
          promise = extraDriverService.revokeContractRequest({ id: inviteRequest.id });
          break;
        }
        default: /*case 'removed':*/ {
          promise = extraDriverService.removePersonFromContract({ contract: contract.id, person: inviteRequest.recipient.id });
          break;
        }
      }

      promise
      .then(function (resp) {
        $log.log('api response:', resp);
        alertService.add('success', 'Uitnodiging succesvol gewijzigd', 2000);
      })
      .catch(function (err) {
        inviteRequest.newStatus = inviteRequest.status; // revert change
        alertService.addError(err);
      });
    };

  })
;
