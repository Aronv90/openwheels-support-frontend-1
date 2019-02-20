'use strict';

angular.module('openwheels.subscription.create', [])

  .controller('SubscriptionCreateController', function ($scope, subscriptionService, resourceService, alertService, $state) {

    $scope.subscription = {};
    $scope.params = {};
    $scope.isSaving = false;

    $scope.typeOptions = [
      { label: 'MyWheels Open', value: 'subscription_open' },
      { label: 'MyWheels Business', value: 'subscription_business' },
      { label: 'MyWheels Resource', value: 'subscription_resource' },
      { label: 'MyWheels Platform', value: 'subscription_platform' },
      { label: 'MyWheels VGA', value: 'subscription_vga' }
    ];

    $scope.intervalOptions = [
      { label: 'Eerste dag van de volgende maand', value: 'first day of next month' },
      { label: 'Laatste dag van de volgende maand', value: 'last day of next month' },
      { label: 'Eerste dag van de volgende jaar', value: 'first day of next year' },
      { label: 'Laatste dag van de volgende jaar', value: 'last day of next year' },
      { label: 'Volgende week', value: '+1 week' },
      { label: 'Over 4 week', value: '+4 week' },
      { label: 'Over 3 maanden', value: '+3 months' },
      { label: 'Over 6 maanden', value: '+6 months' },
      { label: 'Over 9 maanden', value: '+9 months' },
      { label: 'Over 1 jaar', value: '+1 year' }
    ];

    /**
     * Typeahead Resource
     */
    $scope.searchResources = function ($viewValue) {
      return resourceService.select({
        search: $viewValue
      });
    };

    $scope.formatResource = function ($model) {
      var inputLabel = '';
      if ($model) {
        inputLabel = '[' + $model.id + ']' + ' ' + $model.alias;
      }
      return inputLabel;
    };

    $scope.isSaveDisabled = function () {
      return $scope.subscriptionDataForm.$invalid || $scope.isSaving;
    };

    $scope.save = function () {

      $scope.isSaving = true;

      subscriptionService.create({
        sender: $scope.params.sender.id,
        recipient: $scope.params.recipient.id,
        resource: $scope.params.resource.id,
        newProps: $scope.subscription
      }).then(function () {
        alertService.add('success', 'Subscription has been successfully added!', 4000);
      }, function(error) {
        $scope.isSaving = false;
        alertService.add('danger', error.message, 5000);
      });
    };

    $scope.subscriptionDateConfig = {
      //model
      modelFormat: 'YYYY-MM-DD',
      formatSubmit: 'yyyy-mm-dd',

      //view
      viewFormat: 'DD-MM-YYYY',
      format: 'dd-mm-yyyy',

      //options
      selectMonths: true
    };

    $scope.goToListPage = function () {
      $state.go('root.subscription.list');
    };

  });
