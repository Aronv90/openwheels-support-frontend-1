'use strict';

angular.module('transactionService', [])
  .factory('transactionService', function (Upload, settingsService, API_PATH, api) {
    return {upload: function upload(file) {
      return Upload.upload({
        url: settingsService.settings.server + API_PATH + 'mutupload',
        data: {file: file},
        headers: {'Authorization': api.createAuthHeader()}
      });
    }};
  });