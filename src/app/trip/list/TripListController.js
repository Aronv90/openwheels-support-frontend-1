'use strict';

angular.module('openwheels.trip.list', [])

	.controller('TripListController', function ($scope, $filter, $compile, bookings, bookingService, alertService, $state, $stateParams) {
		var todayTimeframe = {
			startDate: moment().subtract('months', 1).format('YYYY-MM-DD'),
			endDate: moment().add('months', 1).format('YYYY-MM-DD')
		};
		$scope.bookings = bookings;
		$scope.currentTimeFrame = {
			startDate: $stateParams.startDate || todayTimeframe.startDate,
			endDate: $stateParams.endDate || todayTimeframe.endDate
		};

		$scope.previous = function () {
			$state.go($state.current.name, {
				startDate: moment($scope.currentTimeFrame.startDate).subtract('months', 2).format('YYYY-MM-DD'),
				endDate: moment($scope.currentTimeFrame.endDate).subtract('months', 2).format('YYYY-MM-DD')
			});
		};


		$scope.next = function () {
			$state.go($state.current.name, {
				startDate: moment($scope.currentTimeFrame.startDate).add('months', 2).format('YYYY-MM-DD'),
				endDate: moment($scope.currentTimeFrame.endDate).add('months', 2).format('YYYY-MM-DD')
			});
		};

		$scope.reset = function () {
			$state.go($state.current.name, {
				startDate: undefined,
				endDate: undefined
			});
		};

		$scope.momentDiff = function (begin, end) {
			var diff = moment(begin).diff(moment(end));
			if (isNaN(diff)) {
				return '-';
			}
			return moment.duration(diff).humanize();
		};

		$scope.showAll = function showAll() {
			$state.go($state.current.name, {
				startDate: '2000-01-01',
				endDate: '2099-12-31'
			});
		};

		$scope.checked = function checked(booking) {
			bookingService.checked({booking: booking.id})
				.then(
				function (returnedBooking) {
					booking.checked = returnedBooking.checked;
				}
			);
		};

	});