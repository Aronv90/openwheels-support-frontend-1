'use strict';

angular.module('openwheels.provider.create', [])

  .controller('ProviderCreateController', function ($scope, providerInfoService, alertService, $state) {

    $scope.providerInfo = {};

    $scope.extraInfoSchema = {
      type: 'object',
      description: 'Provider info',
      properties: [
        {
          type: 'string',
          description: '[string] Telefoonnummer',
          key: 'emergencyNumber',
          required: true,
        },
        {
          type: 'string',
          description: '[string/markdown] Welkomsttekst, voor de person details flow.',
          key: 'welcomeText',
          required: true,
        },
        {
          type: 'string',
          key: 'logo',
          description: '[string/url] URL van een logo',
          required: false,
        },
        {
          type: 'string',
          key: 'helpText',
          description: '[string/markdown] Hulptekst, wordt getoond bij reverseringen, etc.',
          required: true,
        },
        {
          type: 'object',
          key: 'personProfileBlacklist',
          description: 'Deze "persoonseigenschappen" zijn niet vereist en worden niet getoond in de flow en elders in het MyWheels interface.',
          properties: [
            {
              type: 'boolean',
              key: 'gender',
              defaultValue: false,
            },
            {
              type: 'boolean',
              key: 'driverLicense',
              defaultValue: false,
            },
            {
              type: 'boolean',
              key: 'dateOfBirth',
              defaultValue: false,
            },
            {
              type: 'boolean',
              key: 'address',
              defaultValue: false,
            },
            {
              type: 'boolean',
              key: 'social',
              defaultValue: false,
            },
          ],
        },
      ],
    };
    $scope.providerInfo.extraInfo = JSON.stringify({
      'emergencyNumber': '+31 6 1234 5678',
      'welcomeText': 'Een welkomsttekstje',
      'logo': 'https://mywheels.nl/branding/img/logo.png',
      'helpText': 'Een helptekstje',
      'personProfileBlacklist': {
        'gender': false,
        'driverLicense': false,
        'dateOfBirth': false,
        'address': false,
        'social': false,
      }
    }, null, 2);

    // default pre filled form to manage properties easily
    $scope.providerInfo.clientIds = '1,3,4';

    $scope.providerInfo.provider = {};
    $scope.providerInfo.provider.email = 'support@mywheels.nl';
    $scope.providerInfo.provider.url = 'openwheels.nl/,mywheels.nl/,test.openwheels.nl/';
    $scope.providerInfo.provider.canBookAllowedStatus = 'active';

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
      $scope.providerInfo.provider.canBookAllowedStatus = $scope.providerInfo.provider.canBookAllowedStatus.split(',');

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
