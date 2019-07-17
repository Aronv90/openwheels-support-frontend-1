
angular.module("openwheels.automation.step", [])

.directive("automationStep", function () {
  return {
    restrict: "E",
    templateUrl: "automation/step/automationStep.tpl.html",
    scope: {
      params: '=',
      step: '=',
    },
    controller: function ($scope) {
      let _promise;

      $scope.working = false;
      $scope.failed = false;
      $scope.succeeded = false

      $scope.$watch("params", newParams => {
        if (newParams && !_promise) {
          $scope.working = true;
          _promise = $scope.step.act(newParams)
            .then(successMessage => {
              $scope.succeeded = true;
              $scope.successMessage = successMessage;
            })
            .catch(error => {
              $scope.failed = true;
              if (error.message) {
                $scope.errorMessage = error.message;
              } else if (typeof error === "string") {
                $scope.errorMessage = error;
              } else {
                $scope.errorMessage = "(onbekende fout)";
              }
            })
            .finally(() => {
              $scope.working = false;
            });
        }
      });
    }
  };
});
