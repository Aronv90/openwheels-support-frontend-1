'use strict';

angular.module('openwheels.invoice2.fine.list', [])

.controller('FineListController', function ($scope, $log, $filter, $stateParams, fineLog, fineService, perPage, $uibModal, $state) {
    $scope.curPage = 1;
    $scope.perPage = perPage;
    $scope.offset = 0;
    $scope.obj = {
        start: null,
        end: null,
        person: null,
        resource: null
    };

    $scope.dateConfig = {
        //model
        modelFormat: 'YYYY-MM-DD',
        formatSubmit: 'yyyy-mm-dd',

        //view
        viewFormat: 'DD-MM-YYYY',
        format: 'dd-mm-yyyy',

        //options
        selectMonths: true
    };

    handleLogs(fineLog);
    function handleLogs(fineLog) {
        $scope.fineLog = fineLog.results;
        $scope.lastPage = Math.ceil(fineLog.total / $scope.perPage);
    }

    $scope.nextPage = function () {
        $scope.offset = $scope.curPage * $scope.perPage;
        fineService.search(_.extend({}, {
            person: $scope.obj.person !== null ? $scope.obj.person  : null,
            resource: $scope.obj.resource !== null ? $scope.obj.resource : null,
            start: $scope.obj.start !== null ? moment($scope.obj.start).format("YYYY-MM-DD 00:00") : null,
            end: $scope.obj.end !== null ? moment($scope.obj.end).format("YYYY-MM-DD 23:59") : null,
            limit: $scope.perPage,
            offset: $scope.offset
        }))
            .then(function (fineLog) {
                handleLogs(fineLog);
                $scope.curPage = $scope.curPage + 1;
            });
    };

    $scope.prevPage = function () {
        $scope.offset = ($scope.curPage - 2) * $scope.perPage;
        fineService.search(_.extend({}, {
            person: $scope.obj.person !== null ? $scope.obj.person  : null,
            resource: $scope.obj.resource !== null ? $scope.obj.resource : null,
            start: $scope.obj.start !== null ? moment($scope.obj.start).format("YYYY-MM-DD 00:00") : null,
            end: $scope.obj.end !== null ? moment($scope.obj.end).format("YYYY-MM-DD 23:59") : null,
            limit: $scope.perPage,
            offset: $scope.offset
        }))
            .then(function (fineLog) {
                handleLogs(fineLog);
                $scope.curPage = $scope.curPage - 1;
            });
    };

    $scope.refresh = function () {
        fineService.search(_.extend({}, {
            person: $scope.obj.person !== null ? $scope.obj.person : null,
            resource: $scope.obj.resource !== null ? $scope.obj.resource : null,
            start: $scope.obj.start !== null ? moment($scope.obj.start).format("YYYY-MM-DD 00:00") : null,
            end: $scope.obj.end !== null ? moment($scope.obj.end).format("YYYY-MM-DD 23:59") : null,
            limit: $scope.perPage,
            offset: $scope.offset
        }))
            .then(function (fineLog) {
                handleLogs(fineLog);
            });
    };

    $scope.viewLog = function (fineLog) {
        $uibModal.open({
            templateUrl: 'invoice2/fine/view/fine-view.tpl.html',
            windowClass: 'modal--xl',
            controller: 'FineViewController',
            resolve: {
                fineLog: function () {
                    return fineLog;
                }
            }
        });
    };

    $scope.goToCreatePage = function () {
        $state.go('root.invoice2.fine.create');
    };
});
