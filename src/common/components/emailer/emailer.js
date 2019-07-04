'use strict';

angular.module('openwheels.components')

.factory('emailer', function (
  EMAILER_TEMPLATES,
  $window,
  $q,
  $rootScope,
  $mdDialog,
  alertService,
  authService,
  personService
) {

  const emailer = {};

  emailer.open = function (options) {
    const {
      templateKey,
      email = '',
      subject = '',
      content = '',
      interpolations
    } = options || {};

    const template = EMAILER_TEMPLATES.find(t => t.key === templateKey);
    let me;

    authService.me().then(_me => {
      me = _me;
      open();
    }).catch(open);

    function open() {
      $mdDialog.show({
        controller: ['$scope', '$element', '$mdDialog', function($scope, $element, $mdDialog) {

          $scope.templateSelector = {
            knownTemplates: EMAILER_TEMPLATES
          };

          $scope.selectedTabIndex = 0;
          $scope.selectTab = n => {
            $scope.selectedTabIndex = (n % 2);
          };

          $scope.draft = {
            email: '',
            subject: '',
            content: '',
            changed: false
          };

          $scope.selectTemplate = function (template) {
            if (template) {
              $scope.draft = Object.assign({}, template, {
                changed: $scope.draft.changed || false,
                email: $scope.draft.email || ''
              });
              // $timeout(() => {
              //   $element.find("#template_selector input").blur();
              //   $scope.templateSelector.searchText = '';
              // }, 100);
              $scope.onChange();
            }
          };

          $scope.interpolations = {};

          $scope.remainingInterpolations = [];

          $scope.complete = false;

          $scope.interpolate = function (content) {
            return content.replace(/\{\{([^\}\n\r]*)\}+/g, (_, key) => {
              key = key.trim();
              return $scope.interpolations[key] || `{{ ${key} }}`;
            });
          };

          $scope.onChange = function (initial) {
            if ($scope.draft) {
              $scope.draft.changed = !initial;
              $scope.remainingInterpolations = [];
              ($scope.draft.subject + $scope.draft.content).replace(/\{\{([^\}\n\r]*)\}+/g, (_, key) => {
                key = key.trim();
                if ($scope.remainingInterpolations.indexOf(key) < 0) {
                  $scope.remainingInterpolations.push(key);
                }
              });

              $scope.note = $rootScope.datacontext.person ? {
                person: $rootScope.datacontext.person,
                text: [
                  moment().format("DD-MM-YYYY"),
                  me ? [me.firstName, me.preposition, me.surname].filter(Boolean).join(" ") : null,
                  "Email gestuurd" + ($scope.draft.key ? ` [${$scope.draft.key}]` : ''),
                  $scope.draft.subject
                ].filter(Boolean).join(" - ")
              } : null;

              $scope.complete = (
                $scope.draft.email &&
                $scope.draft.subject &&
                $scope.draft.content &&
                $scope.remainingInterpolations.filter(key => {
                  return !$scope.interpolations[key];
                }).length === 0
              );
            }
          };

          $scope.sending = false;

          $scope.next = function() {
            if ($scope.selectedTabIndex === 0) {
              $scope.selectedTabIndex = 1;
            } else {
              alertService.load($scope);
              emailer.sendEmail($scope.draft, $scope.note)
                .then($mdDialog.hide)
                .catch(alertService.addError)
                .finally(alertService.loaded);
            }
          };
          $scope.cancel = function () {
            if ($scope.draft && $scope.draft.changed) {
              if ($window.confirm("Weet je het zeker?")) {
                $mdDialog.cancel();
              }
            } else {
              $mdDialog.cancel();
            }
          };

          // INIT BASED ON OPTIONS
          if (template) {
            $scope.templateSelector.searchText = template.key;
            $scope.selectTemplate(template);
          }
          if (email) {
            $scope.draft.email = email;
          }
          if (subject) {
            $scope.draft.subject = subject;
          }
          if (content) {
            $scope.draft.content = content;
          }
          if (interpolations) {
            $scope.interpolations = interpolations;
          }
          if (email || subject || content || interpolations) {
            $scope.onChange();
          }

          // FURTHER/REMAINING INIT BASED ON DATA CONTEXT
          let _fromdatacontext = false;
          $scope.remainingInterpolations.forEach(key => {
            let item = fromDataContext(key, $rootScope.datacontext);
            if (item) {
              $scope.interpolations[key] = item;
              _fromdatacontext = true;
            }
          });
          if (!$scope.draft.email) {
            let item = fromDataContext("EMAIL", $rootScope.datacontext);
            if (item) {
              $scope.draft.email = item;
              _fromdatacontext = true;
            }
          }
          if (_fromdatacontext) {
            $scope.onChange();
          }
        }],
        templateUrl: 'components/emailer/emailer.tpl.html',
        fullscreen: true,
        clickOutsideToClose: false
      });
    }
  };

  emailer.sendEmail = function (draft, note) {
    return $q(function (resolve, reject) {
      console.log("sending email", draft, note);
      // TODO actually send email
      personService.alter({
        id: note.person.id,
        newProps: {
          remark: note.text + "\n" + note.person.remark
        }
      })
      .then(resolve)
      .catch(reject);
    });
  };

  return emailer;
});

function fromDataContext(key, datacontext) {
  switch (key) {
    case "EMAIL":
      return datacontext.person ? datacontext.person.email : "";
    case "NAAM":
    case "VOORNAAM":
      return datacontext.person ? datacontext.person.firstName : "";
    case "BEGIN_BOEKING":
      return (datacontext.booking && datacontext.booking.beginBooking ?
        moment(datacontext.booking.beginBooking).format('dd MMMM YYYY HH:mm') :
        "");
    case "EIND_BOEKING":
    case "END_BOEKING":
      return (datacontext.booking && datacontext.booking.endBooking ?
        moment(datacontext.booking.endBooking).format('dd MMMM YYYY HH:mm') :
        "");
  }

  return "";
}

/*

Altijd na email versturen (bij persoon) opmerking toevoegen bovenaan:
  DD-MM-YYYY
  Hans/Daan/Aron
  Email gestuurd [KEY] [SUBJECT]

(voor rijbewijscontrole)
- bij persoon, header
  - poststuk opvragen

- bij persoon, onder facturen
  - tenaamstellingscheck

- ongeldig 

*/
