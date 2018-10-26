'use strict';

angular.module('openwheels.resource.edit', [])

  .controller('ResourceEditController', function ($q, $scope, $log, $state, $stateParams, resource,
    fleets, alertService, resourceService, maintenanceService) {

    if(!resource.garage){
      $scope.resource.garage = {};
      $scope.resource.garage.id = null;
      $scope.resource.garage.name = null;
    }

    var masterResource = resource;
    var masterResourceProperties = createResourceProperties(resource);

    function createResourceProperties (resource) {
      var resourceProperties = {};
      angular.forEach(resource.properties, function (resourceProperty) {
        resourceProperties[resourceProperty.id] = true;
      });
      return resourceProperties;
    }

    var resetCenter = function () {
      $scope.map.center = {
        latitude: $scope.resource.latitude,
        longitude: $scope.resource.longitude
      };
      $scope.map.resourceMarker = {
        latitude: $scope.resource.latitude,
        longitude: $scope.resource.longitude
      };
    };
    $scope.fleetOptions = fleets;

    $scope.fuelTypeOptions = [
      {label: 'Benzine', value: 'benzine'},
      {label: 'Diesel', value: 'diesel'},
      {label: 'LPG', value: 'lpg'},
      {label: 'Elektrisch', value: 'elektrisch'},
      {label: 'Hybride', value: 'hybride'},
      {label: 'Aardgas', value: 'cng'},
      {label: 'Onbekend', value: 'onbekend'}
    ];

    $scope.insurancePolicyOptions = [
      {label: 'CB deelauto', value: 'CB_deelauto'},
      {label: 'CB normaal', value: 'CB'},
      {label: 'Deelauto OK', value: 'deelauto_OK'},
      {label: 'Elders', value: 'elders'}
    ];

    $scope.resourceTypeOptions = [
      {label: 'Car', value: 'car'},
      {label: 'Cabrio', value: 'cabrio'},
      {label: 'Camper', value: 'camper'},
      {label: 'Oldtimer', value: 'oldtimer'},
      {label: 'Station', value: 'station'},
      {label: 'Van', value: 'van'}
    ];

    $scope.typeOptions = [
      {label: 'Car', value: 'car'},
      {label: 'Bike', value: 'bike'},
      {label: 'Boat', value: 'boat'},
      {label: 'Scooter', value: 'scooter'}
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
      {label: 'Chipcard', value: 'chipcard'},
      {label: 'Locker', value: 'locker'},
      {label: 'Meeting', value: 'meeting'},
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

    $scope.completePlacesOptions = {
      country: 'nl',
      watchEnter: true
    };

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

    $scope.$watch('searchPlace.details', function (newVal, oldVal) {
      if (newVal === oldVal) {
        return;
      }

      var ac = $scope.searchPlace.details.address_components;
      var address = {};
      for (var i = 0; i < ac.length; ++i) {
        if (ac[i].types[0] === 'route') {
          address.route = ac[i].long_name;
        }
        if (ac[i].types[0] === 'street_number') {
          address.streetNumber = ac[i].long_name;
        }
        if (ac[i].types[0] === 'locality') {
          address.city = ac[i].long_name;
        }
      }
      if (!(address.route && address.streetNumber && address.city)) {
        return alertService.add('danger', 'Please select a full address: including a street name, street number and city', 3000);
      }

      //set new values on scope
      $scope.resource.location = address.route + ' ' + address.streetNumber;
      $scope.resource.city = address.city;
      $scope.resource.latitude = $scope.searchPlace.details.geometry.location.lat();
      $scope.resource.longitude = $scope.searchPlace.details.geometry.location.lng();
    });

    $scope.$watch('[resource.latitude, resource.longitude]', function () {
      resetCenter();
    }, true);

    $scope.cancel = function () {
      $scope.resource = angular.copy(masterResource);
      $scope.resourceProperties = angular.copy(masterResourceProperties);
    };

    $scope.cancel();

    angular.extend($scope, {
      map: {
        center: {
          latitude: $scope.resource.latitude,
          longitude: $scope.resource.longitude
        },
        draggable: 'true',
        zoom: 14,
        options: {
          scrollwheel: false
        },
        resourceMarker: {
          latitude: $scope.resource.latitude,
          longitude: $scope.resource.longitude,
          title: $scope.resource.alias
        }
      }
    });

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
        alertService.add('success', 'resource edited', 3000);
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
