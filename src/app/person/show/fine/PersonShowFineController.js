'use strict';

angular.module('openwheels.person.show.fine', [])

.controller('PersonShowFineController', function ($scope, $log, $filter, $stateParams, fineLog, fineService, person, perPage, $uibModal, $state) {
    $scope.curPage = 1;
    $scope.perPage = perPage;
    $scope.offset = 0;
    $scope.person = person;
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
            person: $scope.person.id,
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
            person: $scope.person.id,
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
            person: $scope.person.id,
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
