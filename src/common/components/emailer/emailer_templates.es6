
angular.module('openwheels.EMAILER_TEMPLATES', [])

.factory('EMAILER_TEMPLATES', () => {
  const in_english = [
    {
      key: "Leeg - EN",
      subject: "",
      content: ``
    },
    {
      key: "Account information - EN",
      subject: "Account information!",
      content: commonTags.stripIndent`
        Dear {{ VOORNAAM }},

        Thank you for registering at MyWheels. 

        Unfortunately, our automatic check could not verify your address. 
        Could you send us a proof of your adres, like a document with your name, address and recent date on it (not older than a month) so that we can verify your address? For example a photo or screenshot of a telephone invoice, bank statement or salary slip. The date and logo of the sender must be clearly stated on the document, we obviously do not have to see the content of the letter.

        When we receive the document we will check it and you will receive a message about your account activation.

        Please note: we only check postal items during office hours (Monday to Friday 9:00 AM - 5:00 PM).

        Thanks in advance.`
    },
  ].map(template => ({
    ...template,
    content: template.content + "\n\n" + commonTags.stripIndent`
      With kind regards,<br />
      the MyWheels Team

      **MyWheels**<br />
      Keizersgracht 264<br />
      1016 EV Amsterdam<br />
      085-7734222

      <p><img src="https://mywheels.nl/autodelen/wp-content/uploads/2019/01/mywheels_log_klein.png" /></p>` + (template.footer ? "\n\n<hr />" + template.footer : "")
  }));

  const in_dutch = [
    {
      key: "Leeg - NL",
      subject: "",
      content: ``
    },
    {
      key: "Account informatie - NL",
      subject: "Account informatie",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Hartelijk dank voor het aanmelden bij MyWheels. Leuk dat je meedoet met autodelen! 

        Onze automatische controle kon jouw adres helaas niet verifiëren. Zou je ons per mail een poststuk met jouw naam, adres en recente datum erop (niet ouder dan een maand) kunnen sturen zodat we je adres kunnen verifiëren? Bijvoorbeeld een foto of screenshot van een telefoonfactuur, bankafschrift of salarisstrookje. De datum en het logo van de afzender moeten duidelijk op de foto staan, de inhoud van de brief hoeven we uiteraard niet te zien.

        Als we het poststuk ontvangen zullen we deze controleren en zul je bericht ontvangen over jouw account.

        Let op: wij controleren alleen poststukken tijdens kantoortijden (maandag t/m vrijdag 09:00 - 17:00).

        Bij voorbaat dank.`
    },
    {
      key: "Ongeldig rijbewijs - NL",
      subject: "Account informatie",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Hartelijk dank voor het aanmelden bij MyWheels. Leuk dat je meedoet met autodelen!

        Jouw account is helaas automatisch gedeactiveerd omdat je rijbewijs ongeldig blijkt te zijn. Zou je een kopie van jouw rijbewijs willen sturen zodat we dit handmatig kunnen controleren? 

        Het is ook goed als je jouw geboortedatum + rijbewijsnummer (bij nummer 5) en de verloopdatum van het rijbewijs per mail stuurt. Wij zullen dan controleren of je jouw gegevens correct hebt ingevuld. 

        Mail gerust als je nog vragen hebt.`
    },
    {
      key: "Ongeldig rijbewijs + poststuk - NL",
      subject: "Account informatie",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Hartelijk dank voor het aanmelden bij MyWheels. Leuk dat je meedoet met autodelen!

        Jouw account is helaas automatisch gedeactiveerd omdat je rijbewijs ongeldig blijkt te zijn. Zou je een kopie van jouw rijbewijs willen sturen zodat we dit handmatig kunnen controleren? Het is ook goed als je jouw geboortedatum + rijbewijsnummer (bij nummer 5) en de verloopdatum van het rijbewijs per mail stuurt. Wij zullen dan controleren of je jouw gegevens correct hebt ingevuld. 

        Daarnaast kon onze automatische controle kon jouw adres helaas niet verifiëren. Zou je ons een poststuk met recente datum (niet ouder dan een maand) kunnen sturen zodat we je adres kunnen verifiëren? Bijvoorbeeld een foto of screenshot van een telefoonfactuur, bankafschrift of salarisstrookje. De datum en het logo van de afzender moeten duidelijk op de foto staan, de inhoud van de brief hoeven we uiteraard niet te zien.

        Mail gerust als je nog vragen hebt.`
    },
    {
      key: "Dubbel MyWheels account - NL",
      subject: "Dubbel MyWheels account",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Op {{ INSCHRIJFDATUM }} heb je een nieuw account aangemaakt bij MyWheels, terwijl je al een account hebt. Helaas is het niet mogelijk om meerdere accounts te hebben.
        Jouw nieuwe account schrijf ik daarom uit, zodat je gebruik kunt maken van het reeds bestaande account. 

        Houd daarbij rekening met het volgende:
        - De aangevraagde ritten op het nieuwe account worden geannuleerd, je zult de ritten opnieuw moeten aanvragen in jouw reeds bestaande account.
        - Eventueel betaald rijtegoed wordt z.s.m. aan je terug betaald op het bankrekeningnummer waarmee jij het hebt betaald aan ons.

        Mocht je nog vragen hebben, dan kun je deze e-mail beantwoorden.`
    },
    {
      key: "Boete - CJIB - Verlegd - NL",
      subject: "Ontvangen (verkeers)boete",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Van {{ BEGIN_BOEKING }} tot {{ EIND_BOEKING }} heb jij via MyWheels een auto gehuurd.
        Wij hebben zojuist helaas een (verkeers)boete ontvangen welke gemaakt is tijdens jouw huurperiode.

        Wij hebben het CJIB verzocht om deze boete te verleggen naar jou.
        Je zult hier t.z.t. bericht van ontvangen vanuit het CJIB om deze aan hen te voldoen.
        MyWheels heeft hiervoor € 12,50,- administratiekosten bij jou in rekening gebracht die je via [www.mywheels.nl/finance](https://mywheels.nl/finance) kunt betalen.

        Mocht je vragen hebben n.a.v. bovenstaande, kun je deze e-mail beantwoorden. We zullen je zo snel mogelijk van een reactie voorzien.`
    },
    {
      key: "Boete - Gemeente - Verlegd - NL",
      subject: "Ontvangen (verkeers)boete",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Van {{ BEGIN_BOEKING }} tot {{ EIND_BOEKING }} heb jij via MyWheels een auto gehuurd.
        Wij hebben zojuist helaas een parkeerboete ontvangen van Gemeente {{ GEMEENTE }} welke gemaakt is tijdens jouw huurperiode.

        Wij hebben de Gemeente {{ GEMEENTE }} verzocht om deze boete te verleggen naar jou. Je zult hier t.z.t. bericht van ontvangen vanuit de Gemeente om deze aan hen te voldoen. MyWheels heeft hiervoor € 12,50- administratiekosten bij jou in rekening gebracht die je via [www.mywheels.nl/finance](https://mywheels.nl/finance) kunt betalen.

        Mocht je vragen hebben n.a.v. bovenstaande, kun je deze e-mail beantwoorden. We zullen je zo snel mogelijk van een reactie voorzien.`
    },
    {
      key: "Eigen risico in rekening gebracht - NL",
      subject: "Eigen risico",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Op {{ DATUM }} heb jij in een auto gehuurd via MyWheels schade gereden.
        Deze schade is inmiddels afgehandeld en de verzekering heeft deze schade vergoed.
        Er is wel een eigen risico van toepassing voor jou. Die is oorspronkelijk € 500,- maar in jouw rit / reservering verlaagd naar € 250,- euro.

        Ik zou je willen vragen dit bedrag via een online betaling aan ons te voldoen. Hiervoor log je in op mywheels.nl, ga je in het menu naar \"Financiën\" en klik je vervolgens op rijtegoed. Daar kun je jouw openstaande bedrag voldoen.

        Mocht je nog vragen hebben n.a.v. deze e-mail, verzoek ik je om deze e-mail te beantwoorden.`
    },
    {
      key: "Schademelding - NL",
      subject: "Schademelding",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Wij hebben een schademelding ontvangen over de {{ ALIAS }}, waar jij beheerder van bent.
        Ben je wellicht in de gelegenheid een foto te maken van de situatie en deze naar ons te mailen?
        Zodat we dit bij het autodossier kunnen toevoegen, beter kunnen inschatten wat er precies aan de hand is en het verder kunnen oppakken?

        Hartelijk dank alvast.`
    },
    {
      key: "Netheidsmelding - NL",
      subject: "Netheidsmelding",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Wij hebben een netheidsmelding ontvangen over de {{ ALIAS }}, waar jij beheerder van bent.
        De melding van de huurder is: 

        Ben je wellicht in de gelegenheid om dit te controleren en de auto, indien nodig, schoon te maken?
        Het bonnetje van de wasstraat kun je naar ons opsturen.

        Hartelijk dank alvast.`
    },
    {
      key: "Tenaamstellingscheck - NL",
      subject: "Tenaamstelling komt niet overeen",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Welkom bij MyWheels, leuk dat je lid bent geworden!

        Tijdens het aanmelden bij MyWheels en het reserveren van een auto controleren wij alle gegevens. 
        Bij deze controle blijkt dat de tenaamstelling van het rekeningnummer waarmee jij een betaling hebt gedaan niet (volledig) overeenkomt met de naam die is opgegeven in jouw account. We hebben de betaling daarom nog nog niet kunnen verwerken. 

        Om dit verder voor je te kunnen oppakken, kun je het volgende doen:
        - Om je identiteit te kunnen verifiëren, vragen we je per iDEAL 0,01 euro te betalen van een rekening op jouw naam. Zodra dit gelukt is, verwerken we automatisch de betaling van de rit. Dit doe je via de betaalknop in de e-mail die je eerder hebt ontvangen of [klik hier](https://mywheels.nl/vouchers). _Let op! Dit doe je dus met een andere rekening, op jouw naam._
        - Betreft het een rekening op naam van een bedrijf? Beantwoord dan deze e-mail met een kopie KvK-uittreksel.
        - Betreft het een gezamenlijke rekening? Beantwoord dan deze e-mail met een kopie rijbewijs van de andere rekeninghouder. Of maak alsnog via iDEAL 0,01 euro over van een rekening op jouw naam door [hier te klikken](https://mywheels.nl/vouchers). _(Burgerservicenummer (BSN) mag je uiteraard afschermen als je een kopie rijbewijs stuurt)._

        We zien de gegevens graag tegemoet. Alvast bedankt!`
    },
    {
      key: "Auto - Deactivatie ivm hoger risico - NL",
      subject: "Jouw auto is gedeactiveerd",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Je biedt jouw auto aan op MyWheels. Vanwege een verhoogd risico op misbruik van jouw auto door huurders, hebben we jouw auto vandaag gedeactiveerd. Jouw auto is daardoor niet meer vindbaar op MyWheels. Hiermee willen we voorkomen dat huurders schade rijden in jouw auto of voor verkeersboetes zorgen.

        Mail gerust als je nog vragen hebt.`
    },
    {
      key: "Visie autodelen - NL",
      subject: "Visie autodelen",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Hartelijk dank voor jouw aanmelding bij MyWheels.<br />
        Helaas kunnen wij jouw account niet activeren omdat jouw type huurverzoek niet in lijn ligt met onze visie op autodelen.

        MyWheels heeft de ambitie om met autodelen het aantal auto's in Nederland terug te dringen van 8 naar 1 miljoen in 2030. Daarbij stimuleren wij autodelen met mensen uit de buurt. Ons idee bij autodelen is dan ook dat autogebruikers bij elkaar in de buurt worden verbonden en hierdoor samen auto's in de buurt met elkaar kunnen delen met de gedachte dat er uiteindelijk minder auto's in de straten zullen staan hierdoor.

        Mail gerust als je nog vragen hebt.`
    },
    {
      key: "Extra rjibewijs controle - NL",
      subject: "Accountcontrole",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Hartelijk dank voor het aanmelden bij MyWheels. Leuk dat je mee wilt doen autodelen!

        Helaas is het onze automatische controle niet gelukt om jouw account en bijbehorend rijbewijs te verifiëren.<br />
        Om een handmatige controle te kunnen uitvoeren op jouw account, verzoeken we je een kopie van jouw rijbewijs te sturen samen met een recent poststuk.

        Met een recent poststuk bedoelen wij een foto of screenshot van bijvoorbeeld een telefoonfactuur, bankafschrift of salarisstrookje.<br />
        De datum (niet ouder dan één maand) en het logo van de afzender moeten duidelijk op de foto staan, de inhoud van de brief hoeven we niet te zien.

        Uiteraard mag je privacygevoelige informatie op de kopie van jouw rijbewijs (zoals het BSN-nummer) doorstrepen of onleesbaar maken.<br />
        Hiervoor kun je de app KopieID van de Rijksoverheid gebruiken, te vinden in de [Apple store](https://itunes.apple.com/nl/app/kopieid/id932970330) of de [Google play store](https://play.google.com/store/apps/details?id=com.milvum.kopieid).

        Nadat wij de controle hebben uitgevoerd, zullen wij de ontvangen documenten verwijderen.

        Je ontvangt van ons zo snel mogelijk een reactie per e-mail over de controle van jouw account, meestal binnen twee werkdagen.<br />
        Het is niet mogelijk om hier telefonisch over te corresponderen, vragen over accountcontrole kunnen alleen per e-mail gesteld worden.

        Mail gerust als je nog vragen hebt.`,
      footer: commonTags.stripIndent`
        Veelgestelde vragen:

        - [Ik heb rijtegoed betaald, hoe vraag ik dit terug?](https://mywheels.nl/autodelen/veelgestelde-vragen/rijtegoed-terugvragen/)
        - [Wanneer wordt mijn account gecontroleerd?](https://mywheels.nl/autodelen/veelgestelde-vragen/wanneer-wordt-rijbewijs-gecontroleerd/)`
    },
    {
      key: "Lege tank - NL",
      subject: "Lege tank",
      content: commonTags.stripIndent`
        Beste {{ VOORNAAM }},

        Op 2 september heb jij de auto {{ AUTONAAM }} gebruikt.<br />
        De gebruiker na jou heeft de auto helaas aangetroffen met een lege tank (minder dan 1/4 gevuld) en moest hierdoor eerst naar een tankstation rijden voor deze de eigen rit kon beginnen. Dat is natuurlijk erg vervelend voor de gebruiker en heeft deze extra tijd gekost.

        Zou je wellicht kunnen aangeven waarom de auto niet getankt was / met te weinig brandstof is terug gezet?<br />
        Waren er problemen met de tankpas, of ben je het wellicht vergeten?

        Alvast bedankt voor je reactie.`
    },
    {
      key: "Beheerder worden? - NL",
      subject: "Draag bij aan de deelmaatschappij!",
      content: commonTags.stripIndent`
        <p><img width="100%" height="auto" src="https://mywheels.nl/autodelen/wp-content/uploads/2019/09/beheerders-1-e1567582008270.jpg" /></p>

        Beste {{ VOORNAAM }},

        Wij zien dat jij de auto {{ AUTONAAM }} in {{ STAD }} regelmatig gebruikt. 
        Wij zijn voor deze auto op zoek naar een nieuwe beheerder, misschien is dit iets voor jou?

        **Over MyWheels** <br />
        Hoe meer mensen een auto delen, des te minder auto’s er op de weg rijden of in de wijken staan. Met minder auto’s slaan we dus twee vliegen in één klap: minder CO2-uitstoot én leefbaardere buurten. Samen met onze leden en een groep enthousiaste beheerders en coördinatoren in het land streven we deze idealen na. MyWheels is in de afgelopen vijfentwintig jaar uitgegroeid tot een van de grootste en voordeligste autodeelplatforms van Nederland. Anno 2019 verbinden we ruim 65.000 huurders en verhuurders van deelauto’s met elkaar. 

        **Wat doet een beheerder?** <br />
        Alle MyWheels Open deelauto's hebben een beheerder. Dit zijn onze vrijwilligers op locatie: ons aanspreekpunt en onze ambassadeurs. Beheerders helpen om vragen van gebruikers te beantwoorden, de auto netjes te houden en een oogje in het zeil te houden. Zo nu en dan de bandenspanning en oliepeil controleren en het bijhouden van de jaarlijkse onderhoudsbeurt worden door onze beheerders gecoördineerd. 

        **Is er een vergoeding voor beheerderschap?** <br />
        Ja, als bedankje krijgen MyWheels beheerders maandelijks een vrijwilligersvergoeding in de vorm van 75 vrije kilometers. Deze wordt verrekend met eigen gemaakte ritten. Deze vergoeding spaar je op, je hoeft dit dus niet elke maand op te maken.

        **Geheel vrijblijvend** <br />
        Omdat het beheerder zijn van een MyWheels auto vrijwillig is, zit je ook nergens aan vast. Als je het toch niet leuk vindt om beheerder te zijn of je er wellicht later geen tijd meer voor hebt, is dat geen probleem en gaan we op zoek naar een nieuwe beheerder voor de auto.

        Op [https://mywheels.nl/beheerders](https://mywheels.nl/beheerders) kun je online een aantal van onze beheerders ontmoeten.

        Lijkt het je wat? Of heb je wellicht vragen / wil je meer informatie ontvangen? Laat het ons gerust weten.<br />
        Telefonisch zijn wij bereikbaar op werkdagen tussen 09:00 en 17:00 via onderstaand telefoonnummer.

        Mocht je geen interesse hebben om beheerder te worden, dan vernemen wij dat ook graag.<br />
        Alvast bedankt voor jouw reactie.

        Fijne dag!
      `
    }
  ].map(template => ({
    ...template,
    content: template.content + "\n\n" + commonTags.stripIndent`
      Met vriendelijke groet,<br />
      << MEDEWERKER >>

      **MyWheels**<br />
      Keizersgracht 264<br />
      1016 EV Amsterdam<br />
      085-7734222

      <p><img src="https://mywheels.nl/autodelen/wp-content/uploads/2019/01/mywheels_log_klein.png" /></p>

      << FEEDBACK >>` + (template.footer ? "\n\n<hr />" + template.footer : "")
  }));

  return [...in_dutch, ...in_english];
});
