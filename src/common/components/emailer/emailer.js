'use strict';

angular.module('openwheels.components')

.factory('emailer', function (
  EMAILER_TEMPLATES,
  $window,
  $q,
  $rootScope,
  $timeout,
  $mdDialog,
  alertService,
  authService,
  personService,
  conversationService
) {

  var emailer = {};

  emailer.open = function (options) {
    options = options || {};
    var templateKey = options.templateKey;
    var recipient = options.recipient || null;
    var subject = options.subject || '';
    var content = options.content || '';
    var interpolations = options.interpolations;

    var template = EMAILER_TEMPLATES.find(function (t) { return t.key === templateKey; });
    var me;

    authService.me().then(function (_me) {
      me = _me;
      open();
    }).catch(open);

    function open() {
      $mdDialog.show({
        controller: ['$scope', '$filter', '$mdDialog', function($scope, $filter, $mdDialog) {

          $scope.templateSelector = {
            knownTemplates: EMAILER_TEMPLATES
          };

          $scope.selectedTabIndex = 0;
          $scope.selectTab = function (n) {
            $scope.selectedTabIndex = (n % 2);
          };

          $scope.medewerkers = [
            "het MyWheels Team",
            "Hans Rombout",
            "Daanjan Wisselink",
            "Daan Hartog",
            "Aron Vaas",
          ];

          var feedbackUrls = {
            "het MyWheels Team": "",
            "Hans Rombout": "https://docs.google.com/forms/d/e/1FAIpQLScWmFKXYxb_rRAQBKjaA_RPHYODTjWaDhC9qdoHEJjvMdxSxw/viewform?usp=sf_link",
            "Daan Hartog": "https://docs.google.com/forms/d/e/1FAIpQLSfIG5eQbZ5MW14cE6VpvKWypscPFcy9OJmZNzl90CT9pI7BSA/viewform?usp=sf_link",
            "Daanjan Wisselink": "https://docs.google.com/forms/d/e/1FAIpQLSfGFL6RVIyhqZqR2dMV2JwDqjKcxZxCUd8Hvr66A-g6WLEvcQ/viewform?usp=sf_link",
            "Aron Vaas": "",
          };

          $scope.draft = {
            recipient: null,
            contactPerson: null,
            subject: '',
            content: '',
            note: '',
            changed: false,
          };

          // console.log($scope.draft);
          $timeout(function () {
            $scope.draft.medewerker = window.localStorage.EMAILER_MEDEWERKER || "het MyWheels Team";
          }, 0);

          $scope.selectTemplate = function (template) {
            if (template) {
              $scope.draft = Object.assign({}, template, {
                changed: $scope.draft.changed || false,
                recipient: $scope.draft.recipient || null
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
            return content.replace(/([{<]{2})([^\}>\n\r]*)[}>]+/g, function (_, braces, key) {
              key = key.trim();
                var cbraces = braces === "{{" ? "}}" : ">>";
                return $scope.interpolations[key] || braces + " " + key + " " + cbraces;
              });
          };

          $scope.onChange = function (initial) {
            if ($scope.draft) {
              var medewerker = $scope.draft.medewerker || window.localStorage.EMAILER_MEDEWERKER || "het MyWheels Team";
              var feedbackUrl = feedbackUrls[medewerker];

              window.localStorage.EMAILER_MEDEWERKER = $scope.interpolations["MEDEWERKER"] = medewerker;
              $scope.interpolations["FEEDBACK"] = feedbackUrl ? "<p>Feedback? Dit horen we graag van je. <a href=\"" + feedbackUrl + "\">Vul hier de 3 vragen in.</a> Het kost je hooguit 20 seconden.</p>" : "<br />";

              $scope.draft.changed = !initial;
              $scope.remainingInterpolations = [];
              ($scope.draft.subject + $scope.draft.content).replace(/\{\{([^\}\n\r]*)\}+/g, function (_, key) {
                key = key.trim();
                if ($scope.remainingInterpolations.indexOf(key) < 0) {
                  $scope.remainingInterpolations.push(key);
                }
              });

              $scope.draft.note = [
                moment().format("DD-MM-YYYY"),
                me ? [me.firstName, me.preposition, me.surname].filter(Boolean).join(" ") : null,
                "Email gestuurd" + ($scope.draft.key ? (" [" + $scope.draft.key + "]") : ''),
                $scope.draft.subject
              ].filter(Boolean).join(" - ");

              $scope.complete = (
                $scope.draft.recipient &&
                $scope.draft.subject &&
                $scope.draft.content &&
                $scope.remainingInterpolations.filter(function (key) {
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
              emailer.sendEmail({
                recipient: $scope.draft.recipient,
                subject: $scope.draft.subject,
                content: $filter('marked')($scope.interpolate($scope.draft.content)),
                note: $scope.draft.note
              })
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
          if (recipient) {
            $scope.draft.recipient = recipient;
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
          if (recipient || subject || content || interpolations) {
            $scope.onChange();
          }

          // FURTHER/REMAINING INIT BASED ON DATA CONTEXT
          var _fromdatacontext = false;
          $scope.remainingInterpolations.forEach(function (key) {
            var item = fromDataContext(key, $rootScope.datacontext);
            if (item) {
              $scope.interpolations[key] = item;
              _fromdatacontext = true;
            }
          });
          if (!$scope.draft.recipient) {
            var item = fromDataContext("RECIPIENT", $rootScope.datacontext);
            if (item) {
              $scope.draft.recipient = item;
              _fromdatacontext = true;
            }
          }
          if (!$scope.draft.contactPerson) {
            var contactPerson = fromDataContext("CONTACTPERSON", $rootScope.datacontext);
            if (contactPerson) {
              $scope.draft.contactPerson = contactPerson;
              _fromdatacontext = true;
            }
          }
          if (_fromdatacontext) {
            $scope.onChange();
          }

          $scope.setContactPerson = function () {
            $scope.draft.recipient = $scope.draft.contactPerson;
          };

        }],
        templateUrl: 'components/emailer/emailer.tpl.html',
        fullscreen: true,
        clickOutsideToClose: false
      });
    }
  };

  emailer.sendEmail = function (data) {
    return $q(function (resolve, reject) {
      console.log("sending email", data);
      conversationService.sendMail({
        recipient: data.recipient.id,
        subject: data.subject,
        content: data.content,
        tags: ["backoffice"]
      })
      .then(function () {
        if (data.note) {
          return personService.alter({
            id: data.recipient.id,
            newProps: {
              remark: data.note + (data.recipient.remark ? "\n" + data.recipient.remark : '')
            }
          });
        } else {
          return true;
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
    case "RECIPIENT":
      return datacontext.person || null;
    case "CONTACTPERSON":
      return datacontext.contactPerson || null;
    case "NAAM":
    case "VOORNAAM":
      return datacontext.person ? datacontext.person.firstName : "";
    case "INSCHRIJFDATUM":
      return datacontext.person ? moment(datacontext.person.created).format('DD MMMM YYYY') : "";
    case "ALIAS":
      return (datacontext.booking && datacontext.booking.resource ? datacontext.booking.resource.alias : "");
    case "BEGIN_BOEKING":
      return (datacontext.booking && datacontext.booking.beginBooking ?
        moment(datacontext.booking.beginBooking).format('DD MMMM YYYY HH:mm') :
        "");
    case "EIND_BOEKING":
    case "EINDE_BOEKING":
    case "END_BOEKING":
      return (datacontext.booking && datacontext.booking.endBooking ?
        moment(datacontext.booking.endBooking).format('DD MMMM YYYY HH:mm') :
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
