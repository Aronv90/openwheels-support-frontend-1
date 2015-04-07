'use strict';

angular.module('transactionService', [])
  .factory('transactionService', function ($upload,settingsService,API_PATH, api) {
    return {upload: function upload(file) {
      return $upload.upload({
        url: settingsService.settings.server + API_PATH + 'mutupload',
        file: file,
        headers: {'Authorization': api.createAuthHeader()}
      });
    }};
  });