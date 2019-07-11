'use strict';

angular.module('filters.marked', [])

.filter('marked', function () {
  return function (text) {
		return marked(text);
	};
});

