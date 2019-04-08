'use strict';

angular.module('openwheels.provider.create', [])

  .controller('ProviderCreateController', function ($scope, providerInfoService, alertService, $state) {

    $scope.providerInfo = {};

    // default pre filled form to manage properties easily
    $scope.providerInfo.clientIds = '1,3,4';

    $scope.providerInfo.provider = {};
    $scope.providerInfo.provider.url = 'openwheels.nl/,mywheels.nl/,test.openwheels.nl/';

    $scope.providerInfo.contract = {};
    $scope.providerInfo.contract.bookingFee = 0.00;
    $scope.providerInfo.contract.dayFee = 0.00;
    $scope.providerInfo.contract.subscriptionFee = 0.00;
    $scope.providerInfo.contract.invoiceGenerationStrategyName = 'mywheels_free_plus';
    $scope.providerInfo.contract.bookingAlterationStrategyName = 'mywheels_free_plus';
    $scope.providerInfo.contract.creditStrategyName = 'noop';
    $scope.providerInfo.contract.ownRiskWaiver = 'not';
    $scope.providerInfo.contract.maxDrivers = 9999;

    $scope.isSaving = false;

    $scope.isSaveDisabled = function () {
      return $scope.providerInfoDataForm.$invalid || $scope.isSaving;
    };
    
    $scope.save = function () {
      $scope.isSaving = true;

      var clientIds = $scope.providerInfo.clientIds.split(',').map(Number);
      $scope.providerInfo.provider.url = $scope.providerInfo.provider.url.split(',');

      providerInfoService.create({
        name: $scope.providerInfo.name,
        person: $scope.providerInfo.person.id,
        provider: $scope.providerInfo.provider,
        contractType: $scope.providerInfo.contract,
        clientIds: clientIds
      }).then(function () {
        alertService.add('success', 'Provider has been successfully added!', 4000);
      }, function(error) {
        $scope.isSaving = false;
        alertService.add('danger', error.message, 5000);
      });
    };

    $scope.goToListPage = function () {
      $state.go('root.provider.list');
    };

  });
