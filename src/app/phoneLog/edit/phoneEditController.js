'use strict';

angular.module('openwheels.phoneLog.edit', [])

.controller('PhoneEditController', function ($scope, alertService, telecomService, $stateParams) {

    $scope.iCall = $stateParams['iCall'];

    $scope.oCall = telecomService.getCall($scope.iCall);

    $scope.saveRemark = function() {
        telecomService.saveRemark($scope.iCall, $scope.sRemark);
    };

});
