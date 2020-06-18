
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
    immobilized,
  } = $rootScope.datacontext;

  // Vanuit te template kun je ze direct gebruiken
  // Object.assign($scope, $rootScope.datacontext);

  $scope.immobilized = booking && checkIfImmobilized(booking.resource);
  $scope.now = () => moment().format('YYYY-MM-DD HH:mm');

  // Deze array aan vragen wordt elke keer als de modal wordt geopend
  //  opnieuw berekend. Je kunt items uitsluiten door false/null/undefined
  //  te laten staan, bv. met `resource && { ... }` komt de vraag er alleen
  //  in te staan als je op een autopagina bent.
  // ==========

  $scope.items = [


    // Vragen over openen en sluiten
    // =============

    resource && {
      title: "De deuren gaan niet open",
      content: `
Heb je een aantal keer geprobeerd om met de knop [Openen] de deuren van een auto te openen maar gaat de auto niet open?<br>
- Vraag of de huurder bij de juiste auto met kenteken <strong>${resource.registrationPlate}</strong> staat.
- Sluit de auto met de knop [Sluiten], en open hem dan nogmaals met de knop [Openen].<br>
- Werkt het nog niet? Boek de huurder dan om naar een auto in de buurt via [Omboeken].<br>
- Is er geen andere auto beschikbaar? Soms werkt het openen na 5 minuten wachten wel.<br>
- Of bel de beheerder van de auto om te vragen de auto met de reservesleutel te openen.`
    },

    resource && !immobilized && {
      title: "De deuren gaan niet op slot",
      content: `
Open de auto eerst met de knop [Openen] en sluit de auto daarna weer met de knop [Sluiten].<br>
Gaat de auto nog niet dicht?<br>
- Vraag de huurder de sleutel in het dashboardkastje te leggen, de huurder mag daarna weggaan.<br>
- De auto gaat binnen 30 minuten automatisch alsnog dicht.<br>
- Er hoeft hiervoor niet naar de achterwacht gebeld te worden.<br>
- Laat de huurder de auto nooit met de sleutel sluiten, maar laat de deuren open!<br>
-  Graag wel een notitie maken in de reservering.`
    },

    resource && immobilized && {
      title: "De deuren gaan niet op slot",
      content: `
Heb je een aantal keer geprobeerd om met de knop [Sluiten] de deuren van een auto te sluiten maar gaat de auto niet dicht?<br>
Nog steeds problemen?<br>
- Vraag de huurder de sleutel in het dashboardkastje te leggen, de huurder mag daarna weggaan.<br>
- De auto gaat binnen 30 minuten automatisch alsnog dicht.<br>
- Er hoeft hiervoor niet naar de achterwacht gebeld te worden.<br>
- Laat de huurder de auto nooit met de sleutel sluiten, maar laat de deuren open!<br>
-  Graag wel een notitie maken in de reservering.`
    },

    resource && {
      title: "Een huurder na een rit toegang geven",
      content: `
Wil je een auto openen terwijl de rit al afgelopen is? Je kunt een huurder alleen buiten een rit toegang geven voor de volgende zaken:<br>
- Een elektrische auto (opnieuw) aan een laadpaal koppelen / opladen / aansluiten.<br>
- Een auto op de vaste parkeerplek zetten.<br>
- De verlichting van de auto uitzetten.<br>
- Het raam van een auto sluiten.<br>
- Als de huurder spullen vergeten is uit de auto.<br>

Klik op de knop [Noodcommando] om een auto te openen na een rit.`
    },

    // Vragen over starten
    // =============

    resource && resource.model !== "Aygo" && {
      title: "De auto start niet",
      content: `
Lukt het de huurder niet om de auto te starten / de motor te laten lopen?<br>
- Klik links op de knop [Starten] voor hulp.<br>
- <strong>Controleer goed de melding die bovenaan staat bij [Starten]</strong>, vaak is de startblokkering ingeschakeld. Vraag de huurder de sleutel uit het contact te halen en open de auto met de knop [Openen]. De auto zou dan moeten starten.<br>
- Werken alle stappen bij [Starten] niet? Bel de pechhulp <strong>alleen</strong> als je alle stappen hebt doorlopen.`
        },

    resource && resource.model === "Aygo" && {
      title: "De Toyota Aygo start niet",
      content: `
Lukt het de huurder niet om de auto te starten / de motor te laten lopen?<br>
- <strong>Controleer of de huurder eerst de koppeling intrapt en daarna pas de start/stop-knop indrukt.</strong><br>
- De koppeling moet tot de bodem ingetrapt worden voor de auto gestart kan worden met de start/stop-knop.<br><br>
- Werkt dit niet? Klik dan links op de knop [Starten] voor andere oorzaken.<br>
- Controleer goed de <strong>melding die bij [Starten] bovenaan staat</strong>, vaak is de startblokkering ingeschakeld. Vraag de huurder de sleutel uit het contact te halen en open de auto met de knop [Openen]. De auto zou dan moeten starten.<br>
- Werken alle stappen bij [Starten] niet? Bel de pechhulp alleen als je alle stappen hebt doorlopen.`
        },

    resource && resource.locktype === "chipcard" && {
      title: "Hoe koppel ik een nieuwe OV-chipkaart?",
      content: `
Gebruikt de huurder voor de eerste keer een OV-chipkaart / chip card / chipcard?<br>
Volg dan onderstaande stappen:<br>
- De huurder houdt aan het begin van de huurperiode de OV-chipkaart voor de lezer achter het voorraam.<br>
- De huurder ontvangt automatisch binnen enkele seconden een sms.<br>
- Vraag de huurder om de sms met 'Ja' te beantwoorden.<br>
- De OV-chipkaart wordt gekoppeld en de auto opent binnen 15 seconden.<br>
- Daarna kan de auto gestart worden met de sleutel die in het dashboardkastje ligt.<br><br>
- <strong>Lukt het een huurder niet om de auto met een OV-chipkaart te openen?</strong><br>
- Klik op de knop [Openen] om de auto op afstand te openen en de startblokkering eraf te halen.`
        },

    // Vragen over een reservering
    // =============

    resource && {
      title: "Het beëindigen van een rit lukt niet",
      content: `
- Als een huurder een rit wilt inkorten / beëindigen / stoppen, dan kan dat met maximaal 1 of 2 uur (afhankelijk van het abonnement).<br>
- De huurder kan dit zelf doen door de lopende rit te beëindigen in de MyWheels app of website.<br>
- Jij kunt dit doen door op de knop [Beëindigen] te drukken.
- De status van de rit op de ritpagina is dan Beëindigd.<br><br>
- Soms loopt een rit nog door / is de rit nog lopend, omdat het inkorten met maximaal 1 of 2 uur kan.<br>
- Het beëindigen is dan wel gelukt.<br>`
    },

    resource && {
      title: "Een rit korter dan 1 uur maken",
      content: `
Een nieuwe rit moet minimaal 1 uur duren.<br>
Als een huurder de auto eerder wil terugbrengen, kan de rit ingekort / gestopt / beëindigd worden.<br>
Een rit korter dan 1 uur maken, kan niet.`
    },

    resource && {
      title: "Het verlengen van een rit lukt niet",
      content: `
- Een huurder kan tot 30 minuten na afloop een rit verlengen.<br>
- Is de rit 30 minuten geleden al afgelopen? Dan moet de huurder een nieuwe rit maken en eventueel betalen. Een nieuwe rit moet minimaal 1 uur duren.<br>
- Verlengd de huurder de rit voor meer dan 2 uur? Dan is bijbetalen soms nodig. Dit kan via de MyWheels app of website.`
    },

    resource && {
      title: "De huurder heeft geen geld om de rit te verlengen",
      content: `
Heeft de huurder onvoldoende saldo om een rit te verlengen maar kan hij of zij niet bijbetalen per iDEAL en moet de auto nog teruggebracht worden?<br>
- Klik op de knop [Verlengen] en daarna op de knop [Twee uur extra boeken] om een nieuwe reservering te maken.<br>
- De huurder moet dan direct terug naar de beginlocatie rijden om de auto in te leveren.<br>
- Open de auto met de knop [Open] om de startblokkering van de auto te halen.`
    },

    resource && {
      title: "Wanneer mag ik een rit annuleren?",
      content: `
Je kunt een rit annuleren via de knop [Annuleren].<br><br>
Let op:<br>
- Is de rit nog niet begonnen? Dan moet de huurder zelf annuleren.<br>
- Is de rit al begonnen? Annuleer de rit alleen als de huurder nog niet gereden heeft.<br>
- Annuleer de rit niet om hem te beëindigen / stoppen / inkorten.<br>
- Maak een notitie in de rit na het annuleren waarom de rit is geannuleerd.`
    },

    resource && {
      title: "Foutmelding bij het reserveren",
      content: `
Als een huurder al een auto heeft gereserveerd voor vandaag, en vandaag nog een andere auto wil huren, krijgt diegene soms de volgende foutmelding te zien:<br>
<strong>Je hebt vandaag al een andere auto gereserveerd.</strong><br><br>
Dit betekent dat de huurder vandaag niet nog een andere auto kan huren.<br>
De huurder kan mailen naar support@mywheels.nl om dit wel mogelijk te maken.<br>
We reageren op de mail tijdens werkdagen van 09:00 tot 17:00 uur.<br>`
    },

    resource && {
      title: "De kortingscode werkt niet",
      content: `
- Heeft een huurder een kortingscode ontvangen maar lukt het niet om die toe te voegen aan de rit?<br>
- Dit is niet urgent, en kunnen we nu niet oplossen.<br>
- Maak een notitie bij de rit, en vraag de huurder een mail te sturen naar support@mywheels.nl.<br>
- Als de kortingscode geldig is, krijgt de huurder achteraf de korting alsnog.`
    },

    resource && {
      title: "Hoe reserveert een beheerder een auto?",
      content: `
Als een beheerder van een auto deze gratis wil reserveren / boeken / huren, kan hij of zij een rit van minimaal 1 uur maken op het MyWheels Free contract / abonnement.<br>
- De rit is dan gratis.
- Graag de beheerder vragen om een notitie bij het reserveren te maken.

Lukt het niet? Met de knop [Noodcommando] kun je de auto zonder een rit openen.`
    },

    resource && {
      title: "De huurder kan de auto niet op tijd terugbrengen",
      content: `
Kan een huurder een auto niet op tijd terugbrengen naar de vaste parkeerplek of zone?<br>
- Vraag de huurder de rit verlengen, eventueel is bijbetalen nodig.<br>
- Lukt het verlengen van de rit niet omdat de auto niet beschikbaar is? Boek dan volgende huurders om.<br>
- Klik hiervoor in de ritpagina op de balk [Komende ritten] en bij de volgende rit(ten) op [Omboeken].<br>
- Bel de volgende huurder op om hem of haar te informeren over het omboeken.<br>
- Kunnen toekomstige huurders niet omgeboekt worden? Dan moet de huidige huurder de auto op tijd terugbrengen.<br>
- Vraag de huidige huurder de rit alsnog te verlengen.<br>
- Een rit kan verlengd worden maximaal 30 minuten na het einde van de rit. Daarna moet de huurder een nieuwe reservering maken.`
    },

    resource && {
      title: "Hoe blokkeer ik als Interswitch agent een auto",
      content: `
Druk op de knop [Blokkeer] om een auto te blokkeren. Let op: tussen elke rit moet 2 uur tijdsverschil zitten (Corona maatregel).<br>
Je kunt een auto blokkeren vanwege de volgende zaken:<br>
- De auto heeft onrijdbare schade.<br>
- De sleutel van de auto is kwijt.<br>
- De auto heeft een lekke band.<br>
- De auto is weggesleept.`
    },

    // Vragen over de Agyo's
    // =============

    resource && resource.model === "Aygo" && {
      title: "Waar vind ik de sleutel?",
      content: `
De sleutel ligt in het dashboardkastje.<br>
De sleutel heb je niet nodig om te starten, je gebruikt hiervoor de start/stopknop.<br>
Gebruik tijdens de rit de sleutel om de auto te openen en te sluiten.<br>
Pas aan het einde van je rit sluit je de auto met de MyWheels app of OV-chipkaart.`
    },

    // Vragen over de Citroëns
    // =============

    resource && resource.model === "C3" && {
      title: "Hoe werkt de cruisecontrol?",
      content: `
De cruisecontrol bedien je met de schakelaar links achter het stuur.<br>
1. Draai het wieltje naar beneden toe (cruisecontrol) of naar boven toe (snelheidsbegrenzer).<br>
2. Met de knopjes op de achterkant kun je de snelheid verhogen of verlagen.<br>
3. Draai het wieltje naar het midden om de cruisecontrol of snelheidsbegrenzer uit te schakelen.
`
    },

    resource && resource.model === "C1" && {
      title: "Hoe werkt de cruisecontrol / snelheidsbegrenzer?",
      content: `
De auto heeft geen cruise control, maar een snelheidsbegrenzer.<br>
- De snelheidsbegrenzer voorkomt dat de auto de, door de bestuurder ingestelde maximumsnelheid, overschrijdt.<br>
- De ingestelde maximumsnelheid blijft na het afzetten van het contact opgeslagen in het geheugen.<br>
- Wil je dit uitschakelen? Haal de kleine schakelaar, rechts onder het stuur, naar je toe.<br><br>
De cruisecontrol bedien je met de schakelaar links achter het stuur.
1. Draai het wieltje (1) naar beneden toe (cruisecontrol) of naar boven toe (snelheidsbegrenzer).
2. Met de knopjes op de achterkant (2) kun je de snelheid verhogen of verlagen.
3. Draai het wieltje (1) naar het midden om de cruisecontrol of snelheidsbegrenzer uit te schakelen.`
    },

    resource && resource.model === "C1" && {
      title: "Het lampje voor de bandspanning brandt",
      content: `
Brandt bij een Citroën C1 het bandenspanningslampje (zie foto) op het dashboard / display van de auto?<br>
<br>
Vraag de huurder de banden op te pompen tijdens een tankbeurt.<br>
- Er gaat 2.3 bar aan lucht in de banden.<br>
- Na het oppompen van de banden reset de huurder het bandenspanningslampje via het knopje, links, in het dashboardkastje.`,
      images: [
        "/backoffice/assets/img/handleiding/bandenspanning.jpg",
      ]
    },

    resource && resource.model === "C3" && {
      title: "Het lampje voor de bandspanning brandt",
      content: `
Brandt bij een Citroën C3 het bandenspanningslampje (zie foto) op het dashboard / display van de auto?<br>
<br>
Vraag de huurder de banden op te pompen tijdens een tankbeurt.<br>
- Er gaat 2.3 bar aan lucht in de banden.<br>
- Na het oppompen van de banden reset de huurder het bandenspanningslampje via het navigatiescherm in het menu onder “Besturingsfuncties”.<br>
- Kies voor “Bandenspan.contr.”.`,
      images: [
        "/backoffice/assets/img/handleiding/bandenspanning.jpg",
      ]
    },

    resource && resource.model === "C1" && {
      title: "Hoe open ik de tankklep?",
      content: `
De tankklep van de Citroën C1 open je via de hendel links van het stuur.<br>
De pincode / tankcode van de tankpas is ${resource.fuelCardCode}.<br>
De auto rijdt op Euro95 / E10 - brandstof / benzine.<br><br>`
    },

    resource && resource.model === "C3" && {
      title: "Hoe open ik de tankklep?",
      content: `
De tankklep van de Citroën C3 open je met de autosleutel, die ligt in het dashboardkastje.<br>
De pincode / tankcode van de tankpas is ${resource.fuelCardCode}.<br>
De auto rijdt op Euro95 / E10 - brandstof / benzine.<br><br>`
    },

    // Vragen over andere brandstofauto's
    // =============

    resource && resource.model !== "Aygo" && resource.fuelType !== "elektrisch" && {
      title: "Waar vind ik de sleutel?",
      content: `
De sleutel van de auto ligt in het dashboardkastje.<br>
De huurder kan de sleutel tijdens de rit gebruiken om de auto te openen en te sluiten.<br>
Pas aan het einde van de rit sluit de huurder de auto met de MyWheels app of OV-chipkaart.`
    },

    // Vragen over parkeren
    // =============

    resource && resource.parkingType === 'parking_spot' && {
      title: "De huurder kan de auto niet vinden",
      content: `
Kan de huurder bij het ophalen van de auto deze niet vinden / is de auto kwijt?<br>
Deze auto heeft een vaste parkeerplek aan de ${resource.location} ${resource.streetNumber}.<br>
- Met de knop <strong>[Locatie]</strong> kun je de huidige locatie van de auto opvragen.<br>
- Geef aan de huurder door waar de auto precies staat.`
    },

    resource && resource.parkingType === 'zone' && {
      title: "De huurder kan de auto niet vinden",
      content: `
Kan de huurder bij het ophalen van de auto deze niet vinden / is de auto kwijt?<br>
Deze auto heeft geen vaste parkeerplek maar een zoneplek in de zone ${resource.location}.<br>
- Met de knop <strong>[Locatie]</strong> kun je de huidige locatie van de auto opvragen.<br>
- Geef aan de huurder door waar de auto precies staat.`
    },

    resource && resource.parkingType === 'parking_spot' && {
      title: "Waar brengt de huurder auto terug?",
      content: `
Deze auto heeft een vaste parkeerplek aan de ${resource.location} ${resource.streetNumber}.<br>
De huurder brengt de auto aan het einde van de rit terug naar deze plek.<br>
Is de parkeerplek bezet?<br>
- Vraag de huurder om de auto op een openbare parkeerplek in de buurt te zetten.<br>
- Dit mag <strong>geen gehandicapten plek of parkeerplek met een wit kruis</strong> zijn.<br>
- De huurder mag niet op een andere autodate parkeerplek dan van MyWheels staan (dus geen autodate plek van Greenwheels).<br>

<strong>Informatie over het wegslepen van foutgeparkeerde auto:</strong><br>
${resource.remark}`
    },

    resource && resource.parkingType === 'parking_spot' && {
      title: "De vaste parkeerplek van de auto is bezet",
      content: `
Deze auto heeft een vaste parkeerplek aan de ${resource.location} ${resource.streetNumber}.<br>
Is de parkeerplek bij terugkomst bezet door een foutparkeerder / andere auto?<br>
- Vraag de huurder om de auto op een openbare parkeerplek in de buurt te parkeren.<br>
- Dit mag <strong>geen gehandicapten plek of parkeerplek</strong> met een wit kruis zijn.<br>
- De huurder mag niet op een andere autodate parkeerplek dan van MyWheels staan (dus geen autodate plek van Greenwheels).<br>
<br>
Informatie over het <strong>wegslepen van foutgeparkeerde auto</strong>:<br>
- Vraag de huurder om het kenteken en automerk van de foutparkeerder.<br>
- Maak een notitie voor de volgende werkdag.<br>
- Kijk in de opmerking hierover waar je heen kunt bellen om de foutparkeerde te melden:
<br><br>
<i>${resource.remark}</i>`
    },

    resource && resource.fuelType !== "elektrisch" && resource.parkingType === 'zone' && {
      title: "Waar brengt de huurder auto terug?",
      content: `
Deze auto heeft geen vaste parkeerplek maar een zoneplek.<br>
De huurder mag de auto overal in de zone parkeren op een openabre parkeerplek.<br>
De huurder vindt de zone in de MyWheels app of op de website.<br>
- De auto mag <strong>niet</strong> op een autodate parkeerplek, invaliden parkeerplek of een andere parkeerplek met een wit kruis staan.`
    },

    resource && resource.fuelType === "elektrisch" && resource.parkingType === 'zone' && {
      title: "Waar brengt de huurder auto terug?",
      content: `
Deze auto heeft geen vaste parkeerplek maar een zoneplek.<br>
De auto mag overal in de zone parkeren.<br>
De huurder vindt de zone in de MyWheels app of op de website.<br>
- Is de accu minder dan 80% dan aan een laadpaal.<br>
- Heeft de accu nog 80% of meer stroom, dan op een vrije parkeerplaats zonder laadpaal.<br>
- Parkeert een huurder bij een laadpaal? Dan is deze verplicht de auto ook aan te sluiten voor het opladen.<br><br>
- De auto mag <strong>niet</strong> op een autodate parkeerplek, invaliden parkeerplek of een andere parkeerplek met een wit kruis staan.`
    },

    // Vragen over elektrische auto's
    // =============


    resource && resource.fuelType === "elektrisch" && {
      title: "Waar vind ik de (laad)sleutel?",
      content: `
Wil een huurder de auto opladen?
- De sleutel en laadsleutel liggen in het dashboardkastje.<br>
- Soms ligt de sleutel in de middenconsole, tussen de stoelen.<br>
- De blauwe laadsleutel van newmotion zit aan de sleutel vast (zie foto).<br>
- De zwarte druppel aan de sleutel is geen laadsleutel, het moet een blauwe laadsleutel van newmotion zijn (zie foto).<br><br>
- De sleutel heb je niet nodig om te starten.<br>
- De huurder gebruikt tijdens de rit de sleutel om de auto te openen en te sluiten.<br>
- Pas aan het einde van de rit sluit de huurder de auto met de MyWheels app of OV-chipkaart.<br><br>
Let op: sommige auto's hebben nog een losse Vandebron laadpas, deze ligt los in het dashboardkastje of in de middenconsole.<br>
Dit is voornamelijk het geval bij Nissan Leafs in Den Haag, Rotterdam, Brabant en Limburg.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_sleutel.png",
      ]
    },

    resource && resource.fuelType === "elektrisch" && {
      title: "De huurder is de (laad)sleutel kwijtgeraakt",
      content: `
Is de huurder onderweg de laadsleutel of laadpas kwijt geraakt?<br>
De huurder kan dan de Vattenfall InCharge app downloaden en hiermee de laadpaalsessie starten en beindigen.<br>
Laden zal dan op eigen kosten zijn, en kan via de app alleen via creditcard.<br>
De huurder mag bij terugkomst op de standplaats de auto <strong>niet<strong> aan een laadpaal koppelen.<br>
Vraag de huurder naar ons te bellen om bij terugkomst de auto te blokkeren.<br>`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_sleutel.png",
      ]
    },

    resource && resource.fuelType === "elektrisch" && resource.model === "Leaf" && {
      title: "Hoe sluit ik een Nissan Leaf?",
      content: `
Wil een huurder een rit in een Nissan Leaf stoppen en de auto afsluiten?
- Vraag de huurder of hij de auto in de zone geparkeerd heeft.<br>
- Zorg dat de auto in stand **P** staat.<br>
- Zet de auto op de handrem (het kleine voetpedaal naast het rempedaal).<br>
- Zet de auto uit door op de startknop te drukken.<br>
- Leg de sleutel met laadsleutel terug in het dashboardkastje.<br>
- Koppel de auto aan de laadpaal (zie instructies hieronder).<br>
- Sluit de auto via de MyWheels app of OV-chipkaart.<br>
- Controleer of de deuren op slot zijn.`
    },

    resource && resource.fuelType === "elektrisch" && {
      title: "Hoe ontkoppel ik de laadkabel?",
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
      title: "Moet de laadkabel meegenomen worden?",
      content: `
Ja, de laadkabel moet altijd meegenomen worden.<br>
De huurder mag niet zonder de laadkabel vertrekken.`
    },

    // Vragen over de Nissan Leaf
    // =============

    resource && resource.fuelType === "elektrisch" && resource.model === "Leaf" && {
      title: "Hoe start ik een Nissan Leaf?",
      content: `
1. Haal de handrem eraf *(het kleine voetpedaal naast het rempedaal)*. Als de handrem is ingetrapt, zit deze tegen de bodem aan. Trap deze kort in en laat hem naar boven komen.<br>
2. Houd de normale rem ingetrapt.<br>
3. Druk op de startknop (rechts van het stuur). Het display van de auto gaat aan en het groene auto symbool brandt, je hoort een melodietje.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_startknop.jpg",
        "/backoffice/assets/img/handleiding/nissan_leaf_handrem.png",
      ]
    },

    resource && resource.fuelType === "elektrisch" && resource.model === "Leaf" && {
      title: "Hoe rijd ik in een Nissan Leaf?",
      content: `
1. Haal de handrem eraf *(het kleine voetpedaal naast het rempedaal)*. Als de handrem is ingetrapt, zit deze tegen de bodem aan. Trap deze kort in en laat hem naar boven komen.<br>
2. Houd de normale rem ingetrapt.<br>
3. Na het starten zet je de versnellingshendel in stand **D**. De standen zijn:<br>
  - Stand D = vooruit (naar links + beneden)<br>
  - Stand R = achteruit (naar links + naar voren)<br>
  - Stand N = neutraal / vrij (naar links)<br>
  - Stand P = parkeerstand (knopje bovenop)<br>
  - Stand B = voor het afdalen van hellingen (schuin naar links)<br>
4. Zodra je de rem loslaat in stand **D**, **B** of **R**, begint de auto te rijden.<br>
5. Op het dashboard zie je hoeveel kilometer je nog kunt rijden.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_pook.png",
      ]
    },

    resource && resource.fuelType === "elektrisch" && resource.model === "Leaf" && {
      title: "Hoe laad ik een  Nissan Leaf op?",
      content: `
Vraag de huurder volgende stappen te volgen om het opladen te starten:
- Druk in de auto op de ontgrendelknop (links onder het stuur of de onderste knop van de sleutel) om de laadklep van de auto te openen.<br>
- Steek de laadkabel in de auto in de **rechter** aansluiting (aan de voorkant van de auto).<br>
- Steek de andere kant van de kabel in de laadpaal.<br>
- Houd de blauwe laadsleutel (aan de sleutel) drie seconden voor het leesvlak van de laadpaal (<strong>niet de zwarte sleutelhanger</strong>).<br>
- De blauwe lampjes aan de binnenkant van de auto, op het dashboard, beginnen te knipperen als de kabel juist is aangesloten.<br />
  **Verlaat de auto nooit zonder deze aan te sluiten aan de laadpaal!**<br><br>

Lukt bovenstaande niet? Controleer de volgende zaken:<br>
- De laadkabel dient in de auto én de laadpaal aangesloten te zijn.<br>
- De laadsleutel (deze zit aan de sleutel, zie foto) dient langs de lezer op de laadpaal gehaald te worden.<br>
- Sommige auto's hebben nog een losse VandeBron laadpas, ter grootte van een chipkaart.<br>
- Indien de paal niet geactiveerd wordt, verzoek de huurder het opnieuw te proberen, soms is het activeren lastig. Beweeg de laadpas langs de lezer / houdt hem gedurende een aantal seconden op verschillende plekken. <br>
- Indien de laadpaal niet geactiveerd wordt / storing (rood licht) geeft, verzoek de huurder naar een andere laadpaal te rijden, binnen de zone van de auto, en de auto daar aan te sluiten.<br>
- Laat de huurder bevestigen dat de auto laadt, door te controleren of de lampjes op het dashboard (onder het raam) gaan lopen (zie foto). Deze zijn goed zichtbaar als je voor de auto staat.<br>`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_controle_opladen.png",
        "/backoffice/assets/img/handleiding/nissan_leaf_opladen.png",
      ]
    },

    resource && resource.fuelType === "elektrisch" && resource.model === "Leaf" && {
      title: "De elektrische auto laadt niet op",
      content: `
Heeft een huurder een sms of push notificatie ontvangen dat de auto niet oplaadt / laad?<br>
Je kunt met de knop <strong>[Noodcommando]</strong> de auto openen voor een huurder als de rit al afgelopen is zodat de huurder de auto alsnog kan opladen.<br><br>

Vraag de huurder volgende stappen te volgen om het opladen te starten:
- Druk in de auto op de ontgrendelknop (links onder het stuur of de onderste knop van de sleutel) om de laadklep van de auto te openen.<br>
- Steek de laadkabel in de auto in de **rechter** aansluiting (aan de voorkant van de auto).<br>
- Steek de andere kant van de kabel in de laadpaal.<br>
- Houd de blauwe laadsleutel (aan de sleutel) drie seconden voor het leesvlak van de laadpaal (<strong>niet de zwarte sleutelhanger</strong>).<br>
- De blauwe lampjes aan de binnenkant van de auto, op het dashboard, beginnen te knipperen als de kabel juist is aangesloten.<br />
  **Verlaat de auto nooit zonder deze aan te sluiten aan de laadpaal!**<br><br>

Lukt bovenstaande niet? Controleer de volgende zaken:<br>
- De laadkabel dient in de auto én de laadpaal aangesloten te zijn.<br>
- De laadsleutel (deze zit aan de sleutel, zie foto) dient langs de lezer op de laadpaal gehaald te worden.<br>
- Sommige auto's hebben nog een losse VandeBron laadpas, ter grootte van een chipkaart.<br>
- Indien de paal niet geactiveerd wordt, verzoek de huurder het opnieuw te proberen, soms is het activeren lastig. Beweeg de laadpas langs de lezer / houdt hem gedurende een aantal seconden op verschillende plekken. <br>
- Indien de laadpaal niet geactiveerd wordt / storing (rood licht) geeft, verzoek de huurder naar een andere laadpaal te rijden, binnen de zone van de auto, en de auto daar aan te sluiten.<br>
- Laat de huurder bevestigen dat de auto laadt, door te controleren of de lampjes op het dashboard (onder het raam) gaan lopen (zie foto). Deze zijn goed zichtbaar als je voor de auto staat.<br>`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_controle_opladen.png",
        "/backoffice/assets/img/handleiding/nissan_leaf_opladen.png",
      ]
    },

    resource && resource.fuelType === "elektrisch" && resource.model === "Leaf" && {
      title: "Hoe werkt het snelladen met een Nissan Leaf?",
      content: `
Wil een huurder onderweg snelladen met de elektrische Nissan Leaf bij een snellaadstation?<br>
- De Nissan Leaf kan snelladen bij speciale snellaadstations van FastNed of Allego via de ChadeMo-stekker.<br>
- Deze stekker zit niet in de auto, maar hangt bij de snellaadstations, en moet worden aangesloten in de zwarte klep aan de voorkant.<br>
- Een snellaadstation kun je vinden via de website www.oplaadpalen.nl, filter op 'snel' om een snellaadstation te vinden op de route.<br>
- De huurder kan laadsleutel/laadpas gebruiken om bij het laadstation het opladen te starten.<br>
- De lampjes op het dashboard gaan knipperen als het opladen gestart is.<br>
- De auto laadt binnen 25 minuten op tot 80% van de accu.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_controle_opladen.png",
        "/backoffice/assets/img/handleiding/nissan_leaf_opladen.png",
      ]
    },

    resource && resource.fuelType === "elektrisch" && resource.model === "Leaf" && {
      title: "Hoe weet ik of een Nissan Leaf oplaadt?",
      content: `
De blauwe lampjes aan de binnenkant van de auto, op het dashboard, beginnen te knipperen / lopen als de kabel juist is aangesloten.<br>
Deze zijn goed zichtbaar als je voor de auto staat.<br>
Het opladen aan de laadpaal is dan gestart.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_controle_opladen.png",
      ]
    },

    resource && resource.fuelType === "elektrisch" && resource.model === "Leaf" && {
      title: "Hoe haal ik een Nissan Leaf van de handrem?",
      content: `
De handrem is bij een Nissan Leaf een klein voetpedaal links naast het rempedaal.<br>
- Als de handrem is ingetrapt, zit deze tegen de bodem aan.<br>
- Trap deze kort in en laat hem naar boven komen.`,
      images: [
        "/backoffice/assets/img/handleiding/nissan_leaf_handrem.png"
      ]
    },

    // Vragen over algemene zaken omtrent een rit
    // =============

    resource && {
      title: "De voorruit van de auto is beslagen",
      content: `
Zijn de ramen van de auto beslagen / vol condens?
- Om de ramen snel weer “droog” te krijgen, zet je de airconditioning aan.<br>
- Richt de blazers op de voorruit en in een hoge stand.<br>
- Zet de verwarming op de warmste stand.`
    },

    resource && {
      title: "Welke extra bestuurders mogen rijden?",
      content: `
- Enkel huurders die als extra bestuurder aan de rit zijn toegevoegd, mogen rijden.<br>
- De extra bestuurders bij een rit vind je op de ritpagina (onder de rittijden). Alleen als de huurder daar staat, en de uitnodiging geaccepteerd is, mag diegen rijden.<br>
- Tijdens een rit kan een huurder geen extra bestuurders meer toevoegen.<br>
- Ook kan tijdens een rit een extra  bestuurder de uitnodiging niet meer accepteren.<br><br>
- Is het toevoegen van een extra bestuurder niet gelukt, maar woont de  extra bestuurder op hetzelfde adres als de huurder? Dan mag je toestemming geven om te mogen rijden.<br>
- Voeg dan wel een follow-up toe zodat we eventuele kosten (€1,25 per extra bestuurder) hiervoor in rekening kunnen brengen. Noteer de naam van de extra bestuurder.`
    },

    resource && {
      title: "De betaling is niet verwerkt",
      content: `
Heeft de huurder betaald, maar is het bedrag niet bijgesschreven in het saldo / rijtegoed?<br>
- Vaak heeft de huurder betaald vanaf een rekeningnummer / IBAN-nummer dat niet op zijn of haar naam staat. Of het is een en/of rekening.<br>
- De achternaam van het account moet volledig voorkomen in de tenaamstelling van de rekening.<br>
- Als dit het geval is, zie je dit op de ritpagina in het middelste blok (waar ook de naam van de huurder staat) de volgende melding staan: <i>De tenaamstelling van de rekeninghouder, ..., komt niet overeen met de achternaam, .... Daarom kunnen we de betaling nog niet verwerken.</i><br>
- De huurder kan via de website MyWheels.nl een betaling van 1 cent doen van een andere rekening op zijn of haar naam.<br>
- Het bedrag wordt dan wel bijgeschreven in het account en de rit springt op betaald.`
    },

    // Vragen over algemene autozaken
    // =============

    resource && {
      title: "Hoe klap ik de buitenspiegels in?",
      content: `
Een huurder kan de spiegels inklappen door deze naar binnen te duwen.
Dit hoeft niet binnenin de auto gedaan te worden.`
    },

    resource && resource.fuelCardCode && {
      title: "Hoe tank ik?",
      content: `
Als de tank voor minder dan een kwart vol zit, is het tijd om bij te tanken.<br>
Deze auto heeft een tankpas waarmee een huurder kosteloos kan tanken.<br>
Deze ligt in het dashboardkastje.<br>
De pincode / tankcode van de tankpas is ${resource.fuelCardCode}.<br>
De auto rijdt op Euro95 / E10 - brandstof / benzine.<br><br>

Is de tankpas kwijt of werkt de tankpas niet? Vraag de huurder dan zelf te betalen.<br>
De tankbon kunnen ze mailen naar support@mywheels.nl.`
    },

    resource && {
      title: "De auto heeft een lekke band",
      content: `
Heeft de huurder een lekke of kapotte band / velg?<br>
Bel dan de pechulp:<br>
${resource.roadAssistance}<br><br>

- Dring er bij de pechhulp op aan dat een lekke band onder de dekking van de pechhulp valt.<br>
- Is dat niet zo? Geef dan aan dat ze MyWheels de factuur mogen sturen.<br>
- Blijf er op aan dringen dat we hulp krijgen.<br><br>

De pechhulp arriveert binnen 30 tot 45 minuten bij de auto.<br>
Ze zullen eerst proberen de huurder weer op weg te helpen.<br>
Mocht dit niet lukken, zullen ze de auto meenemen en de huurder naar de gewenste locatie in Nederland brengen.<br>
In het buitenland heeft de huurder recht op vervangend vervoer.<br>
De berging en sleepkosten zijn meeverzekerd via de ritverzekering, de huurder hoeft hiervoor niets te betalen.`
    },

    resource && {
      title: "De huurder heeft pech / lege accu",
      content: `
Heeft de huurder pech of een lege accu?<br>
- Controleer altijd of de <strong>startblokkering</strong> niet ingeschakeld is door de auto te openen via de knop [Openen]. De sleutel moet uit het contact zijn. De auto zou daarna moeten starten.<br>
- Start de auto daarna nog steeds niet? Klik dan op de knop [Pech] om de pechhulp in te schakelen.<br><br>
Branden er rode (alarm)lampjes op het dashboard / display van de auto?<br>
- Vraag de huurder de auto te starten.<br>
- Blijven de rode waarschuwingslampjes branden? Dan mag de huurder niet verder rijden.<br>
- Schakel de pechhulp in via de knop [Pech].`
    },

    resource && {
      title: "De huurder heeft een ongeluk gehad",
      content: `
Was de huurder met een auto betrokken bij een ongeluk / aanrijding / schade?<br>
- Klik op de knop [Schade] om de huurder te helpen.`
    },

    resource && resource.boardcomputer === "myfms" && {
      title: "De boordcomputer maakt een piepend geluid",
      content: `
Maakt de chipkaartlezer / boordcomputer / kastje aan de voorruit een piepend geluid?<br>
Laat de huurder een OV-chipkaart voor de chipkaartlezer houden.`
    },

    {
      title: "Het raam van een auto staat open",
      content: `
Staat het raam van een auto open / op een kier?<br>
- Bel dan eerst de vorige huurder door op de knop [Vorige] te klikken. Spreek indien mogelijk een voicemail in.<br>
- Geen gehoor? Bel dan de beheerder van de auto om te vragen om het raam dicht te doen. Spreek indien mogelijk een voicemail in.<br>
- Geen gehoor? Wacht dan tot de vorige huurder of de beheerder terugbelt.

Met de knop [Noodcommando] kun je een auto openen voor een huurder of beheerder.`
    },

    // Vragen over account
    // =============

    {
      title: "De huurder kan niet inloggen",
      content: `
Kan een huurder niet inloggen op de website?
- Vraag de huurder om een vinkje te zetten voor "Ik ben geen robot".<br><br>
Lukt het nog niet om in te loggen in de website of app?
- Vraag de huurder om een nieuw wachtwoord in te stellen via Wachtwoord vergeten.<br>
Link: https://mywheels.nl/wachtwoord-vergeten<br><br>
Kan niet inloggen in de MyWheels app voor Android of iOS?<br>
- Vraag of de huurder de laatste update van de app heeft geinstalleerd.`
    },

    {
      title: "Het account van de huurder is gelocked",
      content: `
Sinds donderdag 28 mei ontvangen huurders per mail en sms een melding als ze inloggen via een nieuw apparaat of IP-adres.<br>
Als de huurder op dat moment zelf van de MyWheels website of app gebruik maakte, is er niets aan de hand.<br><br>
Als een huurder het niet vertrouwt en via de link op [Tijdelijk blokkeren] drukt, is het account locked / gelocked / geblokkeerd / blokkade.<br>
In het account kan dan geen nieuwe reservering gemaakt worden of een lopende rit gestart / geopend worden.<br><br>
Wil je het account unlocken?<br>
Druk dan op de rode balk bovenaan een rit of persoon.`
    },

    {
      title: "Een onbekende beller",
      content: `
Belt een huurder met een onbekend of anoniem (mobiel) telefoonnummer?<br>
Dan kun je de auto helaas niet openen.<br>
Vraag de huurder te bellen met een telefoonnummer dat bij ons bekend is.`
    },

    {
      title: "Wanneer wordt een account gecontroleerd?",
      content: `
Een account wordt gecontroleerd bij het maken van een eerste reservering.<br>
Meestal wordt een account automatisch geactiveerd, de huurder dan direct op weg!<br>
Soms is handmatige controle nodig. De vaste supportmedewerkers van MyWheels doen dit op werkdagen tussen 09.00 en 17.00 uur.`
    },

    {
      title: "Waarom kan ik wel betalen maar is mijn account nog niet actief?",
      content: `
Een huurder betaalt soms een rit, ook als zijn of haar account nog niet gecontroleerd / geactiveerd is.<br>
We tonen wel een melding op de website en in de MyWheels app als dit het geval is.<br>
We controleren het account op werkdagen tussen 09:00 en 17:00 uur.<br>
Als we het account niet goedkeuren, storten we het saldo weer terug op de bankrekening van de huurder.`
    },

    {
      title: "Waarom is een account gedeactiveerd?",
      content: `
Een account kan om verschillende redenen gedeactiveerd / geblokkeerd worden.<br>
Denk aan een ongeldig rijbewijs of verkeerd ingevulde gegevens.<br>
Vraag de huurder te mailen  naar account@mywheels.nl om de reden van deactivatie op te vragen.<br>
In verband met privacy overwegingen is het niet mogelijk om hier telefonisch navraag over te doen.`
    },

    {
      title: "Problemen met de app",
      content: `
Heeft een huurder problemen met de MyWheels app voor Android of iOS / iPhone? Kan hij of zij bijvoorbeeld niet inloggen?<br>
- Vraag de huurder dan de mobiele website https://mywheels.nl te gebruiken.<br>
- Maak een notitie bij de rit wat het probleem is.`
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
        expand: true
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
