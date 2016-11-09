'use strict';

angular.module('openwheels.mailer.list', [])

	.controller('MailerListController', function ($scope, $filter, conversations, $uibModal, conversationService, ngTableParams) {

		$scope.$watch('filter.$', function () {
			$scope.tableParams.reload();
		});

		$scope.tableParams = new ngTableParams({
				page: 1,            // show first page
				count: 25,          // count per page
				sorting: {
					created: 'desc'     // initial sorting
				}
			},
			{
				total: conversations.length, // length of data
				getData: function ($defer, params) {
					// use build-in angular filter
					var filteredData = $filter('filter')(conversations, $scope.filter);
					var orderedData = params.sorting() ?
						$filter('orderBy')(filteredData, params.orderBy()) :
						filteredData;
					var slicedData = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

					angular.forEach(slicedData, function (value, key) {
						slicedData[key].total = parseFloat(value.total);
					});

					$scope.conversations = slicedData;

					params.total(orderedData.length); // set total for recalc pagination
				}
			}
		);

		$scope.showMessage = function (conversation) {
			conversationService.getSingle({conversation: conversation.id})
				.then(function (fullConversation) {
					$uibModal.open({
							windowClass: 'modal--xl',
							template: '<div class="modal-content">' +
											'<iframe width="750px" height="800px" iframe-contents="conversation.message"></iframe>' +
										 '</div>',
							controller: function ($scope, conversation) {
								$scope.conversation = conversation;
							},
							resolve: {
								conversation: function () {
									return fullConversation;
								}
							}
						}
					);
				});
		};
	});
