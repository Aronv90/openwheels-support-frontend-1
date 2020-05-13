
angular.module("openwheels.root.help", [
	"openwheels.root.help.handleiding"
])

.controller("RootHelpController", function (
	$scope,
	$mdDialog,
	$mdMedia,
	$window
) {
	$scope.handleiding = function () {
		$window.scrollTo(0, 0);
		$mdDialog.show({
			fullscreen: $mdMedia("xs"),
			templateUrl: "root/help/handleiding.tpl.html",
			controller: "HandleidingController",
			clickOutsideToClose: true
		});
	};
});
