
angular.module("openwheels.actions", [])

/**
  checkIfImmobilized: (resource: Resource) =>
    | { loading: true;                                  } // loading
    | {                                                 } // unknown
    | { no: true;  yes: false;                          } // definitely not
    | { no: false; yes: true;  since: api_datetime_str; } // definitely immobilized
  }
*/
.factory("checkIfImmobilized", function(
  chipcardService,
  deviceLogService
) {
  return function (resource) {
    const immobilized = {
      loading: true,
    };

    if (!resource.boardcomputer) {
      immobilized.loading = false;
      immobilized.yes = false;
      immobilized.no = true;
    }
    else if (resource.boardcomputer === "invers") {
      const STATE_SUCCESS = 1;
      const STATE_SAME = 2; // i.e. a noop, because it was already open/closed
      deviceLogService.statusControlLog({
        resource: resource.id,
        start: "2019-09-26 11:00",
        end: "2222-02-22 22:22",
        limit: 10
      }).then(res => {
        for (let i = 0; i < res.result.length; i++) {
          const command = res.result[i];
          if (command.type !== "control") continue;
          if (command.action === "close") {
            if (command.state === STATE_SUCCESS || command.state === STATE_SAME) {
              immobilized.yes = true;
              immobilized.since = command.responseAt;
              return;
            }
          } else if (command.action === "open") {
            if (command.state === STATE_SUCCESS || command.state === STATE_SAME) {
              immobilized.yes = false;
              return;
            }
          }
        }
      }).finally(() => {
        if (typeof immobilized.yes === "boolean") {
          immobilized.no = !immobilized.yes;
        }
        immobilized.loading = false;
      });
    }
    else {
      chipcardService.logs({
        resource: resource.id,
        max: 1,
        offset: 0
      }).then(res => {
        const lastCommand = res.result[0];
        immobilized.yes = (lastCommand.action === "CloseDoorStartDisable");
        if (immobilized.yes) {
          immobilized.since = lastCommand.dateRequested;
        }
      }).finally(() => {
        if (typeof immobilized.yes === "boolean") {
          immobilized.no = !immobilized.yes;
        }
        immobilized.loading = false;
      });
    }

    return immobilized;
  };
});
