'use strict';

angular.module('openwheels.person.show.messages', [])
  .controller('PersonShowMessagesController', function ($scope, messages, messageService, perPage) {

    $scope.curPage = 1;
    $scope.perPage = perPage;
    handleMessages(messages);

    function handleMessages(messages) {
      $scope.messages = messages.result;
      $scope.lastPage = Math.ceil(messages.total / $scope.perPage);

      console.log(messages.total);
    }

    $scope.nextPage = function() {
      messageService.getMessages(_.extend({}, {limit: $scope.perPage, offset: $scope.curPage * $scope.perPage}))
        .then(function(messages) {
          handleMessages(messages);
          $scope.curPage = $scope.curPage + 1;
        });
    };

    $scope.prevPage = function() {
      messageService.getMessages(_.extend({}, {limit: $scope.perPage, offset: ($scope.curPage - 2) * $scope.perPage}))
        .then(function(messages) {
          handleMessages(messages);
          $scope.curPage = $scope.curPage - 1;
        });
    };

  });