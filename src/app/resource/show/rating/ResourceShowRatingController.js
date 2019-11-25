'use strict';

angular.module('openwheels.resource.show.rating', [])

.controller('ResourceShowRatingController', function ($scope, ratings, resource, ratingService, $window, $mdDialog, $mdMedia, alertService) {
	$scope.ratings = ratings;

	$scope.openTextEditorDialog = function(rating) {
    	$window.scrollTo(0, 0);
	    $mdDialog.show({
	      fullscreen: $mdMedia('xs'),
	      controller: ['$scope', '$mdDialog', function($scope, $mdDialog) {
	        $scope.done = function() {
	          $mdDialog.hide($scope.text);
	        };
	        $scope.cancel = $mdDialog.cancel;
	      }],
	      templateUrl: 'resource/show/rating/textEditor.tpl.html',
	      parent: angular.element(document.body),
	      clickOutsideToClose:true
	    })
	    .then(function(msg) {
	      if(!msg) {
	        return;
	      }
	      // replace line endings with space
	      msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1 $2');
	      $scope.comment = msg;

	      ratingService.commentOnRating({
	      	ratingId: rating.id,
	      	comment: $scope.comment
	      })
          .catch(function (err) {
            alertService.addError(err);
          });

	  	});
	};
});
