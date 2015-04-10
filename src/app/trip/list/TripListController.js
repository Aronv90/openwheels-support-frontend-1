'use strict';

angular.module('openwheels.trip.list', [])

	.controller('TripListController', function ($log, $scope, $filter, $compile, bookings, bookingService, alertService, $state, $stateParams) {
		var todayTimeframe = {
			startDate: moment().subtract('months', 1).format('YYYY-MM-DD'),
			endDate: moment().add('months', 1).format('YYYY-MM-DD')
		};
		$scope.bookings = bookings;
		$scope.currentTimeFrame = {
			startDate: $stateParams.startDate || todayTimeframe.startDate,
			endDate: $stateParams.endDate || todayTimeframe.endDate
		};

    var providerOptions = (function () {
      var ids = [];
      bookings.forEach(function (booking) {
        if (ids.indexOf(booking.person.providerId) < 0) {
          ids.push(booking.person.providerId);
        }
      });
      ids.sort();
      return ids.map(function (id) {
        return { label: 'Provider ' + id, providerId: id };
      });
    }());

    /**
     * Filters applicable to any booking list
     */
    var filterOptions = $scope.filterOptions = [
      {
        label: 'Show all',
        filter: function (bookings) {
          return bookings;
        }
      },
      {
        label: 'Select by provider...',
        selectFrom: providerOptions,
        filter: function (bookings, option) {
          if (!option) {
            return bookings;
          }
          return bookings.filter(function (booking) {
            return booking.person.providerId === option.providerId;
          });
        }
      },
      {
        label: 'In progress',
        filter: function (bookings) {
          var now = moment();
          return bookings.filter(function (booking) {
            return !( moment(booking.endBooking).isBefore(now) || moment(booking.beginBooking).isAfter(now) );
          });
        }
      },
      {
        label: 'In progress or yet to be started',
        filter: function (bookings) {
          var now = moment();
          return bookings.filter(function (booking) {
            return !moment(booking.endBooking).isBefore(now);
          });
        }
      },
      {
        label: 'Starting within the next two weeks',
        filter: function (bookings) {
          var now = moment();
          var today = moment().startOf('day');
          return bookings.filter(function (booking) {
            return moment(booking.beginBooking).isAfter(now) && moment(booking.beginBooking).isBefore(today.add(14, 'days'));
          });
        }
      }
    ];

    /**
     * Currently selected filter
     */
    $scope.activeFilterOption = filterOptions[0];

    /**
     * Perform filtering
     */
    $scope.performFilter = function () {
      var activeFilterOption = $scope.activeFilterOption;
      $log.debug('Filtering ' + (activeFilterOption.label));
      $scope.bookings = activeFilterOption.filter(bookings, activeFilterOption.option);
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
