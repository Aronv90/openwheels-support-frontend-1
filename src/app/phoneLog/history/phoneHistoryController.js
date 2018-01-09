'use strict';

angular.module('openwheels.phoneLog.history', [])

.controller('PhoneHistoryController', function ($log, $state, $stateParams, $scope, alertService, dialogService, telecomService) {

    $scope.sCurrentDate = $stateParams['sDate'];

    var oCurrentDate = new Date($scope.sCurrentDate);

    // Determine the date of the previous day

    var oPrevDay = oCurrentDate;
    oPrevDay.setDate(oCurrentDate.getDate()-1);
    $scope.sPrevDay = formatDate(oPrevDay);

    // Determine the date of the next day

    var oNextDay = oCurrentDate;
    oNextDay.setDate(oCurrentDate.getDate()+1);
    $scope.sNextDay = formatDate(oNextDay);

    // Get the calls with the current date and pass them to the scope. Give an error message if this is not possible.

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
});
