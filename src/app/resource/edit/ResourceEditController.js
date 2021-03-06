'use strict';

angular.module('openwheels.resource.edit', [])

  .controller('ResourceEditController', function ($scope, $log, $state, $stateParams, resource, fleets, alertService, resourceService) {
    var masterResource = resource;
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
      {label: 'Elektrisch', value: 'elektrisch'},
      {label: 'Hybride', value: 'hybride'},
      {label: 'Lpg', value: 'lpg'},
      {label: 'Other', value: 'other'}
    ];

    $scope.insurancePolicyOptions = [
      {label: 'CB deelauto', value: 'CB_deelauto'},
      {label: 'CB normaal', value: 'CB'},
      {label: 'Deelauto OK', value: 'deelauto_OK'},
      {label: 'Elders', value: 'elders'}
    ];

    $scope.resourceTypeOptions = [
      {label: 'Car', value: 'car'},
      {label: 'Bike', value: 'bike'},
      {label: 'Boat', value: 'boat'},
      {label: 'Scooter', value: 'scooter'}
    ];

    $scope.completePlacesOptions = {
      country: 'nl',
      watchEnter: true
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
      masterResource.fleet = masterResource.fleet.id;
      $scope.resource = angular.copy(masterResource);
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
      }).then(function (resource) {
        alertService.add('success', 'resource edited', 3000);
        masterResource = resource;
        $scope.cancel();
      }, function (error) {
        alertService.add('danger', error.message, 5000);
      });

    };

    $scope.isCancelDisabled = function () {
      return angular.equals(masterResource, $scope.resource);
    };

    $scope.isSaveDisabled = function () {
      return $scope.editResourceForm.$invalid || angular.equals(masterResource, $scope.resource);
    };

  })

;


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