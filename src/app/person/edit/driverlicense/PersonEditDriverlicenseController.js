'use strict';

angular.module('openwheels.person.edit.data.driverlicense', [])
	.directive('moveNextOnMaxlength', function() {
		return {
			restrict: 'A',
			link: function($scope, element) {
				element.on('input', function(e) {
					if(window.parseInt(element.val().length) === window.parseInt(element.attr('maxlength'))) {
						var $nextElement = element.next().next();
						if($nextElement.length) {
							$nextElement[0].focus();
						}
					}
				});
			}
		};
	})
  .controller('PersonEditDriverlicenseController', function ($scope, alertService, dialogService, personService,
    person, blockedLike, similar, account, driverlicenseService) {
    $scope.person = angular.copy(person);
    $scope.person.account = account;
    
    $scope.similar = _.map(similar, function(similar) {
      if(_.findWhere(similar.accounts, {iban: $scope.person.account.iban})) {
        similar.ibanmatch = $scope.person.account.iban;
      } else {
        similar.ibanmatch = false;
      }
      return similar;
    });

    $scope.blockedLike = _.map(blockedLike, function(blockedLike) {
      if(_.findWhere(blockedLike.accounts, {iban: $scope.person.account.iban})) {
        blockedLike.ibanmatch = $scope.person.account.iban;
      } else {
        blockedLike.ibanmatch = false;
      }
      return blockedLike;
    });

    function getMoment() {
      var value = window.parseInt($scope.driverLicenseDate1)+'-'+window.parseInt($scope.driverLicenseDate2)+'-'+window.parseInt($scope.driverLicenseDate3);
      var re = /\d{1,2}-\d{1,2}-\d{4}/;
      if(value.match(re)) {
        return window.moment(value, 'D-M-YYYY', true);
      }
      return null;
    }

    $scope.prefix = function(value) {
      if(value.length === 1) {
        value = '0'+value;
      }
      return value;
    };

    function parseDate() {
      if($scope.person.drivingLicenseValidUntil) {
        var moment = window.moment($scope.person.drivingLicenseValidUntil, 'YYYY-MM-DD HH:mm');
        $scope.driverLicenseDate1 = moment.format('DD');
        $scope.driverLicenseDate2 = moment.format('MM');
        $scope.driverLicenseDate3 = moment.format('YYYY');
      }
    }
    parseDate();

    $scope.notValidDate = function() {
      var moment = getMoment();
      if(moment) {
        if(moment.isBetween('1995-01-01', '2050-01-01')) {
          return !moment.isValid();
        }
      }
      return true;
    };

		$scope.moderateLicense = function (person, status, block) {
			var newProps;

			newProps = {};
      switch(status){
      case 'ok':
				newProps.driverLicenseStatus = 'ok';
        break;
      case 'nok':
				newProps.driverLicenseStatus = 'nok';
        break;
			}

			if ('block' === block) {
				newProps.status = 'blocked';
			}

      if ($scope.form.driverLicenseNumber.$dirty) {
        newProps.driverLicenseNumber = $scope.person.driverLicenseNumber || '';
      }

      if(getDriverLicenseDate()) {
        newProps.drivingLicenseValidUntil = getDriverLicenseDate();
      }

      if(newProps.status === 'blocked' && $scope.person.status === 'active') {
        dialogService.showModal({}, {
          closeButtonText: 'Cancel',
          actionButtonText: 'OK',
          headerText: 'Wijziging status',
          bodyText: 'Wil je de status van ' + $scope.person.firstName + ' wijzigen van ' + $scope.person.status + ' naar ' + newProps.status + '? LET OP: de ritten van ' + $scope.person.firstName + ' kunnen geannuleerd worden!'
        })
        .then(function(){
          $scope.alterPerson(newProps);
        });
      } else {
        $scope.alterPerson(newProps);
      }

		};

    $scope.alterPerson = function (newProps) {
      personService.alter({
        id: person.id, 
        newProps: newProps
      })
      .then(
        function(returnedPerson){
          $scope.person = returnedPerson;
          angular.extend(person, returnedPerson);
          parseDate();
          $scope.form.$setPristine();

          var msg = returnedPerson.driverLicenseStatus === 'ok' ? 'Rijbewijs goedgekeurd' : 'Rijbewijs niet goedgekeurd';
          if ('blocked' === returnedPerson.status){
            msg += ' en persoon geblokkeerd';
          }
          alertService.add('success', msg, 2000);
        },
        function (error) {
          var msg = error ? error.message : '';
          alertService.add('danger', 'Het wijzigen van het rijbewijs is mislukt: ' + msg, 4000);
      });
    };

    var images = {
      front: null,
      back: null
    };

    $scope.images = images;
    $scope.isBusy = false;

    angular.element('#licenseFrontFile').on('change', function (e) {
      $scope.$apply(function () {
        images.front = e.target.files[0];
      });
    });

    angular.element('#licenseBackFile').on('change', function (e) {
      $scope.$apply(function () {
        images.back = e.target.files[0];
      });
    });

    $scope.startUpload = function () {
      if (!images.front || !images.back) { return; }

      $scope.isBusy = true;
      alertService.load();

      driverlicenseService.upload({
        person: person.id,
        driverLicenseCountry: 'BE'
      }, {
        frontImage: images.front,
        backImage: images.back
      })
      .then(function (returnedPerson) {
        alertService.add('success', 'Bedankt voor het uploaden van het rijbewijs', 5000);
      })
      .catch(function (err) {
        alertService.addError(err);
      })
      .finally(function () {
        alertService.loaded();
        $scope.isBusy = false;
      });
    };

    function getDriverLicenseDate() {
      var moment = getMoment();
      if(moment && moment.isValid()) {
        return moment.format('YYYY-MM-DD');
      }
      return null;
    }

    $scope.saveDriverLicenseData = function () {
      var newProps = {
        driverLicenseNumber: $scope.person.driverLicenseNumber || '',
      };
      if(getDriverLicenseDate()) {
        newProps.drivingLicenseValidUntil = getDriverLicenseDate();
      }

      alertService.load();
      personService.alter({
        id: person.id,
        newProps: newProps
      })
      .then(function (returnedPerson) {
        $scope.person = returnedPerson;
        angular.extend(person, returnedPerson);
        parseDate();
        $scope.form.$setPristine();
        alertService.add('success', 'Rijbewijsgegevens opgeslagen.', 3000);
      })
      .catch(function (err) {
        alertService.add('danger', 'Foutmelding bij het opslaan van de rijbewijsgegevens: ', 4000);
      })
      .finally(function () {
        alertService.loaded();
      });
    };

	})
;
