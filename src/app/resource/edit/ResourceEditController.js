'use strict';

angular.module('openwheels.resource.edit', [])

  .controller('ResourceEditController', function ($q, $scope, $log, $state, $stateParams, resource,
    fleets, alertService, resourceService, maintenanceService, dutchZipcodeService, $timeout) {

    if(!resource.garage){
      $scope.resource.garage = {};
      $scope.resource.garage.id = null;
      $scope.resource.garage.name = null;
    }

    var masterResource = resource;
    var masterResourceProperties = createResourceProperties(resource);

    if($scope.resource.contactPerson && $scope.resource.owner.id === $scope.resource.contactPerson.id) {
      $scope.resource.contactPerson = null;
    }
    if(!$scope.resource.garage.id) {
      $scope.resource.garage = null;
    }

    function createResourceProperties (resource) {
      var resourceProperties = {};
      angular.forEach(resource.properties, function (resourceProperty) {
        resourceProperties[resourceProperty.id] = true;
      });
      return resourceProperties;
    }

    $scope.fleetOptions = fleets;

    $scope.fuelTypeOptions = [
      {label: 'Benzine', value: 'benzine'},
      {label: 'Diesel', value: 'diesel'},
      {label: 'LPG', value: 'lpg'},
      {label: 'Elektrisch', value: 'elektrisch'},
      {label: 'Hybride', value: 'hybride'},
      {label: 'Aardgas', value: 'cng'}
    ];

    $scope.insurancePolicyOptions = [
      {label: 'CB deelauto', value: 'CB_deelauto'},
      {label: 'CB normaal', value: 'CB'},
      {label: 'Deelauto OK', value: 'deelauto_OK'},
      {label: 'Elders', value: 'elders'}
    ];

    $scope.resourceTypeOptions = [
      {label: 'Elektrische auto', value: 'Elektrische auto'},
      {label: 'Gezinsauto', value: 'Gezinsauto'},
      {label: 'Stadsauto', value: 'Stadsauto'}
    ];

    $scope.numberOfSeatsOptions = [
      {value: 2   , label: '2'},
      {value: 3   , label: '3'},
      {value: 4   , label: '4'},
      {value: 5   , label: '5'},
      {value: 6   , label: '6'},
      {value: 7   , label: '7'},
      {value: 8   , label: '8'},
      {value: 9   , label: '9'}
    ];

    $scope.allowedAreaOptions = (function () {
      var options = [
        { label: 'Europa', value: 'Europa' },
        { label: 'Nederland', value: 'Nederland' }
      ];
      if (resource.providerId !== 21) {
        options.push({ label: 'België', value: 'België' });
      }
      return options;
    }());

    $scope.minimumAgeOptions = (function () {
      var options = [
        { label: '', value: '' }
      ];
      for (var i = 18; i <= 40; i++) {
        options.push({ label: i + '', value: i });
      }
      return options;
    }());

    $scope.locktypeOptions = [
      {label: 'OV-chipkaart', value: 'chipcard'},
      {label: 'Sleutelkluisje', value: 'locker'},
      {label: 'Afspraak maken', value: 'meeting'},
      {label: 'Smartphone', value: 'smartphone'}
    ];

    $scope.resourcePropertyOptions = [
      { value: 'airconditioning'    , label: 'airconditioning' },
      { value: 'fietsendrager'      , label: 'fietsendrager' },
      { value: 'winterbanden'       , label: 'winterbanden' },
      { value: 'kinderzitje'        , label: 'kinderzitje' },
      { value: 'navigatie'          , label: 'navigatie' },
      { value: 'trekhaak'           , label: 'trekhaak' },
      { value: 'automaat'           , label: 'automaat' },
      { value: 'mp3-aansluiting'    , label: 'mp3-aansluiting' },
      { value: 'rolstoelvriendelijk', label: 'rolstoelvriendelijk' }
    ];

    /**
     * Typeahead Garages
     */
    $scope.searchGarages = function ($viewValue) {
      return maintenanceService.searchGarage({
        search: $viewValue
      })
      .then(function(garages){
        return garages.result;
      });
    };

    $scope.formatGarage = function ($model) {
      var inputLabel = '';
      if ($model) {
        inputLabel = $model.name + ' ' + '[' + $model.id + ']';
      }
      return inputLabel;
    };

    /**
     * Location lookup
     */
    $scope.isZipLookupBusy = false;
    $scope.lookupZip = function () {

      // Clear address fields immediately
      var result = {
        location : null,
        city       : null,
        latitude   : null,
        longitude  : null
      };
      angular.extend($scope.resource, result);

      // Start lookup
      $scope.isZipLookupBusy = true;
      dutchZipcodeService.autocomplete({
        zipcode      : $scope.zipcode,
        streetNumber : $scope.streetNumber
      })
      .then(function(data) {
        var item = data && data.length && data[0];
        if (item) {
          result = {
            location        : item.street,
            streetNumber    : $scope.streetNumber,
            zipcode         : item.nl_sixpp,
            city            : item.city,
            latitude        : item.lat,
            longitude       : item.lng
          };
        }
      })
      .catch(function(error) {
        $scope.lookupError = error.message;
      })
      .finally(function() {
        // Fill results
        angular.extend($scope.resource, result);
        $timeout(function() {
          $scope.isZipLookupBusy = false;
        }, 0);
      });
    };

    $scope.cancel = function () {
      $scope.resource = angular.copy(masterResource);
      $scope.resourceProperties = angular.copy(masterResourceProperties);
    };

    $scope.cancel();

    $scope.save = function () {
      resourceService.alter({
        id: masterResource.id,
        newProps: difference(masterResource, $scope.resource)
      })
     .then(function (resource) {
        if (!angular.equals(masterResourceProperties, $scope.resourceProperties)) {
          return saveResourceProperties().then(function () { return resource; });
        } else {
          return resource;
        }
      })
      .then(function (resource) {
        alertService.add('success', 'Auto gewijzigd', 3000);
        masterResourceProperties = $scope.resourceProperties;
        masterResource = resource;
        $scope.cancel();
      })
      .catch(function (error) {
        alertService.add('danger', error.message, 5000);
      });
    };

    function saveResourceProperties () {
      var pending = [];
      angular.forEach($scope.resourceProperties, function (value, propertyName) {
        if (value === true && !masterResourceProperties[propertyName]) {
          pending.push(resourceService.addProperty({
            resource: masterResource.id,
            property: propertyName
          }));
        }
        if (value === false && masterResourceProperties[propertyName]) {
          pending.push(resourceService.removeProperty({
            resource: masterResource.id,
            property: propertyName
          }));
        }
      });
      return $q.all(pending);
    }

  });

// dit moet misschien in een speciale service?
// of id property bij functies die een alter doen deleten
// of via form dirty property op fields controleren en alleen die meesturen
// http://stackoverflow.com/questions/16588263/angular-form-send-only-changed-fields
function difference(template, override) {
  var ret = {};
  for (var name in template) {
    if (name in override) {
      if (_.isObject(override[name]) && !_.isArray(override[name])) {
        var diff;
        if(_.isEmpty(template[name]) && !_.isEmpty(override[name])){
          diff = override[name];
        }else{
          diff = difference(template[name], override[name]);
        }
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
