'use strict';

angular.module('openwheels.phoneLog.edit', [])

.controller('PhoneEditController', function ($scope, alertService, telecomService, $stateParams) {

    $scope.iCall = $stateParams['iCall'];

    telecomService.getCall({ iCall: $scope.iCall })
        .then ( function (call) {
            $scope.sRemark = call.remark;
        });

    $scope.saveRemark = function() {
        telecomService.saveRemark({ iCall: $scope.iCall, sRemark: $scope.sRemark })
            .then(function (call) {
                alertService.add('success', 'Call edited', 3000);
                window.history.back();
            }, function(error) {
                alertService.add('danger', error.message, 5000);
            });

    };




});
