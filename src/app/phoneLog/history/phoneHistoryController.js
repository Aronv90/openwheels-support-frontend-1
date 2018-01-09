'use strict';

angular.module('openwheels.phoneLog.history', [])

.controller('PhoneHistoryController', function ($log, $state, $stateParams, $scope, alertService, dialogService, telecomService) {

    $scope.sCurrentDate = $stateParams['sDate'];

    var oCurrentDate = new Date($scope.sCurrentDate);

    // Determine the date of the previous day
    var oPrevDay = oCurrentDate;
    oPrevDay.setDate(oCurrentDate.getDate()-1);
    var sPrevDay = formatDate(oPrevDay);

    // Set the date to the previous day
    $scope.previous = function() {

        // $scope.offset = $scope.curPage * $scope.perPage;
        // remarkService.forResource(_.extend({}, {resource: $scope.resource.id, limit: $scope.perPage, offset: $scope.offset }))
        //     .then(function(remarklog) {
        //         handleRemarkLog(remarklog);
        //         $scope.curPage = $scope.curPage + 1;
        //     });
    };

    // Get the calls with the current date and pass them to the scope. Give an error message if this is not possible.

    function loadCalls (sDate)
    {
        alertService.load();
        telecomService.getByDate({ sDate: sDate })
            .then
            (
                function (calls)
                {
                    $scope.calls = calls;
                }
            )
            .catch
            (
                function (err)
                {
                    alertService.addError(err);
                }
            )
            .finally
            (
                function ()
                {
                    alertService.loaded();
                }
            );

        function formatDate(oDate)
        {
            var sYear = oDate.getFullYear();
            var sMonth = oDate.getMonth();
            var sDay = oDate.getDate();

            if(sDay < 10) sDay = '0'+sDay;
            if(sMonth < 10) sDay = '0'+sMonth;

            return sYear + '-' + sMonth + '-' + sDay;
        }
    }


});
