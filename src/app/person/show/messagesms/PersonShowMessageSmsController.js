'use strict';

angular.module('openwheels.person.show.messagesms', [])
  .controller('PersonShowMessageSmsController', function ($scope, $window, $mdDialog, messagesms, messageService, perPage) {

    $scope.curPage = 1;
    $scope.perPage = perPage;
    handlePushMessageSms(messagesms);

    function handlePushMessageSms(messagesms) {
      $scope.messagesms = messagesms.result;
      $scope.lastPage = Math.ceil(messagesms.total / $scope.perPage);
    }

    $scope.nextPage = function() {
      messageService.getPushMessages(_.extend({}, {limit: $scope.perPage, offset: $scope.curPage * $scope.perPage}))
        .then(function(messagesms) {
          handlePushMessageSms(messagesms);
          $scope.curPage = $scope.curPage + 1;
        });
    };

    $scope.prevPage = function() {
      messageService.getPushMessages(_.extend({}, {limit: $scope.perPage, offset: ($scope.curPage - 2) * $scope.perPage}))
        .then(function(messagesms) {
          handlePushMessageSms(messagesms);
          $scope.curPage = $scope.curPage - 1;
        });
    };

  });