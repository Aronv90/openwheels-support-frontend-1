'use strict';

angular.module('openwheels.resource.show.device-card-request-log', [])

    .controller('ResourceShowDeviceCardRequestLogController', function ($scope, $log, $filter, $stateParams, deviceService, deviceLogService, resource, cardRequestLog, perPage) {

        $scope.curPage = 1;
        $scope.perPage = perPage;
        $scope.offset = 0;
        $scope.resource = resource;
        $scope.currentLocation = {};

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

        handleCardRequestLog(cardRequestLog);
        function handleCardRequestLog(cardRequestLog) {
            $scope.cardRequest = cardRequestLog.result;
            $scope.lastPage = Math.ceil(cardRequestLog.total / $scope.perPage);
        }

        $scope.nextPage = function () {
            $scope.offset = $scope.curPage * $scope.perPage;
            deviceLogService.cardRequest(_.extend({}, {
                resource: $scope.resource.id,
                limit: $scope.perPage,
                offset: $scope.offset
            }))
                .then(function (cardRequestLog) {
                    handleCardRequestLog(cardRequestLog);
                    $scope.curPage = $scope.curPage + 1;
                });
        };

        $scope.prevPage = function () {
            $scope.offset = ($scope.curPage - 2) * $scope.perPage;
            deviceLogService.cardRequest(_.extend({}, {
                resource: $scope.resource.id,
                limit: $scope.perPage,
                offset: $scope.offset
            }))
                .then(function (cardRequestLog) {
                    handleCardRequestLog(cardRequestLog);
                    $scope.curPage = $scope.curPage - 1;
                });
        };

        $scope.refresh = function () {
            deviceLogService.cardRequest(_.extend({}, {
                resource: $scope.resource.id,
                limit: $scope.perPage,
                offset: $scope.offset
            }))
                .then(function (cardRequestLog) {
                    handleCardRequestLog(cardRequestLog);
                });
        };
    });
