
angular.module("openwheels.automation.automations", [
  'openwheels.EMAILER_TEMPLATES'
])

.factory("fine_admin_costs", function (
  $q,
  $filter,
  $timeout,

  EMAILER_TEMPLATES,

  invoice2Service,
  contractService,
  remarkService,
  conversationService,
  authService,
  personService,
  settingsService
) {
  const email_template = EMAILER_TEMPLATES.find(t => t.key === "Boete - CJIB - Verlegd - NL");
  if (!email_template) {
    throw "Email template CJIB boete bestaat niet meer?";
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
    title: "Administratiekosten CJIB boete in rekening brengen",
    description: ``,
    params: [
      "booking" // booking object
    ],
    first_step: {
      // type: "input_text",
      label: "CJIB referentienummer",
      act(params) {
        return $q((resolve, reject) => {
          $timeout(() => {
            const ref = window.prompt("Referentienummer?");
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
                const { contractor, booking, referentienummer } = params;

                return invoice2Service.create({
                  booking: booking.id,
                  description: `Administratiekosten CJIB boete${referentienummer ? ` ref.nr. ${referentienummer}` : ``}`,
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
                        console.log(invoiceGroup);
                        return `Factuur [${invoiceGroup.id}] (totaal ${$filter("currency")(invoiceGroup.total)})`;
                      }
                    });
                  }
                },
                {
                  // type: "action",
                  label: "Remark aan rit toevoegen",
                  act(params) {
                    const { booking } = params;

                    return remarkService.add({
                      booking: booking.id,
                      message: "Boete CJIB in rekening gebracht",
                      type: "custom"
                    })
                    .then(remark => {
                      return remark.message;
                    });
                  }
                },
                {
                  label: "Email 'Boete - CJIB - Verlegd - NL' versturen",
                  act(params) {
                    const { booking, contractor } = params;
                    let { subject, content } = email_template;
                    content = $filter("marked")(interpolate(content, {
                      VOORNAAM: contractor.firstName,
                      BEGIN_BOEKING: moment(booking.beginBooking).format("dd MMMM YYYY HH:mm"),
                      EIND_BOEKING: moment(booking.beginBooking).format("dd MMMM YYYY HH:mm"),
                    }));

                    return conversationService.sendMail({
                      recipient: contractor.id,
                      subject: subject,
                      content: content,
                      tags: ["backoffice"]
                    })
                    .then(() => {
                      return "OK";
                    });
                  },
                  children: [
                    {
                      label: "Opmerking email bij persoon",
                      act(params) {
                        const { contractor } = params;
                        const note = [
                          moment().format("DD-MM-YYYY"),
                          me ? $filter("fullname")(me) : null,
                          "Email 'Boete - CJIB - Verlegd - NL' gestuurd",
                          email_template.subject
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
                }
              ]
            }
          ]
        }
      ]
    }
  };
});
