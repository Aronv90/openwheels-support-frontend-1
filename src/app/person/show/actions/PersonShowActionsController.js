'use strict';

angular.module('openwheels.person.show.actions', [])

	.controller('PersonShowActionsController', function ($scope, person, actions, dialogService, alertService, actionsService, $filter) {
		$scope.actions = actions;

		$scope.removeAction = function (action) {
			var idx;
			idx = $scope.actions.indexOf(action);

			dialogService.showModal({}, {
				closeButtonText: 'Cancel',
				actionButtonText: 'OK',
				headerText: 'Are you sure?',
				bodyText: 'Do you really want to remove the "' + action.descriptor.name +'" action with id: ' + action.id
			})
				.then(function () {
					return actionsService.delete({action: action.id});
				}, function(){
					return false;
				})
				.then(function (response) {
					if(response){
						if(response.deleted){
							$scope.actions.splice(idx, 1);
							alertService.add('success', 'Action removed', 2000);
						}else{
							alertService.add('warning', 'Removing action failed', 2000);
						}
					}
				}, function (error) {
					alertService.add('danger', error.message, 5000);
				});
		};
	});
