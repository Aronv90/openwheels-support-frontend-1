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
  .controller('PersonEditDriverlicenseController', function ($scope, alertService, personService,  person, blockedLike, similar, account) {
    $scope.person = angular.copy(person);
    $scope.person.account = account;
		$scope.blockedLike = blockedLike;
		$scope.similar = _.map(similar, function(similar) {
      if(_.findWhere(similar.accounts, {iban: $scope.person.account.iban})) {
        similar.ibanmatch = $scope.person.account.iban;
      } else {
        similar.ibanmatch = false;
      }
      return similar;
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

			personService.alter({id: person.id, newProps: newProps}).then(
        function(returnedPerson){
          $scope.person = returnedPerson;
          angular.extend(person, returnedPerson);
          parseDate();
          $scope.form.$setPristine();

          var msg = returnedPerson.driverLicenseStatus === 'ok' ? 'Driver license approved' : 'Driver license dismissed';
          if ('blocked' === returnedPerson.status){
            msg += ' and person blocked';
					}
					alertService.add('success', msg, 2000);
				},
				function (error) {
          var msg = error ? error.message : '';
          alertService.add('danger', 'Moderating license failed: ' + msg, 4000);
				});
		};

    var images = {
      front: null
    };

    $scope.images = images;
    $scope.isBusy = false;

    angular.element('#licenseFrontFile').on('change', function (e) {
      $scope.$apply(function () {
        images.front = e.target.files[0];
      });
    });

    $scope.startUpload = function () {
      if (!images.front) { return; }

      $scope.isBusy = true;
      alertService.load();

      console.log(images.front);

      personService.addLicenseImages({
        person: person.id
      }, {
        frontImage: images.front
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
        alertService.add('success', 'Driver license data saved', 3000);
      })
      .catch(function (err) {
        alertService.add('danger', 'Error saving driver license data', 4000);
      })
      .finally(function () {
        alertService.loaded();
      });
    };

	})
;
