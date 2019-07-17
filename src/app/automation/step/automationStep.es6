
angular.module("openwheels.automation.step", [])

.directive("automationStep", function () {
  return {
    restrict: "E",
    templateUrl: "automation/step/automationStep.tpl.html",
    scope: {
      params: '=',
      step: '=',
    },
    controller: function ($scope, $element) {
      let _promise;

      $scope.started = false;

      $scope.working = false;
      $scope.failed = false;
      $scope.succeeded = false

      $scope.$watch("params", tryStart);

      function tryStart(params) {
        if (params && (!$scope.step.manual || $scope.manuallyStarted) && !_promise) {
          $scope.started = true;
          $scope.working = true;
          _promise = $scope.step.act(params)
            .then(successMessage => {
              $scope.succeeded = true;
              if (typeof successMessage === "string") {
                $scope.successMessage = successMessage;
              } else if (successMessage.el) {
                $element.find(".success-message").append(successMessage.el);
              }
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
      }

      $scope.manuallyStart = function () {
        $scope.manuallyStarted = true;
        tryStart($scope.params);
      };
    }
  };
});
