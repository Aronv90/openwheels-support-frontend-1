'use strict';

angular.module('openwheels.invoice2.fine.preview', [])

.controller('FinePreviewController', function ($scope, $uibModalInstance, $sce, preview, attachments) {
    $scope.preview = preview;
    $scope.attachments = attachments;
    $scope.dismiss = function () {
        $uibModalInstance.dismiss();
    };

    $scope.renderHtml = function(html_code) {
        return $sce.trustAsHtml(html_code);
    };
});
