'use strict';

angular.module('openwheels.subscription.create', [])

  .controller('SubscriptionCreateController', function ($scope, subscriptionService, resourceService, alertService, $state) {

    $scope.subscription = {};
    $scope.params = {};
    $scope.isSaving = false;

    $scope.typeOptions = [
      { label: 'MyWheels Open', value: 'subscription_open' },
      { label: 'MyWheels Business', value: 'subscription_business' },
      { label: 'MyWheels Resource', value: 'subscription_resource' }
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
