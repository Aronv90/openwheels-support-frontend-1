'use strict';

// TODO: Fix this directive and use it

angular.module('findperson', [])

  .directive('findPerson', function ($filter, $compile, personService) {
    return {
      priority: 999,
      restrict: 'A',
      scope: {model: '=', onselect: '&'},
      controller: function($scope){
        /**
         * Typeahead Person
         */
        $scope.selected = {};

        $scope.searchPersons = function ($viewValue) {
          return personService.search({
            search: $viewValue
          });
        };

        $scope.formatPerson = function ($model) {
          var inputLabel = '';
          if ($model) {
            inputLabel = $filter('fullname')($model) + ' [' + $model.id + ']';
          }
          return inputLabel;
        };

      },
      compile: function(tElement, attrs){
        attrs.$set('type', 'text');
        attrs.$set('class', 'form-control input-sm typeahead');
        attrs.$set('placeholder', 'Search person');
        attrs.$set('typeahead', 'person as (\'<p>\' + (person|fullname) + \' [\' + person.id + \']' +
          '<br><small>\' + person.city + \'<br>\' + person.email + \'<br>Provider \' + person.provider.id + \'</small></p>\') ' +
          'for person in searchPersons($viewValue)');
        attrs.$set('typeaheadMinLength', 3);
        attrs.$set('ngModel', 'model');
        attrs.$set('typeaheadOnSelect', 'onselect({person: model})');
        attrs.$set('typeaheadInputFormatter', 'formatPerson($model)');
        tElement.removeAttr('find-person');
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) { },
          post: function postLink(scope, iElement, iAttrs, controller) {
            $compile(iElement)(scope);
          }
        };
      }
    };
  });