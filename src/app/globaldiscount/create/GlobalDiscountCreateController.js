'use strict';

angular.module('openwheels.globaldiscount.create', [])

  .controller('GlobalDiscountCreateController', function ($scope, $log, $state, $filter, $stateParams, alertService, personService, discountService, resourceService) {

    $scope.globalDiscount = {};
    $scope.globalDiscount.resource = null;

    $scope.dateConfig = {
      //model
      modelFormat: 'YYYY-MM-DD',
      formatSubmit: 'yyyy-mm-dd',

      //view
      viewFormat: 'DD-MM-YYYY',
      format: 'dd-mm-yyyy',

      //options
      selectMonths: true
    };
    /**
     * Typeahead Person
     */
    $scope.searchPersons = function ($viewValue) {
      return personService.search({
        search: $viewValue
      });
    };

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

    /**
     * A convenience method for detecting a legitimate non-null value.
     * Returns false for null/undefined/NaN/Infinity, true for other values,
     * including 0/false/''
     * @method isValue
     * @static
     * @param o The item to test.
     * @return {boolean} true if it is not null/undefined/NaN || false.
     */
    angular.isValue = function(val) {
      return !(val === null || !angular.isDefined(val) || (angular.isNumber(val) && !isFinite(val)));
    };

    $scope.save = function () {
      discountService.create({
        code: $scope.globalDiscount.code,
        amount: $scope.globalDiscount.amount,
        percentage: $scope.globalDiscount.percentage,
        validFrom: $scope.globalDiscount.from,
        validUntil: $scope.globalDiscount.until,
        sender: angular.isValue($scope.globalDiscount.sender) ? $scope.globalDiscount.sender.id : null,
        recipient: angular.isValue($scope.globalDiscount.recipient) ? $scope.globalDiscount.recipient.id : null,
        resource: angular.isValue($scope.globalDiscount.resource) ? $scope.globalDiscount.resource.id : null,
        multiple: $scope.globalDiscount.multiple,
        global: $scope.globalDiscount.global,
        globalCharge: $scope.globalDiscount.globalCharge
      })
        .then(function (result) {
          return alertService.add('success', 'Global Discount code is toegevoegd.', 3000);
        })
        .catch(alertService.addError)
        .finally(alertService.loaded);
    };

    $scope.formatPerson = function ($model) {
      var inputLabel = '';
      if ($model) {
        inputLabel = $filter('fullname')($model) + ' [' + $model.id + ']';
      }
      return inputLabel;
    };
  });