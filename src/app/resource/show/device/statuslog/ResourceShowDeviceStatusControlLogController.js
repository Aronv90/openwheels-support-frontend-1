'use strict';

angular.module('openwheels.resource.show.device-status-control-log', [])

    .controller('ResourceShowDeviceStatusControlLogController', function ($scope, $log, $filter, $stateParams, deviceService,
        resource, statusLog, perPage, start, end) {

        $scope.curPage = 1;
        $scope.perPage = perPage;
        $scope.offset = 0;
        $scope.resource = resource;
        $scope.obj = {
            start: start,
            end: end
        };
        $scope.currentLocation = {};

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
        $scope.getCurrentLocation = function() {
            $scope.gettingLocation = true;
            $scope.locationError = false;
            deviceService.location({
                resource: resource.id
            })
            .then(function(location) {
                $scope.currentLocation = angular.copy(location);
            })
            .catch(function(error){
                $scope.locationError = true;
            })
            .finally(function(){
                $scope.gettingLocation = false;
            });
        };

        handleStatusLogs(statusLog);
        function handleStatusLogs(statusLog) {
            $scope.statusLog = statusLog.result;
            $scope.lastPage = Math.ceil(statusLog.total / $scope.perPage);
        }

        $scope.nextPage = function () {
            $scope.offset = $scope.curPage * $scope.perPage;
            deviceService.statusControlLog(_.extend({}, {
                resource: $scope.resource.id,
                start: moment($scope.obj.start).format("YYYY-MM-DD 00:00"),
                end: moment($scope.obj.end).format("YYYY-MM-DD 23:59"),
                limit: $scope.perPage,
                offset: $scope.offset
            }))
                .then(function (statusLog) {
                    handleStatusLogs(statusLog);
                    $scope.curPage = $scope.curPage + 1;
                });
        };

        $scope.prevPage = function () {
            $scope.offset = ($scope.curPage - 2) * $scope.perPage;
            deviceService.statusControlLog(_.extend({}, {
                resource: $scope.resource.id,
                start: moment($scope.obj.start).format("YYYY-MM-DD 00:00"),
                end: moment($scope.obj.end).format("YYYY-MM-DD 23:59"),
                limit: $scope.perPage,
                offset: $scope.offset
            }))
                .then(function (statusLog) {
                    handleStatusLogs(statusLog);
                    $scope.curPage = $scope.curPage - 1;
                });
        };

        $scope.refresh = function () {
            deviceService.statusControlLog(_.extend({}, {
                resource: $scope.resource.id,
                start: moment($scope.obj.start).format("YYYY-MM-DD 00:00"),
                end: moment($scope.obj.end).format("YYYY-MM-DD 23:59"),
                limit: $scope.perPage,
                offset: $scope.offset
            }))
                .then(function (statusLog) {
                    handleStatusLogs(statusLog);
                });
        };
    });
