
angular.module("openwheels.root.help.handleiding", [])

.controller("HandleidingController", function (
  $scope,
  $mdDialog,
  $rootScope,

  checkIfImmobilized
) {
  // Deze data zijn *wellicht* aanwezig,
  // afhankelijk van de pagina waar je bent
  // ===========
  const {
    page, // trip | trip_dashboard | person | resource
    booking,
    person,
    contract,
    contactPerson,
    resource,
  } = $rootScope.datacontext;

  // Vanuit te template kun je ze direct gebruiken
  Object.assign($scope, $rootScope.datacontext);

  $scope.immobilized = booking && checkIfImmobilized(booking.resource);
  $scope.now = () => moment().format('YYYY-MM-DD HH:mm');

  // Deze array aan vragen wordt elke keer als de modal wordt geopend
  //  opnieuw berekend. Je kunt items uitsluiten door false/null/undefined
  //  te laten staan, bv. met `resource && { ... }` komt de vraag er alleen
  //  in te staan als je op een autopagina bent.
  // ==========

  $scope.items = [

    // Vragen over elektrische auto's
    // =============

    resource && {
      title: "De auto gaat niet op slot / sluit niet",
      content: `
Heb je een aantal keer geprobeerd om de deuren van een auto te sluiten maar gaat de auto niet dicht?<br>
- Vraag de huurder de sleutel in het dashboardkastje te leggen, de huurder mag daarna weggaan.<br>
- De auto gaat binnen 30 minuten automatisch alsnog dicht.<br>
- Er hoeft hiervoor niet naar de achterwacht gebeld te worden.<br>
- Laat de huurder de auto nooit met de sleutel sluiten!<br>
-  Graag wel notitie maken in de reservering.`
    },
    resource && resource.fuelType === "elektrisch" && {
      title: "Waar vind ik de sleutel en/of laadsleutel?",
      content: `
De sleutel en laadsleutel liggen in het dashboardkastje. De sleutel heb je niet nodig om te starten. Gebruik tijdens de rit de sleutel om de auto te openen en te sluiten. Pas aan het einde van je rit sluit je de auto met de MyWheels app of OV-chipkaart. De blauwe laadsleutel van newmotion zit aan de sleutel vast.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_sleutel.png",
      ]
    },  
    resource && {
      title: "Het beëindigen / inkorten / stoppen van een rit lukt niet",
      content: `
Als een huurder de rit wilt inkorten, dan kan dat met maximaal 1 of 2 uur (afhankelijk van het abonnement).<br>
De gebruiker kan dit zelf doen door de rit te eindigen bij het sluiten van de auto.`
    },
    resource && resource.model === "Aygo" && {
      title: "Waar vind ik de sleutel?",
      content: `
De sleutel ligt in het dashboardkastje.<br>
De sleutel heb je niet nodig om te starten, je gebruikt hiervoor de start/stopknop.<br>
Gebruik tijdens de rit de sleutel om de auto te openen en te sluiten.<br>
Pas aan het einde van je rit sluit je de auto met de MyWheels app of OV-chipkaart.`
    },
    resource && resource.parkingType === 'parking_spot' && {
      title: "Waar brengt de huurder auto terug / waar parkeert de huurder?",
      content: `
Deze auto heeft een vaste parkeerplek aan de ${resource.location} ${resource.streetNumber}.<br>
De huurder brengt de auto aan het einde van de rit terug naar deze plek.<br>
Is de parkeerplek bezet?<br>
- Vraag de huurder om de auto op een openbare parkeerplek in de buurt te zetten.<br>
- Dit mag <strong>geen gehandicapten plek of parkeerplek</strong> met een wit kruis zijn.<br>

<strong>Informatie over het wegslepen van foutgeparkeerde auto:</strong><br>
${resource.remark}`
    },
    resource && resource.parkingType === 'parking_spot' && {
      title: "De vaste parkeerplek van de auto is bezet / foutparkeerder?",
      content: `
Deze auto heeft een vaste parkeerplek aan de ${resource.location} ${resource.streetNumber}.<br>
Is de parkeerplek bezet?<br>
- Vraag de huurder om de auto op een openbare parkeerplek in de buurt te zetten.<br>
- Dit mag <strong>geen gehandicapten plek of parkeerplek</strong> met een wit kruis zijn.<br>

<strong>Informatie over het wegslepen van foutgeparkeerde auto:</strong><br>
${resource.remark}`
    },
    resource && resource.fuelType !== "elektrisch" && resource.parkingType === 'zone' && {
      title: "Waar brengt de huurder auto terug / waar parkeert de huurder?",
      content: `
Deze auto heeft geen vaste parkeerplek maar een zoneplek.<br>
De auto mag overal in de zone parkeren.<br>
De huurder vindt de zone in de MyWheels app of op de website.`
    },
    resource && resource.fuelType === "elektrisch" && resource.parkingType === 'zone' && {
      title: "Waar brengt de huurder auto terug / waar parkeert de huurder?",
      content: `
Deze auto heeft geen vaste parkeerplek maar een zoneplek.<br>
De auto mag overal in de zone parkeren.<br>
De huurder vindt de zone in de MyWheels app of op de website.<br>
- Is de accu minder dan 80% dan aan een laadpaal.<br>
- Heeft de accu nog 80% of meer stroom, dan op een vrije parkeerplaats zonder laadpaal.<br>
- Parkeert een huurder bij een laadpaal? Dan is deze verplicht de auto ook aan te sluiten voor het opladen.`
    },
    resource && resource.fuelType === "elektrisch" && {
      title: "Laadkabel ontkoppelen",
      content: `
- Druk in de auto op de ontgrendelknop (links onder het stuur) om de stekker te ontgrendelen.<br>
- Trek de kabel uit de auto en sluit de laadklep.<br>
- Houd de laadsleutel voor het leesvak van de laadpaal en haal de kabel uit de paal.<br>
- Leg de kabel in de achterbak, **neem deze altijd mee!**`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_laadkabel_knop.png",
      ]
    },
    resource && resource.fuelType === "elektrisch" && {
      title: "Auto starten",
      content: `
1. Haal de handrem eraf *(het kleine voetpedaal naast het rempedaal)*. Als de handrem is ingetrapt, zit deze tegen de bodem aan. Trap deze kort in en laat hem naar boven komen.<br>
2. Houd de normale rem ingetrapt.<br>
3. Druk op de startknop (rechts van het stuur). Het display van de auto gaat aan en het groene auto symbool brandt, je hoort een melodietje.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_startknop.jpg",
        "/backoffice/assets/img/handleiding/nissan_leaf_handrem.png",
      ]
    },
    resource && resource.fuelType === "elektrisch" && {
      title: "Rijden",
      content: `
- Na het starten zet je de versnellingshendel in stand **D**. De standen zijn:<br>
  - Stand D = vooruit (naar links + beneden)<br>
  - Stand R = achteruit (naar links + naar voren)<br>
  - Stand N = neutraal / vrij (naar links)<br>
  - Stand P = parkeerstand (knopje bovenop)<br>
  - Stand B = voor het afdalen van hellingen (schuin naar links)<br>
- Zodra je de rem loslaat in stand **D**, **B** of **R**, begint de auto te rijden.<br>
- Op het dashboard zie je hoeveel kilometer je nog kunt rijden.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_pook.png",
      ]
    },
    resource && resource.fuelType === "elektrisch" && {
      title: "Auto sluiten",
      content: `
- Zorg dat de auto in stand **P** staat.<br>
- Zet de auto op de handrem (het kleine voetpedaal naast het rempedaal).<br>
- Zet de auto uit door op de startknop te drukken.<br>
- Leg de sleutel met laadsleutel terug in het dashboardkastje.<br>
- Koppel de auto aan de laadpaal (zie instructies hieronder).<br>
- Sluit de auto via de MyWheels app of OV-chipkaart.<br>
- Controleer of de deuren op slot zijn.`
    },
    resource && resource.fuelType === "elektrisch" && {
      title: "Opladen",
      content: `
- In de MyWheels app vind je de beschikbare laadpalen in de zone. Je kunt onderweg ook snelladen bij Fastned stations.<br>
- Pak de kabel uit de kofferbak.<br>
- Druk in de auto op de ontgrendelknop (links onder het stuur of de onderste knop van de sleutel) om de laadklep te openen.<br>
- Steek de kabel in de **rechter** aansluiting voorin de laadklep.<br>
- Steek de andere kant van de kabel in de laadpaal.<br>
- Houd de laadsleutel drie seconden voor het leesvlak van de laadpaal.<br>
- De blauwe lampjes aan de binnenkant van de auto, op het dashboard, beginnen te knipperen als de kabel juist is aangesloten.<br />
  **Verlaat de auto nooit zonder deze aan te sluiten aan de laadpaal!**`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_controle_opladen.png",
        "/backoffice/assets/img/handleiding/nissan_leaf_opladen.png",
      ]
    },
    resource && resource.fuelType === "elektrisch" && {
      title: "Hoe weet ik of de auto oplaadt / correct is aangesloten?",
      content: `
De blauwe lampjes aan de binnenkant van de auto, op het dashboard, beginnen te knipperen / lopen als de kabel juist is aangesloten.<br>
Deze zijn goed zichtbaar als je voor de auto staat.<br>
Het opladen aan de laadpaal is dan gestart.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_controle_opladen.png",
      ]
    },
    resource && resource.fuelType === "elektrisch" && {
      title: "Het opladen / aansluiten lukt niet",
      content: `
Doorloop onderstaande stappen:<br>
- De laadkabel dient in de auto en laadpaal aangesloten te zijn.<br>
- De laadpas (deze zit aan de sleutel, zie foto) dient langs de lezer op de laadpaal gehaald te worden.<br>
- Indien de paal niet geactiveerd wordt, verzoek de huurder het opnieuw te proberen, soms is het activeren lastig. Beweeg de laadpas langs de lezer / houdt hem gedurende een aantal seconden op verschillende plekken. <br>
- Indien de laadpaal niet geactiveerd wordt / storing (rood licht) geeft, verzoek de huurder naar een andere laadpaal te rijden, binnen de zone van de auto, en de auto daar aan te sluiten.<br>
- Laat de huurder bevestigen dat de auto laadt, door te controleren of de lampjes op het dashboard (onder het raam) gaan lopen (zie foto). Deze zijn goed zichtbaar als je voor de auto staat.<br>
- De sleutel kan na het activeren terug in het dashboardkastje.<br>
- De huurder kan de auto sluiten via de app / OV Chipkaart, of door jou via de knop [Sluiten].`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_controle_opladen.png",
        "/backoffice/assets/img/handleiding/nissan_leaf_sleutel.png",
      ]
    },
    resource && resource.fuelType === "elektrisch" && resource.model === "Leaf" && {
      title: "Hoe haal ik een Nissan Leaf van de handrem?",
      content: `
De handrem is bij een Nissan Leaf een voetpedaal, een klein voetpedaal links naast het rempedaal.<br>
- Als de handrem is ingetrapt, zit deze tegen de bodem aan.<br>
- Trap deze kort in en laat hem naar boven komen.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_handrem.png"
      ]
    },
    resource && {
      title: "De auto start niet / de huurder krijgt auto niet gestart",
      content: `
Klik links op de knop [Starten] voor hulp.<br>
Bel de pechhulp pas als je alle stappen hebt doorlopen.`
    },

    // Vragen over accounts
    // =============

    {
      title: "De huurder kan niet inloggen",
      content: `
Als een huurder niet kan inloggen, raden we aan om een nieuw wachtwoord in te stellen via Wachtwoord vergeten.<br>
Link: https://mywheels.nl/wachtwoord-vergeten`
    },
    {
      title: "Een onbekende beller / telefoon",
      content: `
Belt een huurder met een onbekend of anoniem (mobiel) telefoonnummer?<br>
Dan kun je de auto helaas niet openen of sluiten.<br>
Vraag de huurder te bellen vanaf een telefoonnummer dat bij ons bekend is.`
    },
    {
      title: "Wanneer wordt een account gecontroleerd / controle account?",
      content: `
Een account wordt gecontroleerd bij het maken van een eerste reservering.<br>
Meestal wordt een account automatisch geactiveerd, de huurder dan direct op weg!<br>
Soms is handmatige controle nodig. De vaste supportmedewerkers van MyWheels doen dit op werkdagen tussen 09.00 en 17.00 uur.`
    },
    {
      title: "Waarom is het account gedeactiveerd / geblokkeerd?",
      content: `
Een account kan om verschillende redenen gedeactiveerd worden.<br>
Denk aan een ongeldig rijbewijs of verkeerd ingevulde gegevens.<br>
Vraag de huurder te mailen  naar account@mywheels.nl om de reden van deactivatie op te vragen.<br>
In verband met privacy overwegingen is het niet mogelijk om hier telefonisch navraag over te doen.`
    },
    {
      title: "Het raam van een auto staat open / op een kier",
      content: `
Staat het raam van een auto open?<br>
- Bel dan eerst de vorige huurder door op de knop [Vorige] te klikken. Spreek indien mogelijk een voicemail in.<br>
- Geen gehoor? Bel dan de beheerder van de auto om te vragen om de deur te sluiten. Spreek indien mogelijk een voicemail in.<br>
- Geen gehoor? Wacht dan tot de vorige huurder of de beheerder terugbelt.`
    }
  ]
    .filter(Boolean)
    .map((doc, id) => ({ ...doc, id }));

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

  $scope.done = function() {
    $mdDialog.hide();
  };
  $scope.cancel = $mdDialog.cancel;
});
