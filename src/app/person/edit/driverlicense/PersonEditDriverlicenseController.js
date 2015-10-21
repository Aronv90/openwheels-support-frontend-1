'use strict';

angular.module('openwheels.person.edit.data.driverlicense', [])

  .controller('PersonEditDriverlicenseController', function ($scope, alertService, personService,  person, blockedLike) {
    $scope.person = angular.copy(person);
		$scope.blockedLike = blockedLike;

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

			personService.alter({id: person.id, newProps: newProps}).then(
        function(returnedPerson){
          $scope.person = returnedPerson;
          angular.extend(person, returnedPerson);
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

    $scope.saveDriverLicenseNumber = function () {
      alertService.load();
      personService.alter({
        id: person.id,
        newProps: {
          driverLicenseNumber: $scope.person.driverLicenseNumber || ''
        }
      })
      .then(function (returnedPerson) {
        $scope.person = returnedPerson;
        angular.extend(person, returnedPerson);
        $scope.form.$setPristine();
        alertService.add('success', 'Driver license number saved', 3000);
      })
      .catch(function (err) {
        alertService.add('danger', 'Error saving driver license number', 4000);
      })
      .finally(function () {
        alertService.loaded();
      });
    };

	})
;
