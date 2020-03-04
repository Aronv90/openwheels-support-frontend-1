'use strict';

angular.module('openwheels.phoneLog.history', [])

.controller('PhoneHistoryController', function ($log, $state, $stateParams, $scope, alertService, dialogService, telecomService, personService) {

    personService.get({person: 583599})
        .then(
            function(person){
                $scope.alertText = person.remark;
            });

    // Create a date object from the (optionally given) date
    $scope.sCurrentDate = $stateParams['sDate'];
    var oCurrentDate = ($scope.sCurrentDate) ? new Date($scope.sCurrentDate) : new Date();

    // Determine the date of the previous day

    var oPrevDay = new Date(oCurrentDate.getTime());
    oPrevDay.setDate(oCurrentDate.getDate()-1);
    $scope.sPrevDay = formatDate(oPrevDay);

    // Determine the date of the next day

    var oNextDay = new Date(oCurrentDate.getTime());
    oNextDay.setDate(oCurrentDate.getDate()+1);
    $scope.sNextDay = formatDate(oNextDay);

    // Get the calls with the current date and pass them to the scope. Give an error message if this is not possible.

    alertService.load();
    telecomService.getByDate({ sDate: $scope.sCurrentDate })
        .then (
            function (calls) {
                $scope.calls = calls;
            }
        )
        .catch (
            function (err) {
                alertService.addError(err);
            }
        )
        .finally (
            function () {
                alertService.loaded();
            }
        );

    function formatDate(oDate)
    {
        var sYear = oDate.getFullYear();
        var sMonth = ((oDate.getMonth()+1) < 10) ? '0'+(oDate.getMonth()+1) : oDate.getMonth()+1;
        var sDay = (oDate.getDate() < 10) ? '0'+oDate.getDate() : oDate.getDate();

        return sYear + '-' + sMonth + '-' + sDay;
    }
});
