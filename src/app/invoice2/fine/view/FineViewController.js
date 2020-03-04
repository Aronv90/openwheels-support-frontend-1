'use strict';

angular.module('openwheels.invoice2.fine.view', [])

.controller('FineViewController', function ($scope, $uibModalInstance, $sce, fineLog, settingsService) {
    $scope.fineLog = fineLog;
    $scope.url = settingsService.settings.server + '/' + 'mw-docs-storage';
    $scope.dismiss = function () {
        $uibModalInstance.dismiss();
    };
});
