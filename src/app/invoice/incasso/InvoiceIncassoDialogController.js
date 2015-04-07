'use strict';

angular.module('openwheels.invoice.incasso', [])

.controller('InvoiceIncassoDialogController', function ($scope, $modalInstance, incassoService, alertService, incassoOptions) {
  var dateConfig = {
    //model
    modelFormat: 'YYYY-MM-DD HH:mm',
    formatSubmit: 'yyyy-mm-dd',

    //view
    viewFormat: 'DD-MM-YYYY',
    format: 'dd-mm-yyyy',

    //options
    selectMonths: true,
    container: 'body'
  };

  var createIncasso = function(params) {
    return incassoService.createIncasso(params)
    .then( function() {
      alertService.add('success', 'Created Incasso', 2000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };

  var createStorting = function(params) {
    return incassoService.createStorting(params)
    .then( function() {
      alertService.add('success', 'Created storting', 2000);
    }, function(error) {
      alertService.add('danger', error.message, 5000);
    });
  };

  $scope.incassoOptions = incassoOptions;
  $scope.params = {};
  $scope.passDateConfig = {
    min: true,
  };
  $scope.saldoDateConfig = {
    max: true,
  };

  angular.extend($scope.saldoDateConfig, dateConfig);
  angular.extend($scope.passDateConfig, dateConfig);



  $scope.dismiss = function () {
    $modalInstance.dismiss();
  };

  $scope.save = function (params) {
    if(incassoOptions.storting) {
      createStorting(params);
    } else {
      createIncasso(params);
    }
  };

})

;
