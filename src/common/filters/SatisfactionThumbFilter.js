'use strict';

angular.module('filters.satisfactionThumb', [])

.filter('satisfactionThumb', function ($sce) {
  return function(rating, size) {
    var satisfaction = '';
    if(rating) {
      if(rating.satisfaction === 1) {
        satisfaction = '<i class="fa fa-thumbs-up text-success ' + size +'"></i>';
      } else if(rating.satisfaction === null) {
        satisfaction = '<i class="fa fa-thumbs-up text-warning fa-rotate-90 ' + size +'"></i>';
      } else {
        satisfaction = '<i class="fa fa-thumbs-down text-danger ' + size +'"></i>';
      }
    } else {
      satisfaction = '<i class="fa fa-thumbs-up text-muted ' + size +'"></i>';
    }
    return $sce.trustAsHtml(satisfaction);
  };
})

;
