'use strict';

angular.module('openwheels.person.show.communication', [])
  .controller('PersonShowCommunicationController', function ($scope, $window, $mdDialog, communication, conversationService, perPage) {

    $scope.curPage = 1;
    $scope.perPage = perPage;
    handleCommunication(communication);

    function handleCommunication(communication) {
      $scope.communication = communication.result;
      $scope.lastPage = Math.ceil(communication.total / $scope.perPage);
    }

    $scope.nextPage = function() {
      conversationService.getCommunicationMessages(_.extend({}, {limit: $scope.perPage, offset: $scope.curPage * $scope.perPage}))
        .then(function(communication) {
          handleCommunication(communication);
          $scope.curPage = $scope.curPage + 1;
        });
    };

    $scope.prevPage = function() {
      conversationService.getCommunicationMessages(_.extend({}, {limit: $scope.perPage, offset: ($scope.curPage - 2) * $scope.perPage}))
        .then(function(communication) {
          handleCommunication(communication);
          $scope.curPage = $scope.curPage - 1;
        });
    };

    $scope.viewMessage = function(message) {
      $window.scrollTo(0, 0);
      $mdDialog.show({
        controller: ['$scope', '$mdDialog', '$sce', function($scope, $mdDialog, $sce) {

          $scope.message = message;


          $scope.renderHtml = function(html_code) {
            return $sce.trustAsHtml(html_code);
          };

          $scope.done = function() {
            $mdDialog.hide();
          };
          $scope.cancel = $mdDialog.cancel;

        }],
        templateUrl: 'person/show/communication/dialog/viewMessage.tpl.html',
        fullscreen: false,
        clickOutsideToClose:true
      });
    };

  });