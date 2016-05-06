'use strict';

angular.module('openwheels.person.show.payouts', [])
.controller('PersonShowPayoutsController', function ($scope, payouts) {
  $scope.payouts = payouts;
});