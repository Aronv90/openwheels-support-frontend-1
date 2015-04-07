'use strict';

angular.module('sortableColumn', [])

  .directive('sortableColumn', function($filter, $compile) {
    return {
      restrict: 'A',
      compile: function(cElement, cAttrs) {
        cAttrs.$set('ng-click', cAttrs.sortFunction+'('+ cAttrs.sortableColumn + ')');
        cAttrs.$set('style', 'cursor: pointer;');
        cElement.append(' <i class="fa fa-sort-asc" ng-if="sort.column==='+ cAttrs.sortableColumn +' && sort.descending === false"></i> <i class="fa fa-sort-desc" ng-if="sort.column===' + cAttrs.sortableColumn + ' && sort.descending === true"></i>');
        cElement.removeAttr('sortable-column');
        return {
          pre:  function preLink(scope, iElement, iAttrs, controller) {  },
          post: function postLink(scope, iElement, iAttrs, controller) {
            $compile(iElement)(scope);
          }
        };
      }
    };
  });