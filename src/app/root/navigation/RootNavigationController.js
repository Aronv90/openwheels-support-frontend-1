'use strict';

angular.module('openwheels.root.navigation', [])

	.controller('RootNavigationController', function (
    $scope,
    $rootScope,
    $state,
    $stateParams,
    $filter,
    personService,
    resourceService,
    authService,
    checklistService,
    localStorageService
  ) {

    checklistService.all().then(function (data) {
      $scope.checklists = data;
    });
		/**
		 * Typeahead Person
		 */
		$scope.selectedPerson = undefined;
		$scope.searchPersons = function ($viewValue) {
			return personService.search({
				search: $viewValue
			});
		};

		$scope.selectPerson = function () {
			var personId = $scope.selectedPerson.id;
			$scope.selectedPerson = undefined;
			$state.go('root.person.show.trip', {personId: personId});
		};

		$scope.formatPerson = function ($model) {
			var inputLabel = '';
			if ($model) {
				inputLabel = $filter('fullname')($model) + ' [' + $model.id + ']';
			}
			return inputLabel;
		};


    $scope.previousDashboard = localStorageService.get('dashboard.last_trips');
    $scope.$on('LocalStorageModule.notification.setitem', function(event, data)  {
      if(data.key === 'dashboard.last_trips') {
        $scope.previousDashboard = localStorageService.get('dashboard.last_trips');
      }
    });


		/**
		 * Typeahead Resource
		 */
		$scope.selectedResource = undefined;
		$scope.searchResources = function ($viewValue) {
			return resourceService.select({
				search: $viewValue
			});
		};

		$scope.selectResource = function () {
			var resourceId = $scope.selectedResource.id;
			$scope.selectedResource = undefined;
			$state.go('root.resource.show.summary', {resourceId: resourceId});
		};

		$scope.formatResource = function ($model) {
			var inputLabel = '';
			if ($model) {
				inputLabel = '[' + $model.id + ']' + ' ' + $model.alias;
			}
			return inputLabel;
		};

		$scope.user = authService.user;

		$scope.logIn = function () {
			authService.loginPopup().then(function () {
				if ($state.current.name === 'home') {
					$state.go('root');
				}

			});
		};

		$scope.logOut = function () {
			authService.logoutRedirect();
		};

		/* Dates for invoicegroups */
		$scope.twoWeeksAgo = moment().subtract(2, 'week').format('YYYY-MM-DD');

		//$scope.printBills = function printBills() {
		//	invoiceService.printLast().then(
		//		function (result) {
		//
		//		},
		//		function (error) {
		//
		//		}
		//	);
		//};

		/* prevent dropdown from closing when clicking on a form field inside the dropdown */
		$scope.stopPropagation = function ($event) {
			$event.stopPropagation();
		};

		$scope.tripId = '';
		$scope.invoiceGroupId = '';

		$scope.followTripId = function (tripId) {
			if (tripId) {
				$state.go('root.trip.show.summary', { tripId: tripId });
        angular.element('#triproot').removeClass('open');
        $scope.tripId = '';
			} else {
				$state.go('root');
			}
		};
		$scope.followInvoiceGroupId = function (id) {
			if (id) {
				$state.go('root.invoice2.invoiceGroup.show', { invoiceGroupId: id });
        angular.element('#invoiceroot').removeClass('open');
        $scope.invoiceGroupId = '';
			}
		};
	})

;
