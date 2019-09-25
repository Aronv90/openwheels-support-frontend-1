
angular.module("openwheels.trip.dashboard.handleiding", [])

.controller("HandleidingController", function (
  $scope,
  $mdDialog,

  booking,

  chipcardService,
  deviceService,
  boardcomputerService,
  alertService
) {
  /* INIT  */
  $scope.booking = booking;
  $scope.immobilized = false;
  $scope.now = moment().format('YYYY-MM-DD HH:mm');

  $scope.items = [
    {
      for: {
        electric: true,
      },
      title: "Waar vind ik de sleutel en/of laadsleutel?",
      content: `
De sleutel en laadsleutel liggen in het dashboardkastje. De sleutel heb je niet nodig om te starten. Gebruik tijdens de rit de sleutel om de auto te openen en te sluiten. Pas aan het einde van je rit sluit je de auto met de MyWheels app of OV-chipkaart. De blauwe laadsleutel van newmotion zit aan de sleutel vast.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_sleutel.png",
      ]
    },
    {
      for: {
        electric: true,
      },
      title: "Laadkabel ontkoppelen",
      content: `
- Druk in de auto op de ontgrendelknop (links onder het stuur) om de stekker te ontgrendelen.
- Trek de kabel uit de auto en sluit de laadklep.
- Houd de laadsleutel voor het leesvak van de laadpaal en haal de kabel uit de paal.
- Leg de kabel in de achterbak, **neem deze altijd mee!**`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_laadkabel_knop.png",
      ]
    },
    {
      for: {
        electric: true,
      },
      title: "Auto starten",
      content: `
1. Haal de handrem eraf *(het kleine voetpedaal naast het rempedaal)*. Als de handrem is ingetrapt, zit deze tegen de bodem aan. Trap deze kort in en laat hem naar boven komen.
2. Houd de normale rem ingetrapt.
3. Druk op de startknop (rechts van het stuur). Het display van de auto gaat aan en het groene auto symbool brandt, je hoort een melodietje.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_startknop.jpg",
        "/backoffice/assets/img/handleiding/nissan_leaf_handrem.png",
      ]
    },
    {
      for: {
        electric: true,
      },
      title: "Rijden",
      content: `
- Na het starten zet je de versnellingshendel in stand **D**. De standen zijn:
  - Stand D = vooruit (naar links + beneden)
  - Stand R = achteruit (naar links + naar voren)
  - Stand N = neutraal / vrij (naar links)
  - Stand P = parkeerstand (knopje bovenop)
  - Stand B = voor het afdalen van hellingen (schuin naar links)
- Zodra je de rem loslaat in stand **D**, **B** of **R**, begint de auto te rijden.
- Op het dashboard zie je hoeveel kilometer je nog kunt rijden.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_pook.png",
      ]
    },
    {
      for: {
        electric: true,
      },
      title: "Auto sluiten",
      content: `
- Zorg dat de auto in stand **P** staat.
- Zet de auto op de handrem (het kleine voetpedaal naast het rempedaal).
- Zet de auto uit door op de startknop te drukken.
- Leg de sleutel met laadsleutel terug in het dashboardkastje.
- Koppel de auto aan de laadpaal (zie instructies hieronder).
- Sluit de auto via de MyWheels app of OV-chipkaart.
- Controleer of de deuren op slot zijn.`
    },
    {
      for: {
        electric: true,
      },
      title: "Opladen",
      content: `
- In de MyWheels app vind je de beschikbare laadpalen in de zone. Je kunt onderweg ook snelladen bij Fastned stations.
- Pak de kabel uit de kofferbak.
- Druk in de auto op de ontgrendelknop (links onder het stuur of de onderste knop van de sleutel) om de laadklep te openen.
- Steek de kabel in de **rechter** aansluiting voorin de laadklep.
- Steek de andere kant van de kabel in de laadpaal.
- Houd de laadsleutel drie seconden voor het leesvlak van de laadpaal.
- De blauwe lampjes aan de binnenkant van de auto, op het dashboard, beginnen te knipperen als de kabel juist is aangesloten.<br />
  **Verlaat de auto nooit zonder deze aan te sluiten aan de laadpaal!**`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_opladen.png",
      ]
    },
  ]
    .map((doc, id) => ({ ...doc, id }))
    .filter(item => {
      if (booking.resource.fuelType === "elektrisch" && item.for.electric === false) {
        return false;
      }
      if (booking.resource.fuelType !== "elektrisch" && item.for.electric === true) {
        return false;
      }
      return true;
    });

  const index = elasticlunr(function () {
    this.use(elasticlunr.nl);
    this.addField("title");
    this.addField("content");
    this.setRef("id");
  });

  $scope.items.forEach(item => {
    index.addDoc(item);
  });

  $scope.state = {
    selected: -1,
    searchText: "",
  };

  $scope.search = function () {
    $scope.state.searching = $scope.state.searchText.trim() !== "";
    if ($scope.state.searching) {
      $scope.searchResults = index.search($scope.state.searchText, {
        fields: {
          title: { boost: 2 },
          content: { boost: 1 },
        },
      }).map(({ doc, ref, score }) => doc);
      $scope.state.selected = $scope.searchResults.length > 0 ? $scope.searchResults[0].id : -1;
    } else {
      $scope.searchResults = $scope.items.slice();
      $scope.state.selected = -1;
    }
  };

  $scope.search();

  //only get last command if boardcomputer is MyFMS
  if (booking.resource.boardcomputer && booking.resource.boardcomputer !== "ccome") {
    chipcardService.logs({
      resource: booking.resource.id,
      max: 1,
      offset: 0
    }).then(res => {
      const lastCommand = res.result[0];
      if (lastCommand.action === "CloseDoorStartDisable") {
        $scope.immobilized = {
          command: lastCommand
        };
      }
    });
  }

  $scope.myfms = function() {
    var methodCall = (booking.resource.boardcomputer === 'invers') ?
      deviceService.forceOpen({
        resource: booking.resource.id
      }) :
      boardcomputerService.control({
        action: 'OpenDoorStartEnable',
        resource: booking.resource.id
      });

    methodCall
    .then(function(res) {
      return alertService.add('success', 'De auto opent binnen 15 seconden.', 5000);
    })
    .catch(function(err) {
      if(err && err.message) {
        alertService.add('warning', 'De auto kon niet geopend worden: ' + err.message, 5000);
      }
    });
  };

  $scope.done = function() {
    $mdDialog.hide();
  };
  $scope.cancel = $mdDialog.cancel;
});
