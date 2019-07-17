
angular.module("openwheels.automation", [
  "openwheels.automation.step",
  "openwheels.automation.automations"
])

.factory("automate",
  function (
    $window,
    $mdDialog,
    $mdMedia,
    fine_admin_costs
  ) {
    const automations = {
      fine_admin_costs
    };

    return function (id, params = {}) {
      if (!automations[id]) {
        console.log(`automation not known: ${id}`);
        return;
      }
      const automation = automations[id];
      const missingParams = automation.params.reduce((missingParams, requiredParam) => {
        return missingParams.concat(params[requiredParam] === undefined ? [requiredParam] : []);
      }, []);
      if (missingParams.length > 0) {
        console.log("missingParams", missingParams);
        return;
      }

      $window.scrollTo(0, 0);
      $mdDialog.show({
        controller: ["$scope", "$mdDialog", function($scope, $mdDialog) {
          $scope.automation = automation;
          $scope.params = params;

          $scope.start = function () {
            $scope.started = true;
          };

          $scope.hide = $mdDialog.hide;
          $scope.cancel = $mdDialog.cancel;
        }],
        templateUrl: 'automation/automate.tpl.html',
        fullscreen: $mdMedia("xs"),
        clickOutsideToClose: false
      });
    };
  }
);
