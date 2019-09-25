'use strict';

angular.module('openwheels.resource.show.device-event-log', [])

    .controller('ResourceShowDeviceEventLogController', function ($scope, $log, $filter, $stateParams, deviceService, resource, eventLog, perPage, start, end) {

        $scope.curPage = 1;
        $scope.perPage = perPage;
        $scope.offset = 0;
        $scope.resource = resource;
        $scope.obj = {
            start: start,
            end: end
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

        handleEventLogs(eventLog);
        function handleEventLogs(eventLog) {
            $scope.eventLog = eventLog.result;
            $scope.lastPage = Math.ceil(eventLog.total / $scope.perPage);
        }

        $scope.nextPage = function () {
            $scope.offset = $scope.curPage * $scope.perPage;
            deviceService.eventLog(_.extend({}, {
                resource: $scope.resource.id,
                start: moment($scope.obj.start).format("YYYY-MM-DD 00:00"),
                end: moment($scope.obj.end).format("YYYY-MM-DD 23:59"),
                limit: $scope.perPage,
                offset: $scope.offset
            }))
                .then(function (eventLog) {
                    handleEventLogs(eventLog);
                    $scope.curPage = $scope.curPage + 1;
                });
        };

        $scope.prevPage = function () {
            $scope.offset = ($scope.curPage - 2) * $scope.perPage;
            deviceService.eventLog(_.extend({}, {
                resource: $scope.resource.id,
                start: moment($scope.obj.start).format("YYYY-MM-DD 00:00"),
                end: moment($scope.obj.end).format("YYYY-MM-DD 23:59"),
                limit: $scope.perPage,
                offset: $scope.offset
            }))
                .then(function (eventLog) {
                    handleEventLogs(eventLog);
                    $scope.curPage = $scope.curPage - 1;
                });
        };

        $scope.refresh = function () {
            deviceService.eventLog(_.extend({}, {
                resource: $scope.resource.id,
                start: moment($scope.obj.start).format("YYYY-MM-DD 00:00"),
                end: moment($scope.obj.end).format("YYYY-MM-DD 23:59"),
                limit: $scope.perPage,
                offset: $scope.offset
            }))
                .then(function (eventLog) {
                    handleEventLogs(eventLog);
                });
        };
    });
