'use strict';

angular.module('openwheels.person.show.actions', [])

	.controller('PersonShowActionsController', function ($scope, person, actions, dialogService, alertService, actionsService, $filter) {
		$scope.actions = actions;

		$scope.removeAction = function (action) {
			var idx;
			idx = $scope.actions.indexOf(action);

			dialogService.showModal({}, {
				closeButtonText: 'Annuleer',
				actionButtonText: 'Ja',
				headerText: 'Bevestiging',
				bodyText: 'Wil je de actie "' + action.descriptor.name +'" met id ' + action.id + ' verwijderen?'
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
							alertService.add('success', 'De actie is verwijderd.', 2000);
						}else{
							alertService.add('warning', 'Het verwijderen van de actie is mislukt.', 2000);
						}
					}
				}, function (error) {
					alertService.add('danger', error.message, 5000);
				});
		};
	});
