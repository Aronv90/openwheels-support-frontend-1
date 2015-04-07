'use strict';

angular.module('filters.ratingStars', [])

.filter('ratingStars', function ($sce) {
  return function(starsGiven) {
    var stars = '';
    var starsTotal = 5;
    var star = '<i class="fa fa-star"></i> ';
    var starEmpty = '<i class="fa fa-star-o"></i> ';
    if(angular.isNumber(starsGiven)) {
      for (var i = starsGiven - 1; i >= 0; i--) {
        stars = stars + star;
      }
      if(starsTotal > starsGiven) {
        for (var j = (starsTotal - starsGiven) - 1; j >= 0; j--) {
          stars = stars + starEmpty;
        }
      }
    }
    return $sce.trustAsHtml(stars);
  };
})

;
