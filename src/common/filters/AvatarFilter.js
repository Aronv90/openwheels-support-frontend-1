'use strict';

angular.module('filters.avatar', [])

.filter('personAvatar', function () {
  return function(person, size) {
    var avatar = 'assets/img/user-avatar.jpg';
    var facebookPicture = function(uid, type) {
      return 'https://graph.facebook.com/' + uid + '/picture?type=' + type;
    };

    if(person) {
      if(person.picture) {
        avatar = person.picture;
      } else if(person.facebookUid) {
        avatar = facebookPicture(person.facebookUid, size);
      }
    }
    return avatar;
  };
})

.filter('resourceAvatar', function (settingsService) {
  return function(resourcePics, size) {
    var avatar = 'assets/img/resource-avatar-' + size + '.jpg';

    if(resourcePics && resourcePics[size]) {
      avatar = settingsService.settings.server + '/' + resourcePics[size];
    }
    return avatar;
  };
})

;
