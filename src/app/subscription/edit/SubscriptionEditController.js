'use strict';

angular.module('openwheels.subscription.edit', [])

  .controller('SubscriptionEditController', function ($scope, subscription, subscriptionService, resourceService, alertService, $state) {


    if(subscription === null) {
      $state.go('root.subscription.create');
    }
    var masterCopy = angular.copy(subscription);
    $scope.subscription = subscription;

    $scope.typeOptions = [
      { label: 'MyWheels Open', value: 'subscription_open' },
      { label: 'MyWheels Business', value: 'subscription_business' },
      { label: 'MyWheels Parking Permit', value: 'subscription_parking_permit' },
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

    $scope.selectedOption = $scope.subscription.type;

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
      return $scope.subscriptionDataForm.$invalid || angular.equals(masterCopy, $scope.subscription);
    };

    $scope.save = function () {
      var newProps = difference(masterCopy, $scope.subscription);

      subscriptionService.update({
        subscription: subscription.id,
        newProps: newProps
      }).then(function () {
        masterCopy = angular.copy(subscription);
        alertService.add('success', 'Subscription has been successfully edit!', 4000);
      }, function(error) {
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

    function difference(template, override) {
      var ret = {};
      for (var name in template) {
        if (name in override) {
          if (_.isObject(override[name]) && !_.isArray(override[name])) {
            var diff = difference(template[name], override[name]);
            if (!_.isEmpty(diff)) {
              ret[name] = diff;
            }
          } else if (!_.isEqual(template[name], override[name])) {
            ret[name] = override[name];
          }
        }
      }
      return ret;
    }

    $scope.goToListPage = function () {
      $state.go('root.subscription.list');
    };

  });
