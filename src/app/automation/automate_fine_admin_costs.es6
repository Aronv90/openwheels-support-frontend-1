
angular.module("openwheels.automation.automations", [
  'openwheels.EMAILER_TEMPLATES'
])

.factory("fine_admin_costs", function (
  $q,
  $filter,
  $timeout,
  $compile,

  EMAILER_TEMPLATES,

  invoice2Service,
  contractService,
  remarkService,
  conversationService,
  authService,
  personService,
  voucherService,
  settingsService
) {
  const email_templates = {
    CJIB: EMAILER_TEMPLATES.find(t => !! t.key.match(/boete(.*)cjib/i)),
    gemeente: EMAILER_TEMPLATES.find(t => !! t.key.match(/boete(.*)gemeente/i)),
  };
  if (!email_templates.CJIB || !email_templates.gemeente) {
    console.error("Email template CJIB of gemeente bestaat niet meer?");
    return {};
  }

  function interpolate(content, interpolations) {
    return content.replace(/\{\{([^\}\n\r]*)\}+/g, function (_, key) {
      key = key.trim();
      return interpolations[key] || "{{ " + key + " }}";
    });
  }

  var me;
  authService.me().then(_me => me = _me).catch(() => {});

  const MYWHEELS_ID = settingsService.settings.server.match(/local/) ? 14 : 282;

  return {
    title: "Administratiekosten boete in rekening brengen",
    description: ``,
    params: [
      "booking" // booking object
    ],
    first_step: {
      // type: "input_text",
      label: "Referentienummer",
      act(params) {
        return $q((resolve, reject) => {
          $timeout(() => {
            const ref = window.prompt("Wat is het referentienummer?");
            if (ref === null) {
              reject();
            } else {
              params.referentienummer = ref;
              resolve(ref);
            }
          }, 500);
        });
      },
      children: [
        {
          label: "Keuze CJIB / gemeente",
          act(params) {
            return $q((resolve, reject) => {
              $timeout(() => {
                const str = (window.prompt("typ 'CJIB' of naam van gemeente") || "").trim();
                if (str.toLowerCase() === "cjib") {
                  params.type = "CJIB";
                  resolve(params.type);
                } else {
                  params.type = "gemeente";
                  params.gemeentenaam = str;
                  resolve(params.type + ": " + str);
                }
              }, 500);
            });
          },
          children: [
            {
              // type: "action",
              label: "Contracthouder ophalen",
              act(params) {
                const { booking } = params;

                return contractService.get({
                  id: booking.contract.id
                })
                .then(function(contract) {
                  params.contractor = contract.contractor;
                  return $filter("fullname")(contract.contractor) + ` [${contract.contractor.id}]`;
                });
              },
              children: [
                {
                  // type: "action",
                  label: "Factuurregel toevoegen",
                  act(params) {
                    const { type, contractor, booking, referentienummer } = params;

                    return invoice2Service.create({
                      booking: booking.id,
                      description: `Administratiekosten ${type} boete${referentienummer ? ` ref.nr. ${referentienummer}` : ``}`,
                      price: 12.5,
                      quantity: 1,
                      recipient: contractor.id,
                      sender: MYWHEELS_ID, // MyWheels
                      taxRate: 21,
                      type: "traffic_ticket"
                    })
                    .then(invoice => {
                      params.invoice = invoice;
                      return `Factuurregel [${invoice.id}] aangemaakt`;
                    });
                  },
                  children: [
                    {
                      // type: "action",
                      label: "Facturen groepen",
                      act(params) {
                        const { contractor } = params;

                        return invoice2Service.createRecipientInvoiceGroup({
                          person: contractor.id,
                          positiveOnly: false
                        })
                        .then(invoiceGroup => {
                          if (invoiceGroup === null) {
                            throw "Geen factuur?!";
                          } else {
                            params.invoiceGroup = invoiceGroup;
                            return `Factuur [${invoiceGroup.id}] (totaal ${$filter("currency")(invoiceGroup.total)})`;
                          }
                        });
                      },
                      children: [
                        {
                          label: "Herberekenen",
                          act(params) {
                            const { contractor } = params;

                            return voucherService.recalculate({
                              person: contractor.id
                            })
                            .then(() => {
                              return "OK";
                            });
                          }
                        }
                      ]
                    },
                    {
                      // type: "action",
                      label: "Remark aan rit toevoegen",
                      act(params) {
                        const { type, booking, referentienummer } = params;

                        return remarkService.add({
                          booking: booking.id,
                          message: `Boete ${type} ${referentienummer ? `[ref.nr. ${referentienummer}]` : ``} in rekening gebracht`,
                          type: "custom"
                        })
                        .then(remark => {
                          return remark.message;
                        });
                      }
                    },
                    {
                      label: "Email versturen",
                      manual: true,
                      act(params) {
                        const { type, booking, contractor } = params;
                        let { subject, content } = email_templates[type];
                        content = $filter("marked")(interpolate(content, {
                          VOORNAAM: contractor.firstName,
                          BEGIN_BOEKING: moment(booking.beginBooking || booking.beginRequested).format("dd MMMM YYYY HH:mm"),
                          EIND_BOEKING: moment(booking.endBooking || booking.endRequested).format("dd MMMM YYYY HH:mm"),
                        }));

                        return conversationService.sendMail({
                          recipient: contractor.id,
                          subject: subject,
                          content: content,
                          tags: ["backoffice"]
                        })
                        .then(() => {
                          return `Onderwerp [${subject}] email [${contractor.email}]`;
                        });
                      },
                      children: [
                        {
                          label: "Opmerking email bij persoon",
                          act(params) {
                            const { type, contractor } = params;
                            const note = [
                              moment().format("DD-MM-YYYY"),
                              me ? $filter("fullname")(me) : null,
                              `Email boete ${type} gestuurd`,
                              email_templates[type].subject
                            ].filter(Boolean).join(" - ");

                            return personService.alter({
                              id: contractor.id,
                              newProps: {
                                remark: note + (contractor.remark ? "\n" + contractor.remark : '')
                              }
                            })
                            .then(() => {
                              return note;
                            });
                          }
                        }
                      ]
                    },
                    {
                      label: "Brief opmaken",
                      act(params) {
                        const { type, contractor, referentienummer } = params;
                        function showPopup(e) {
                          const win = window.open("", "Brief");
                          const html = `
                            <html>
                            <head>
                              <meta content="text/html; charset=UTF-8" http-equiv="content-type">
                              <style type="text/css">
                              body {
                                padding: 40px;
                                font-size: 15px;
                                line-height: 21px;
                                font-family: Arial, Helvetica, sans-serif;
                              }
                              </style>
                            </head>

                            <body>
                              <svg xmlns="http://www.w3.org/2000/svg" width="300" height="63" viewBox="0 0 470 100"><path d="M95.5 91.8c-2-.3-5.5-1.3-6.4-1.7-2.6-1.4-3.2-4.5-1.2-6.4 1.3-1.4 2.3-1.5 5.3-.7 3.3.9 6.7.9 8.5 0 2.3-1.1 5-4.5 6.2-7.8l.4-1.2-11-23.2c-6-12.8-11-23.6-11-24.2-.5-2.2 1-4.4 3.3-5 2-.6 4 .3 5.1 2.3l9.2 20.4a1272 1272 0 0 0 8.6 19.2c0 .2.3.2.5 0l8-19.8c4.2-10.8 8-20 8.3-20.5 1-1.3 1.8-1.7 3.4-1.7 1.6 0 2.8.6 3.6 1.7.5.7.7 1.3.7 2.6 0 1.7-.4 2.6-10.4 26.5a2629 2629 0 0 1-11.4 26.9c-2.1 4.6-5 8.2-8 10.2-3.1 2-8 3-11.8 2.4zM2 75.3a6 6 0 0 1-1.5-1.4l-.6-1V38.4l.6-2A22 22 0 0 1 38 27.9l2.2 2 2.5-2.2c2.6-2.5 4.7-4 7.5-5.2 10.3-4.4 23.3.4 28.1 10.5 2 4 1.9 3.2 2 22.4v17.4l-.6 1c-1.5 2.8-5.7 2.8-7.3 0l-.6-1V56.6c0-10-.1-16.7-.3-17.4a13.7 13.7 0 0 0-12.3-9.8 13.6 13.6 0 0 0-14.1 9 83 83 0 0 0-.5 17.8c0 17.6 0 17.1-1.6 18.6-1.2 1.1-3.6 1.3-5 .5-2-1.3-1.8 0-2-19l-.1-17-.7-1.5a14 14 0 0 0-4.8-6C23.2 27 13.2 29.5 9.7 37l-.9 1.8-.1 17.1c-.2 16.9-.2 17.2-.7 18-1.4 1.8-4 2.5-5.9 1.4z" fill="#60a9c6"/><path d="M315 76.4a26.3 26.3 0 0 1-23.6-21.3c-.6-3.1-.7-9.3-.1-12.4A25.8 25.8 0 0 1 319.5 21a23 23 0 0 1 15.6 8.7c3.6 4.6 6 11.3 6 17.2 0 2.4-.6 3.7-2.2 4.5-1 .6-1.1.6-20 .6h-19v1l.6 2.7c2 6.6 6.8 11.1 13 12.5 1.5.3 2.8.4 5.1.3 4.9-.2 8.4-1.6 12.3-4.7 2.4-2 3.6-2.4 5-2a4 4 0 0 1 2.7 5c-.4 1.4-5 5.2-8.5 7a30.4 30.4 0 0 1-15.2 2.6zm16.6-31.2c1-.4.2-4-1.6-7.8a15 15 0 0 0-20.7-7.2 18.8 18.8 0 0 0-7.1 7.3c-1.7 3.3-2.7 7.3-1.9 7.7.5.2 30.8.2 31.3 0zm41.8 31a26.3 26.3 0 0 1-23-27.5c0-4.7 0-5.3.6-7.8A26 26 0 0 1 373 21c5.5-.7 12 .8 16.3 3.8 6.7 4.5 11 13.2 11 21.9 0 2.2 0 2.7-.6 3.5-1.2 1.9-.2 1.8-21.3 1.8-16.5 0-19 0-19 .4-.3.5.3 2.8 1.1 5 1.4 3.4 4 6.8 7 8.6 4.7 3 11.9 3.4 17.5 1 1.7-.7 4.3-2.3 6.4-4 1.8-1.4 2.9-1.6 4.5-.8 2 1 2.8 3 1.9 5-1 1.8-6.1 5.7-10 7.2-3.8 1.6-10 2.4-14.4 1.9zm17.9-31.1c.3-.2.3-.6-.2-2.8-1.5-6.6-5.2-11.2-10.4-13-2.6-1-7.5-1-10 0a16.7 16.7 0 0 0-8.4 6.8c-1.9 3-3.6 8.5-2.8 9 .5.3 31.3.3 31.8 0zm52.3 30.8a39.1 39.1 0 0 1-14-5.2c-2.4-1.6-3-2.5-3-4.5 0-1.1 0-1.5.7-2.3 1-1 2.4-1.6 3.6-1.4.4.1 2 .9 3.3 1.7 7.4 4.4 15.8 5.6 20.9 3 3.8-2 5.2-7 2.7-9.9-1.7-2-4.4-3.3-11.5-5.3-10.1-3-14.2-5.5-16.4-10-.8-1.7-.8-2.2-1-4.9 0-3.5.4-5.5 2-8.2 1.3-2.1 2.3-3.1 4.7-4.7 5.6-3.7 13.6-4.1 22.6-1.2 3.4 1.2 6.3 2.6 7 3.5 1.7 2.2 1.2 5-1 6.2-1.4.6-2.8.5-5-.7a25.5 25.5 0 0 0-13.1-3.2c-3 .2-5.1 1-6.7 2.5-2 1.8-2.5 4.8-1.3 7 1.3 2.1 3.7 3.4 12 6 8.2 2.6 11.3 4.1 14.1 7 5 5.2 4.3 15-1.7 20.3a22.6 22.6 0 0 1-8.2 4c-2.7.7-7.8.8-10.7.3zm-280.3-.3A22 22 0 0 1 146 60.1c-.4-1.4-.5-3.5-.6-18.5 0-11.6 0-17.3.2-18 .4-1.2 2.1-2.7 3.4-3 2-.4 3.9.6 4.9 2.4.4.8.4 2.4.6 17.8v17l1 2c2.3 4.5 7 7.2 12.3 7.2 5.4 0 10-2.7 12.2-7.2l1-2 .2-17a85 85 0 0 1 .5-17.8c1.5-2.6 4.7-3.3 6.8-1.4 1.8 1.6 1.7 1 1.7 18.7 0 17.2 0 17.4 1.4 20a13.5 13.5 0 0 0 12.2 6.7c3.7 0 6.8-1.2 9.6-3.8 2-2 3.2-4.2 3.5-7 .2-1 .3-8.8.3-17.2 0-16.9 0-16.2 1.7-17.6 2.1-1.6 5.2-.9 6.5 1.5l.6 1.2v16.3c0 17.6 0 18.7-1.4 22-2 5-6 9-11.2 11.5-3 1.4-5.1 1.9-8.5 2-6.3.4-11.9-1.9-17-6.9l-2.2-2.1-2.3 2.2a22 22 0 0 1-20 6.5zm76.7-.2c-.7-.4-1.2-1-1.6-1.8l-.6-1.1V3.8l.6-1A4 4 0 0 1 242 .5c1.7 0 3 .6 3.9 2l.7 1v11.2l.3 11.1 1.8-1.2c2-1.5 4.6-2.8 6.7-3.5 2.4-.7 7.6-.6 10.6.2 7.7 2 13.6 7.7 15.8 15.1.6 2.1.6 2.3.6 19.3V73l-.6 1a5 5 0 0 1-3.9 2c-1.4 0-3.1-1-3.9-2.4l-.6-1.1V56.3c0-15.2 0-16.4-.5-17.9-3.4-10.9-20-12-25-1.7l-1 2-.2 17a90 90 0 0 1-.5 17.8c-1.4 2.4-4 3.2-6.3 2zm173.2 0a5 5 0 0 1-1.3-.8c-1.5-1.3-1.4.7-1.4-36.7 0-38.1-.1-35.5 1.6-37 2.3-2 6.1-.6 7 2.3.1.9.2 9.9.2 35.3l-.1 34.2-.7 1a4.6 4.6 0 0 1-5.3 1.8z" fill="#85bb54"/></svg>

                              <p>
                                <br />${type === "CJIB" ? `
                                Aan: Parket CVOM<br />
                                Afdeling Mulder<br />
                                Postbus 50.000<br />
                                3500 MJ Utrecht<br />
                                Nederland<br />
                                <br />
                                <br />
                                <br />
                                <br />
                                Afz: Wheels4all B.V.<br />
                                Keizersgracht 264-3e ver<br />
                                1016 EV Amsterdam<br />
                                <br />
                                Betreft: Bezwaar tegen aanslagnummer ${referentienummer}<br />
                                Bijlage: Kopie beschikking en huurovereenkomst (digitaal gegenereerd)<br />
                                <br />
                                Dagtekening: Amsterdam, ${moment().format("d MMMM YYYY")}<br />
                                <br />
                                Geachte mevrouw, mijnheer,<br />
                                <br />
                                Het CJIB heeft Wheels4all Holding BV een beschikking gestuurd met nummer ${referentienummer}.
                                Ik ben het met deze beschikking niet eens, omdat de
                                auto op het moment van de overtreding verhuurd was. De auto was verhuurd
                                op het verhuurplatform Wheels4All/MyWheels. Als bewijsstuk heb ik de
                                betreffende huurovereenkomst meegezonden. Ik verzoek u vriendelijk om de
                                boete met nummer ${referentienummer} te verleggen naar de huurder ${$filter("fullname")(contractor)}.<br />
                                <br />
                                <br />
                                Ik verzoek u mij bij de behandeling van dit bezwaarschrift als belanghebbende te horen.<br />
                                <br />
                                Hoogachtend,<br />
                                <br />
                                Naam: Hans Rombout<br />
                                Plaats en datum: Amsterdam, ${moment().format("d MMMM YYYY")}<br />
                                Handtekening:<br />` : `
                                Gemeente Amsterdam<br />
                                <strong>Parkeerdiensten</strong><br />
                                Postbus 2727<br />
                                1000 CS Amsterdam<br />
                                Nederland<br />
                                <br />
                                <br />
                                <br />
                                <br />
                                Afz: Wheels4all B.V.<br />
                                Keizersgracht 264-3e ver<br />
                                1016 EV Amsterdam<br />
                                <br />
                                Betreft: Bezwaar tegen naheffingsaanslag<br />
                                Bijlage: Kopie naheffingsaanslag en huurovereenkomst (digitaal gegenereerd)<br />
                                <br />
                                Dagtekening: Amsterdam, ${moment().format("d MMMM YYYY")}<br />
                                <br />
                                Geachte mevrouw, mijnheer,<br />
                                <br />
                                U heeft Wheels4all Holding BV een aanslag gestuurd met nummer ${referentienummer}.

                                Ik ben het met deze beschikking niet eens, omdat de auto op het moment van de overtreding verhuurd was. De auto was verhuurd op het verhuurplatform Wheels4All/MyWheels. Als bewijsstuk heb ik de betreffende huurovereenkomst meegezonden. Ik verzoek u vriendelijk om de boete met nummer ${referentienummer} te verleggen naar de huurder ${$filter("fullname")(contractor)}.<br />
                                <br />
                                <br />
                                Ik verzoek u mij bij de behandeling van dit bezwaarschrift als belanghebbende te horen.<br />
                                <br />
                                Hoogachtend,<br />
                                <br />
                                Naam: Hans Rombout<br />
                                Plaats en datum: Amsterdam, ${moment().format("d MMMM YYYY")}<br />
                                Handtekening:<br />`}
                              </p>

                            </body>
                            </html>`;
                          win.document.body.innerHTML = html;
                          if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                          return false;
                        }
                        const el = $("<a>").text("tonen").on("click", showPopup);
                        return $q(resolve => resolve({ el }));
                      }
                    },
                    {
                      label: "Link naar huurovereenkomst",
                      act(params) {
                        const { booking } = params;
                        const el = $compile(`<a target="_blank" href="https://mywheels.nl/dashboard/reservering/${booking.id}/overeenkomst.pdf">huurovereenkomst</a>`)({});
                        return $q(resolve => resolve({ el }));
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  };
});
