/* ================================================================
   FRÅGEBANK – här ändrar du frågorna
   ================================================================
   Allt som syns för studenterna styrs härifrån:
     • aktiv       true/false – visa eller dölj övningen
     • rubrik      namnet i menyn
     • teori       kort teoriruta (HTML är tillåtet)
     • intervall   sifferintervall som slumpas: [min, max, steg]
                   Räntor anges i procent, t.ex. [2, 12, 1] = 2 %, 3 %, … 12 %
     • mallar      frågetexter. En mall slumpas per fråga.
                   {platshållare} ersätts med siffror. Vilka platshållare
                   som finns står i kommentaren ovanför varje övning.
   Tips: Lägg till fler mallar eller scenarier genom att kopiera en rad
   och ändra texten. Glöm inte kommatecknet mellan raderna.
   ================================================================ */
(typeof window !== "undefined" ? window : globalThis).FRAGEBANK = {

  kurs: {
    namn: "Investeringsbedömning",
    kod: "FOA027 · Delkurs 3",
    skola: "Mälardalens universitet",
  },

  // Hur nära facit ett svar måste vara för att räknas som rätt.
  // 0.005 = 0,5 % – ger utrymme för avrundade tabellvärden.
  tolerans: { relativ: 0.005 },

  // Rubriker i menyn (följer föreläsningarna)
  grupper: [
    { id: "F2", namn: "Pengars tidsvärde" },
    { id: "F3", namn: "Nettonuvärdesmetoden" },
    { id: "F4", namn: "Alternativa metoder" },
    { id: "F5", namn: "Risk och osäkerhet" },
    { id: "F6", namn: "Kalkylräntan" },
    { id: "F7", namn: "Leasing" },
  ],

  // Används i flera övningar
  foretag: ["AB Solvens", "IndustriTek AB", "NordFabrik AB", "TeknoForm AB",
    "MekanoOptima AB", "Mälarverken AB", "Hammar & Son AB", "StålTeknik AB"],

  // Visas i formelsamlingen men har inga egna övningar
  ovrigaFormler: {
    rubrik: "Övrigt från F2",
    html: `<p class="formel">Perpetuitet: PV = KF / r</p>
      <p class="formel">ROI = överskott / kapitalplacering</p>
      <p class="formel">Effektiv ränta = (1 + r/m)<sup>m</sup> − 1</p>
      <p>m = antal räntetillskrivningar per år. Ett lån på 10 % med tillskrivning varje månad har effektiv ränta 10,47 %.</p>`,
  },

  moduler: {

    /* ---------------- F2: PENGARS TIDSVÄRDE ---------------- */

    // Platshållare: {belopp} {ranta} {ar} {tillskrivning}
    slutvarde: {
      aktiv: true, grupp: "F2",
      rubrik: "Slutvärde",
      teori: `
  <p>
    <strong>Kapitalisering</strong> innebär att vi räknar fram vad ett belopp
    som vi har idag kommer att vara värt vid en framtida tidpunkt.
    Eftersom ränta läggs till kapitalet växer beloppet genom
    <strong>ränta på ränta</strong>.
  </p>

  <p><strong>1. Kapitalisering med årlig ränta</strong></p>

  <p class="formel">
    Slutvärde (SV) = Nuvärde (NV) × (1 + r)<sup>n</sup>
  </p>

  <p>
    Där NV är beloppet idag, r är räntan per år (i decimalform)
    och n är antalet år.
  </p>

  <p>
    <strong>Exempel:</strong> Du placerar 100 kr idag till 10 % årlig ränta
    under tre år.
  </p>

  <p class="formel">
    SV = 100 × (1 + 0,10)<sup>3</sup> = 133,10 kr
  </p>

  <p>
    Efter tre år har beloppet vuxit från 100 kr till 133,10 kr.
    Räntan beräknas varje år på det ursprungliga kapitalet
    plus tidigare intjänad ränta.
  </p>

  <p><strong>2. Kapitalisering med flera räntetillskrivningar per år</strong></p>

  <p>
    Ibland läggs räntan till kapitalet flera gånger per år,
    exempelvis varje halvår, kvartal eller månad.
    Då behöver vi anpassa både räntan och antalet perioder.
  </p>

  <p class="formel">
    Slutvärde (SV) = Nuvärde (NV) ×
    (1 + r/m)<sup>m × n</sup>
  </p>

  <p>
    Där:
  </p>

  <ul>
    <li><strong>NV</strong> = beloppet idag (nuvärdet)</li>
    <li><strong>r</strong> = nominell årsränta i decimalform</li>
    <li><strong>m</strong> = antal räntetillskrivningar per år</li>
    <li><strong>n</strong> = antal år</li>
    <li><strong>r/m</strong> = ränta per period</li>
    <li><strong>m × n</strong> = totalt antal perioder</li>
  </ul>

  <p>
    <strong>Exempel:</strong> Du placerar 10 000 kr till 10 % nominell
    årsränta under ett år. Räntan läggs till kapitalet varje halvår.
  </p>

  <p>
    Eftersom räntan tillkommer två gånger per år blir
    periodräntan 10 % / 2 = 5 %.
    Antalet perioder blir 2 × 1 = 2.
  </p>

  <p class="formel">
    SV = 10 000 × (1 + 0,10/2)<sup>2</sup>
    = 11 025 kr
  </p>

  <p>
    Slutvärdet blir 11 025 kr. Om räntan i stället hade
    lagts till endast en gång per år skulle slutvärdet
    ha blivit 11 000 kr.
  </p>

  <p>
    <strong>Viktigt:</strong> Ju oftare räntan läggs till kapitalet,
    desto större blir slutvärdet, förutsatt samma nominella
    årsränta och spartid.
  </p>

  <p>
    <strong>Kom ihåg:</strong> Vid årlig räntetillskrivning är m = 1,
    vilket innebär att den allmänna formeln förenklas till
    SV = NV × (1 + r)<sup>n</sup>.
  </p>
`,
      intervall: { belopp: [1000, 20000, 500], ranta: [2, 12, 1], ar: [2, 10, 1], tillskrivning: [1, 2, 4, 12] },
      mallar: [
        "Hur mycket har {belopp} vuxit till med ränta-på-ränta efter {ar} år? Räntesats: {ranta}, räntetillskrivning {tillskrivning} gång(er) per år.",
        "Anna sätter in {belopp} på ett sparkonto med räntan {ranta} och räntetillskrivning {tillskrivning} gång(er) per år. Hur mycket finns på kontot efter {ar} år?",
        "Ett företag placerar {belopp} på ett konto med räntan {ranta} ({tillskrivning} tillskrivningar per år). Vad är slutvärdet efter {ar} år?",
      ],
    },

    // Platshållare: {belopp} {ranta} {ar}
    nuvarde: {
      aktiv: true, grupp: "F2",
      rubrik: "Nuvärde",
      teori: `
  <p>
    <strong>Diskontering</strong> innebär att vi räknar om ett framtida
    belopp till vad det är värt idag. Detta kallas för
    <strong>nuvärde (NV)</strong>.
  </p>

  <p>
    Diskontering är motsatsen till kapitalisering.
    Vid kapitalisering flyttar vi ett belopp framåt i tiden,
    medan vi vid diskontering flyttar ett framtida belopp
    bakåt till idag.
  </p>

  <p><strong>1. Diskontering med årlig ränta</strong></p>

  <p class="formel">
    Nuvärde (NV) = Slutvärde (SV) / (1 + r)<sup>n</sup>
  </p>

  <p>
    Formeln kan också skrivas:
  </p>

  <p class="formel">
    NV = SV × (1 + r)<sup>−n</sup>
  </p>

  <p>
    Där:
  </p>

  <ul>
    <li><strong>NV</strong> = nuvärde (beloppets värde idag)</li>
    <li><strong>SV</strong> = slutvärde (framtida belopp)</li>
    <li><strong>r</strong> = årlig kalkylränta i decimalform</li>
    <li><strong>n</strong> = antal år till betalningen</li>
  </ul>

  <p>
    <strong>Exempel:</strong> Du kommer att få 133,10 kr om tre år.
    Kalkylräntan är 10 % per år. Vad är beloppet värt idag?
  </p>

  <p class="formel">
    NV = 133,10 / (1 + 0,10)<sup>3</sup> = 100 kr
  </p>

  <p>
    Nuvärdet är 100 kr. Det innebär att 100 kr idag är
    ekonomiskt likvärdigt med 133,10 kr om tre år,
    om vi använder en kalkylränta på 10 %.
  </p>

  <p>
    <strong>Varför delar vi med (1 + r)?</strong>
    Vid kapitalisering multiplicerar vi med (1 + r)
    för varje år. Vid diskontering gör vi tvärtom
    och dividerar med (1 + r) för varje år.
  </p>

  <p>
    Ju högre kalkylränta eller ju längre fram i tiden
    betalningen ligger, desto lägre blir nuvärdet.
  </p>

  <p><strong>2. Diskontering med flera ränteperioder per år</strong></p>

  <p>
    Om räntan beräknas flera gånger per år, exempelvis
    varje halvår eller kvartal, behöver vi anpassa
    räntan och antalet perioder.
  </p>

  <p class="formel">
    NV = SV / (1 + r/m)<sup>m × n</sup>
  </p>

  <p>
    Där:
  </p>

  <ul>
    <li><strong>r</strong> = nominell årsränta i decimalform</li>
    <li><strong>m</strong> = antal ränteperioder per år</li>
    <li><strong>n</strong> = antal år</li>
    <li><strong>r/m</strong> = ränta per period</li>
    <li><strong>m × n</strong> = totalt antal perioder</li>
  </ul>

  <p>
    <strong>Exempel:</strong> Du kommer att få 11 025 kr om ett år.
    Den nominella årsräntan är 10 % och räntan beräknas
    varje halvår.
  </p>

  <p>
    Periodräntan blir 10 % / 2 = 5 %.
    Antalet perioder blir 2 × 1 = 2.
  </p>

  <p class="formel">
    NV = 11 025 / (1 + 0,10/2)<sup>2</sup>
    = 10 000 kr
  </p>

  <p>
    Nuvärdet är alltså 10 000 kr.
    Detta är samma belopp som vi utgick från
    i exemplet om kapitalisering.
  </p>

  <p>
    <strong>Kom ihåg:</strong>
    Kapitalisering och diskontering är två sidor av samma
    beräkning. Kapitalisering visar vad pengar idag blir
    värda i framtiden. Diskontering visar vad framtida
    pengar är värda idag.
  </p>
`,
      intervall: { belopp: [5000, 50000, 1000], ranta: [2, 12, 1], ar: [2, 12, 1] },
      mallar: [
        "Vilket är nuvärdet om slutvärdet är {belopp} efter {ar} år? Räntesats: {ranta}.",
        "Lisa vill ha {belopp} om {ar} år. Räntan är {ranta}. Hur mycket måste hon sätta in idag?",
        "Ett företag förväntar sig ett kassaflöde på {belopp} om {ar} år. Kalkylräntan är {ranta}. Vad är kassaflödets nuvärde?",
      ],
    },

    // Platshållare: {kassafloden} {ranta} {ar}
    nuvarde_strom: {
      aktiv: true, grupp: "F2",
      rubrik: "Nuvärde – ström",
      teori: `
  <p>
    <strong>Nuvärdet av flera kassaflöden</strong> beräknas genom
    att diskontera varje framtida kassaflöde till idag och
    därefter summera deras nuvärden.
  </p>

  <p>
    Precis som vid diskontering av ett enskilt belopp
    använder vi kalkylräntan för att räkna om framtida
    betalningar till vad de är värda idag.
    Skillnaden är att vi nu har flera kassaflöden
    vid olika tidpunkter.
  </p>

  <p>
    Varje kassaflöde diskonteras utifrån hur många år
    framåt i tiden det inträffar.
    Vi antar att kassaflödena kommer i slutet av varje år.
  </p>

  <p class="formel">
    NV = KF<sub>1</sub> / (1 + r)<sup>1</sup>
    + KF<sub>2</sub> / (1 + r)<sup>2</sup>
    + ... +
    KF<sub>n</sub> / (1 + r)<sup>n</sup>
  </p>

  <p>
    Formeln kan också skrivas med summatecken:
  </p>

  <p class="formel">
    NV = Σ<sub>t=1</sub><sup>n</sup>
    KF<sub>t</sub> / (1 + r)<sup>t</sup>
  </p>

  <p>
    Där:
  </p>

  <ul>
    <li><strong>NV</strong> = nuvärdet av samtliga framtida kassaflöden</li>
    <li><strong>KF<sub>t</sub></strong> = kassaflödet vid tidpunkt t</li>
    <li><strong>r</strong> = årlig kalkylränta i decimalform</li>
    <li><strong>t</strong> = antal år fram till respektive kassaflöde</li>
    <li><strong>n</strong> = antal år fram till sista kassaflödet</li>
  </ul>

  <p>
    <strong>Exempel:</strong> En investering förväntas generera
    följande kassaflöden:
  </p>

  <ul>
    <li>År 1: 1 000 kr</li>
    <li>År 2: 2 000 kr</li>
    <li>År 3: 3 000 kr</li>
  </ul>

  <p>
    Kalkylräntan är 10 % per år.
    Vad är kassaflödena värda idag?
  </p>

  <p class="formel">
    NV = 1 000 / 1,10<sup>1</sup>
    + 2 000 / 1,10<sup>2</sup>
    + 3 000 / 1,10<sup>3</sup>
  </p>

  <p class="formel">
    NV = 909,09 + 1 652,89 + 2 253,94
    = 4 815,93 kr
  </p>

  <p>
    Det sammanlagda nuvärdet är cirka 4 815,93 kr.
    Det innebär att de tre framtida kassaflödena
    tillsammans motsvarar detta belopp idag,
    vid en kalkylränta på 10 %.
  </p>

  <p>
    <strong>Kom ihåg:</strong>
    Kassaflöden längre fram i tiden diskonteras under
    fler år. Därför måste vi ta hänsyn till både
    kassaflödets storlek och när betalningen inträffar.
  </p>
`,
      intervall: { ar: [3, 6, 1], ranta: [3, 10, 1], kassaflode: [5000, 20000, 1000] },
      mallar: [
        "Ett företag förväntar sig följande kassaflöden från en investering: {kassafloden}. Kalkylräntan är {ranta}. Vad är kassaflödenas nuvärde?",
        "Kalle ska betala tillbaka följande belopp: {kassafloden}. Med räntan {ranta}, vad motsvarar skulden i nuvärde idag?",
        "Anna planerar följande årliga insättningar: {kassafloden}. Räntan är {ranta}. Vad är insättningarnas nuvärde idag?",
      ],
    },

    // Platshållare: {kassafloden} {ranta} {ar}
    slutvarde_strom: {
      aktiv: true, grupp: "F2",
      rubrik: "Slutvärde – ström",
      teori: `
  <p>
    <strong>Slutvärdet av flera kassaflöden</strong> beräknas genom
    att kapitalisera varje kassaflöde fram till en gemensam
    framtida tidpunkt och därefter summera deras slutvärden.
  </p>

  <p>
    Precis som vid kapitalisering av ett enskilt belopp
    använder vi räntan för att beräkna vad pengar blir
    värda i framtiden.
    Skillnaden är att vi nu har flera kassaflöden
    vid olika tidpunkter.
  </p>

  <p>
    Varje kassaflöde kapitaliseras utifrån hur många år
    det återstår till den sista tidpunkten.
    Vi antar att kassaflödena kommer i slutet av varje år
    och att slutvärdet beräknas vid slutet av år n.
  </p>

  <p class="formel">
    SV = KF<sub>1</sub> × (1 + r)<sup>n−1</sup>
    + KF<sub>2</sub> × (1 + r)<sup>n−2</sup>
    + ... + KF<sub>n</sub>
  </p>

  <p>
    Formeln kan också skrivas med summatecken:
  </p>

  <p class="formel">
    SV = Σ<sub>t=1</sub><sup>n</sup>
    KF<sub>t</sub> × (1 + r)<sup>n−t</sup>
  </p>

  <p>
    Där:
  </p>

  <ul>
    <li><strong>SV</strong> = det sammanlagda slutvärdet vid år n</li>
    <li><strong>KF<sub>t</sub></strong> = kassaflödet vid tidpunkt t</li>
    <li><strong>r</strong> = årlig ränta i decimalform</li>
    <li><strong>t</strong> = året då kassaflödet inträffar</li>
    <li><strong>n</strong> = sista året (tidpunkten för slutvärdet)</li>
    <li><strong>n − t</strong> = antal år som kassaflödet kapitaliseras</li>
  </ul>

  <p>
    <strong>Exempel:</strong> Du sparar följande belopp
    i slutet av varje år:
  </p>

  <ul>
    <li>År 1: 1 000 kr</li>
    <li>År 2: 2 000 kr</li>
    <li>År 3: 3 000 kr</li>
  </ul>

  <p>
    Räntan är 10 % per år.
    Hur mycket är pengarna värda tillsammans
    i slutet av år 3?
  </p>

  <p>
    Vi kapitaliserar varje belopp fram till slutet av år 3.
    Det första beloppet får ränta under två år,
    det andra under ett år och det sista beloppet
    får ingen ränta eftersom det betalas in vid
    slutet av år 3.
  </p>

  <p class="formel">
    SV = 1 000 × 1,10<sup>2</sup>
    + 2 000 × 1,10<sup>1</sup>
    + 3 000 × 1,10<sup>0</sup>
  </p>

  <p class="formel">
    SV = 1 210 + 2 200 + 3 000 = 6 410 kr
  </p>

  <p>
    Det sammanlagda slutvärdet är 6 410 kr.
    Vi har totalt satt in 6 000 kr och fått
    410 kr i ränta.
  </p>

  <p>
    <strong>Kom ihåg:</strong>
    Kassaflöden som inträffar tidigare får ränta
    under fler år och växer därför mer.
    Det sista kassaflödet kapitaliseras inte alls
    eftersom det redan inträffar vid den tidpunkt
    då slutvärdet beräknas.
  </p>
`,
      intervall: { ar: [3, 6, 1], ranta: [3, 10, 1], kassaflode: [5000, 20000, 1000] },
      mallar: [
        "Anna sparar följande belopp i slutet av varje år: {kassafloden}. Räntan är {ranta}. Hur mycket har hon direkt efter sista insättningen, år {ar}?",
        "Ett företag placerar följande belopp i slutet av respektive år: {kassafloden}. Med räntan {ranta}, vad är slutvärdet år {ar}?",
      ],
    },

    // Platshållare: {kf} {ranta} {ar}
    nuvarde_lika: {
      aktiv: true, grupp: "F2",
      rubrik: "Nuvärde – lika belopp",
      teori: `
  <p>
    <strong>Nusummefaktorn (NUSF)</strong> används för att beräkna
    nuvärdet av flera lika stora kassaflöden som kommer
    med jämna mellanrum.
  </p>

  <p>
    Vi har tidigare lärt oss att beräkna nuvärdet
    genom att diskontera varje kassaflöde separat
    och därefter summera.
  </p>

  <p>
    När kassaflödena är lika stora varje år kan vi
    förenkla beräkningen genom att använda
    <strong>nusummefaktorn</strong>.
    Vi antar att betalningarna sker i slutet av varje år.
  </p>

  <p class="formel">
    NV = KF × NUSF<sub>r,n</sub>
  </p>

  <p>
    Nusummefaktorn beräknas som:
  </p>

  <p class="formel">
    NUSF<sub>r,n</sub> =
    (1 − (1 + r)<sup>−n</sup>) / r
  </p>

  <p>
    Där:
  </p>

  <ul>
    <li><strong>NV</strong> = nuvärdet av samtliga kassaflöden</li>
    <li><strong>KF</strong> = lika stort kassaflöde varje år</li>
    <li><strong>r</strong> = årlig kalkylränta i decimalform</li>
    <li><strong>n</strong> = antal årliga betalningar</li>
    <li><strong>NUSF</strong> = nusummefaktorn</li>
  </ul>

  <p>
    <strong>Exempel:</strong> En investering förväntas generera
    1 000 kr per år under tre år.
    Kalkylräntan är 10 %.
    Vad är kassaflödena värda idag?
  </p>

  <p>
    <strong>Steg 1:</strong> Beräkna nusummefaktorn.
  </p>

  <p class="formel">
    NUSF<sub>0,10;3</sub> =
    (1 − (1 + 0,10)<sup>−3</sup>) / 0,10
    = 2,48685
  </p>

  <p>
    <strong>Steg 2:</strong> Multiplicera det årliga
    kassaflödet med nusummefaktorn.
  </p>

  <p class="formel">
    NV = 1 000 × 2,48685 = 2 486,85 kr
  </p>

  <p>
    Det sammanlagda nuvärdet är 2 486,85 kr.
    Det innebär att tre årliga betalningar på
    1 000 kr motsvarar 2 486,85 kr idag,
    vid en kalkylränta på 10 %.
  </p>

  <p>
    <strong>Varför fungerar nusummefaktorn?</strong>
    Nusummefaktorn är summan av diskonteringsfaktorerna
    för samtliga betalningar.
  </p>

  <p class="formel">
    NUSF = 1 / 1,10<sup>1</sup>
    + 1 / 1,10<sup>2</sup>
    + 1 / 1,10<sup>3</sup>
    = 2,48685
  </p>

  <p>
    Vi får alltså samma resultat som om vi hade
    diskonterat varje kassaflöde separat.
    Nusummefaktorn är bara ett snabbare sätt
    att genomföra samma beräkning.
  </p>

  <p>
    <strong>Kom ihåg:</strong>
    Nusummefaktorn används när kassaflödena är
    lika stora och kommer i slutet av varje år.
    Om kassaflödena är olika stora behöver vi
    i stället diskontera varje kassaflöde separat.
  </p>
`,
      intervall: { kf: [5000, 50000, 1000], ranta: [2, 12, 1], ar: [3, 15, 1] },
      mallar: [
        "Ett företag förväntar sig ett kassaflöde på {kf} i slutet av varje år i {ar} år. Kalkylräntan är {ranta}. Vad är kassaflödenas nuvärde?",
        "Lisa vinner ett pris som betalas ut med {kf} i slutet av varje år i {ar} år. Räntan är {ranta}. Vad är priset värt idag?",
        "En hyresgäst betalar {kf} i hyra i slutet av varje år under ett {ar}-årigt kontrakt. Med räntan {ranta}, vad är hyresintäkternas nuvärde?",
        "Vad är nuvärdet av {ar} lika stora årliga betalningar på {kf}, där den första betalas om ett år? Räntesats: {ranta}.",
      ],
    },

    // Platshållare: {kf} {ranta} {ar} {tillskrivningText}
    slutvarde_lika: {
      aktiv: true, grupp: "F2",
      rubrik: "Slutvärde – lika belopp",
      teori: `
  <p>
    <strong>Slutvärdesummefaktorn (SVSF)</strong> används för att
    beräkna slutvärdet av flera lika stora kassaflöden
    som kommer med jämna mellanrum.
  </p>

  <p>
    Vi har tidigare lärt oss att beräkna slutvärdet
    genom att kapitalisera varje kassaflöde separat
    fram till den sista tidpunkten och därefter summera.
  </p>

  <p>
    När kassaflödena är lika stora varje år kan vi
    förenkla beräkningen genom att använda
    <strong>slutvärdesummefaktorn</strong>.
    Vi antar att betalningarna sker i slutet av varje år.
  </p>

  <p class="formel">
    SV = KF × SVSF<sub>r,n</sub>
  </p>

  <p>
    Slutvärdesummefaktorn beräknas som:
  </p>

  <p class="formel">
    SVSF<sub>r,n</sub> =
    ((1 + r)<sup>n</sup> − 1) / r
  </p>

  <p>
    Där:
  </p>

  <ul>
    <li><strong>SV</strong> = det sammanlagda slutvärdet</li>
    <li><strong>KF</strong> = lika stort kassaflöde varje år</li>
    <li><strong>r</strong> = årlig ränta i decimalform</li>
    <li><strong>n</strong> = antal årliga betalningar</li>
    <li><strong>SVSF</strong> = slutvärdesummefaktorn</li>
  </ul>

  <p>
    <strong>Exempel:</strong> Du sparar 1 000 kr i slutet
    av varje år under tre år.
    Räntan är 10 % per år.
    Hur mycket har du i slutet av år 3?
  </p>

  <p>
    <strong>Steg 1:</strong> Beräkna slutvärdesummefaktorn.
  </p>

  <p class="formel">
    SVSF<sub>0,10;3</sub> =
    ((1 + 0,10)<sup>3</sup> − 1) / 0,10
    = 3,31
  </p>

  <p>
    <strong>Steg 2:</strong> Multiplicera det årliga
    kassaflödet med slutvärdesummefaktorn.
  </p>

  <p class="formel">
    SV = 1 000 × 3,31 = 3 310 kr
  </p>

  <p>
    Det sammanlagda slutvärdet är 3 310 kr.
    Vi har totalt satt in 3 000 kr och fått
    310 kr i ränta.
  </p>

  <p>
    <strong>Varför fungerar slutvärdesummefaktorn?</strong>
    Faktorn är summan av kapitaliseringsfaktorerna
    för samtliga betalningar.
  </p>

  <p class="formel">
    SVSF = 1,10<sup>2</sup>
    + 1,10<sup>1</sup>
    + 1,10<sup>0</sup>
    = 3,31
  </p>

  <p>
    Det första beloppet får ränta under två år,
    det andra under ett år och det sista beloppet
    får ingen ränta.
  </p>

  <p>
    Vi får alltså samma resultat som om vi hade
    kapitaliserat varje kassaflöde separat.
    Slutvärdesummefaktorn är ett snabbare sätt
    att genomföra samma beräkning.
  </p>

  <p>
    <strong>Kom ihåg:</strong>
    Slutvärdesummefaktorn används när kassaflödena
    är lika stora och kommer i slutet av varje år.
    Om kassaflödena är olika stora behöver vi
    kapitalisera varje kassaflöde separat.
  </p>
`,
      intervall: { kf: [2000, 30000, 1000], ranta: [2, 12, 1], ar: [3, 12, 1], tillskrivning: [2, 4, 12] },
      // Andel frågor med flera räntetillskrivningar per år
      tillskrivningChans: 0.35,
      mallar: [
        "Anna sätter in {kf} i slutet av varje år i {ar} år på ett konto med räntan {ranta}{tillskrivningText}. Hur mycket finns på kontot direkt efter sista insättningen?",
        "Ett företag avsätter {kf} i slutet av varje år till en fond som ger {ranta}{tillskrivningText}. Vad är fonden värd efter {ar} år, direkt efter sista avsättningen?",
        "Vad är slutvärdet år {ar} av {ar} lika stora insättningar på {kf} som görs i slutet av varje år? Räntesats: {ranta}{tillskrivningText}.",
      ],
    },

    // Platshållare: {belopp} {ranta} {ar}
    annuitet: {
      aktiv: true, grupp: "F2",
      rubrik: "Annuitet",
      teori: `
  <p>
    <strong>En annuitet</strong> är en serie lika stora betalningar
    som sker med jämna mellanrum, exempelvis varje år.
    Annuitetsberäkning används när vi vill fördela ett belopp
    idag på lika stora framtida betalningar.
  </p>

  <p>
    Ett vanligt exempel är ett lån med lika stora årliga
    betalningar. Varje betalning består då av
    <strong>ränta och amortering</strong>.
    Betalningen är lika stor varje år, men fördelningen
    mellan ränta och amortering förändras över tiden.
  </p>

  <p>
    <strong>1. Beräkna annuiteten</strong>
  </p>

  <p>
    Vi känner till nuvärdet (NV), kalkylräntan (r)
    och antalet år (n). Vi vill beräkna den årliga
    betalningen (A).
  </p>

  <p class="formel">
    Annuitet (A) = Nuvärde (NV) ×
    r / (1 − (1 + r)<sup>−n</sup>)
  </p>

  <p>
    Där:
  </p>

  <ul>
    <li><strong>A</strong> = lika stor betalning varje år (annuiteten)</li>
    <li><strong>NV</strong> = beloppets värde idag, exempelvis lånebeloppet</li>
    <li><strong>r</strong> = årlig ränta i decimalform</li>
    <li><strong>n</strong> = antal årliga betalningar</li>
  </ul>

  <p>
    Vi antar att betalningarna sker i slutet av varje år
    och att räntan är konstant under hela perioden.
  </p>

  <p>
    <strong>2. Sambandet med nusummefaktorn (NUSF)</strong>
  </p>

  <p>
    Vi har tidigare använt nusummefaktorn för att beräkna
    nuvärdet av flera lika stora framtida kassaflöden:
  </p>

  <p class="formel">
    NV = KF × NUSF<sub>r,n</sub>
  </p>

  <p>
    Vid annuitetsberäkning gör vi tvärtom.
    Vi känner redan till nuvärdet och vill ta reda på
    hur stor varje årlig betalning måste vara.
  </p>

  <p class="formel">
    A = NV / NUSF<sub>r,n</sub>
  </p>

  <p>
    Eftersom annuitetsfaktorn är det inverterade värdet
    av nusummefaktorn kan vi också skriva:
  </p>

  <p class="formel">
    A = NV × Annuitetsfaktorn
  </p>

  <p class="formel">
    Annuitetsfaktorn =
    r / (1 − (1 + r)<sup>−n</sup>)
  </p>

  <p>
    <strong>3. Exempel: Beräkna årlig betalning på ett lån</strong>
  </p>

  <p>
    Du lånar 100 000 kr och ska betala tillbaka lånet
    genom tre lika stora årliga betalningar.
    Räntan är 10 % per år.
    Hur stor blir den årliga betalningen?
  </p>

  <p>
    <strong>Steg 1:</strong> Beräkna annuitetsfaktorn.
  </p>

  <p class="formel">
    Annuitetsfaktorn =
    0,10 / (1 − (1 + 0,10)<sup>−3</sup>)
    ≈ 0,402115
  </p>

  <p>
    <strong>Steg 2:</strong> Multiplicera lånebeloppet
    med annuitetsfaktorn.
  </p>

  <p class="formel">
    A = 100 000 × 0,402115
    ≈ 40 211,48 kr
  </p>

  <p>
    Den årliga betalningen blir alltså cirka
    <strong>40 211,48 kr</strong>.
    Du betalar samma belopp i slutet av varje år
    under tre år.
  </p>

  <p>
    <strong>Varför blir den totala betalningen större
    än lånebeloppet?</strong>
  </p>

  <p>
    Du betalar inte bara tillbaka de 100 000 kr
    som du lånat, utan även ränta på den kvarvarande
    skulden. Därför blir summan av de tre betalningarna
    större än det ursprungliga lånebeloppet.
  </p>

  <p>
    <strong>4. Tolkning</strong>
  </p>

  <p>
    Annuitetsberäkningen innebär att vi hittar en
    lika stor årlig betalning vars sammanlagda
    nuvärde motsvarar det ursprungliga beloppet.
  </p>

  <p>
    Om vi diskonterar de tre årliga betalningarna
    på cirka 40 211,48 kr med 10 % kalkylränta
    får vi därför ett sammanlagt nuvärde
    på cirka 100 000 kr.
  </p>

  <p>
    <strong>Kom ihåg:</strong>
    Nusummefaktorn används när vi känner till
    de årliga betalningarna och vill beräkna deras nuvärde.
    Annuitetsfaktorn används när vi känner till
    nuvärdet och vill beräkna hur stora de årliga
    betalningarna måste vara.
  </p>
`,
      intervall: { belopp: [20000, 200000, 5000], ranta: [3, 10, 1], ar: [3, 15, 1] },
      mallar: [
        "Hur stor blir den årliga betalningen för ett lån på {belopp} med räntan {ranta} och löptiden {ar} år?",
        "Kalle lånar {belopp} som ska återbetalas med lika stora belopp i slutet av varje år i {ar} år. Räntan är {ranta}. Hur stor blir den årliga betalningen?",
        "Emma ärver {belopp} som hon sätter in på ett konto med räntan {ranta}. Hon vill ta ut lika stora belopp i slutet av varje år i {ar} år så att kontot är tomt efter sista uttaget. Hur mycket kan hon ta ut per år?",
      ],
    },

    /* ---------------- F3: NETTONUVÄRDESMETODEN ---------------- */

    // Platshållare: {scenario} {G} {besparing} {ar} {ranta} {restvardeText}
    nnv_rationalisering: {
      aktiv: true, grupp: "F3",
      rubrik: "Nettonuvärde",
      teori: `<p class="formel">NPV = −G + Σ<sub>t=1</sub><sup>T</sup> KF<sub>t</sub> × (1 + r)<sup>−t</sup></p>
        <p>När KF är lika stort varje år kan summan skrivas med nusummefaktorn. Restvärdet R<sub>T</sub> läggs till kassaflödet sista året (F3).</p>
        <p class="formel">NPV = −G + KF × NUSF<sub>r,T</sub> + R<sub>T</sub> × (1 + r)<sup>−T</sup></p>
        <p>Beslutsregel: investeringen är lönsam om NPV ≥ 0.</p>`,
      intervall: { G: [2000000, 6000000, 50000], besparing: [300000, 2000000, 25000], ar: [3, 10, 1], ranta: [5, 20, 1], restvarde: [100000, 600000, 50000] },
      restvardeChans: 0.5,
      scenarier: ["ett automatiserat lagerplockningssystem", "en ny kvalitetskontrollmaskin",
        "ett digitaliseringsprojekt i kundservicen", "energieffektiv belysning i en butikskedja",
        "ett energistyrningssystem i fabriken"],
      mallar: [
        "<p>Ett företag överväger att investera i <b>{scenario}</b>. Grundinvesteringen är <b>{G}</b>. Investeringen är en rationaliseringsinvestering som förväntas minska kostnaderna med <b>{besparing} per år</b>. Den ekonomiska livslängden är <b>{ar} år</b> och kalkylräntan är <b>{ranta}</b>. {restvardeText}</p><p>Beräkna investeringens nettonuvärde. Är investeringen lönsam?</p>",
      ],
    },

    // Platshållare: {foretag} {maskin} {lista}
    nnv_produktion: {
      aktiv: true, grupp: "F3",
      rubrik: "Relevanta kassaflöden",
      teori: `<p>Ta bara med kassaflöden som är <b>framtida</b>, <b>skillnadsskapande</b>, <b>likviditetspåverkande</b> och <b>tidssatta</b> (F3). Sunk costs, avskrivningar och kostnader som finns kvar oavsett beslut ska bort.</p>
        <p class="formel">KF<sub>t</sub> = I<sub>t</sub> − U<sub>t</sub></p>
        <p class="formel">NPV = −G + Σ<sub>t=1</sub><sup>T</sup> KF<sub>t</sub> × (1 + r)<sup>−t</sup></p>
        <p>Restvärdet R<sub>T</sub> läggs till kassaflödet sista året.</p>`,
      intervall: { G: [400000, 900000, 25000], volym: [12000, 25000, 1000], pris: [20, 45, 1], loner: [90000, 150000, 5000], drift: [80000, 180000, 5000], ar: [5, 7, 1], restvarde: [40000, 90000, 5000], ranta: [8, 12, 1], irrelevantBelopp: [30000, 300000, 10000], antalIrrelevanta: [1, 2, 1] },
      maskiner: ["laserskärare", "borrmaskin", "hydraulpress", "bandsåg", "kapmaskin", "automatisk svarv"],
      // varfor visas i lösningen och förklarar varför posten ska bort
      irrelevant: [
        { text: "Företaget har redan betalat {belopp} för en förstudie om maskinen.", varfor: "Sunk cost – beloppet är redan betalt och påverkas inte av beslutet." },
        { text: "Maskinen belastas med {belopp} per år i fördelade gemensamma administrationskostnader. Kostnaderna finns kvar oavsett om maskinen köps.", varfor: "Kostnaden uppstår oavsett beslut och är därför ingen särbetalning." },
        { text: "Företaget hyr ut en lagerlokal för {belopp} per år.", varfor: "Hyresintäkten har ingen koppling till investeringen." },
        { text: "Företaget har marknadsföringsavtal på {belopp} per år som löper oavsett beslut.", varfor: "Avtalet påverkas inte av investeringen." },
        { text: "Förra året betalade företaget {belopp} för att reparera en annan maskin.", varfor: "Historisk kostnad (sunk cost) utan koppling till beslutet." },
      ],
      mallar: [
        "<p>{foretag} överväger att investera i en ny <b>{maskin}</b>. Följande kalkylunderlag har tagits fram:</p>{lista}<p>Beräkna investeringens nettonuvärde. All produktion antas kunna säljas.</p>",
      ],
    },

    // Platshållare: {foretag} {lista}
    nnv_ersattning: {
      aktiv: true, grupp: "F3",
      rubrik: "Ersättningsinvestering",
      teori: `<p>Kassaflödena är skillnaden mellan att byta och att behålla (F3). Besparingar är inbetalningsöverskott. Kan den gamla maskinen säljas idag minskar det grundinvesteringen.</p>
        <p class="formel">NPV = −G + Σ<sub>t=1</sub><sup>T</sup> KF<sub>t</sub> × (1 + r)<sup>−t</sup></p>`,
      intervall: { G: [700000, 1400000, 50000], lonbesparing: [150000, 320000, 10000], energibesparing: [50000, 120000, 10000], ar: [3, 7, 1], ranta: [6, 12, 1], gammalForsaljning: [50000, 200000, 10000], irrelevantBelopp: [30000, 300000, 10000] },
      gammalChans: 0.5,
      irrelevant: [
        { text: "Företaget sponsrar ett lokalt idrottslag med {belopp} per år.", varfor: "Sponsringen påverkas inte av maskinbytet." },
        { text: "Företaget har försäkringskostnader för fabriken på {belopp} per år, oavsett vilken maskin som används.", varfor: "Kostnaden finns kvar oavsett beslut." },
        { text: "Den gamla maskinen köptes för {belopp} för åtta år sedan.", varfor: "Det historiska inköpspriset är en sunk cost. Det som räknas är vad maskinen kan säljas för idag." },
        { text: "Företaget har fasta administrationskostnader på {belopp} per år.", varfor: "De fasta kostnaderna påverkas inte av beslutet." },
      ],
      mallar: [
        "<p>{foretag} överväger att ersätta en gammal maskin med en ny. Följande kalkylunderlag har tagits fram:</p>{lista}<p>Beräkna ersättningsinvesteringens nettonuvärde.</p>",
      ],
    },

    // Platshållare: {scenario} {G} {kassafloden} {restvarde} {ranta} {fraga}
    nettoslutvarde: {
      aktiv: true, grupp: "F3",
      rubrik: "Nettoslutvärde",
      teori: `<p>Räkna upp alla kassaflöden till sista året i stället för att diskontera dem till idag.</p>
        <p class="formel">NSV = Σ<sub>t=1</sub><sup>T</sup> KF<sub>t</sub>(1 + r)<sup>T − t</sup> + R<sub>T</sub> − G(1 + r)<sup>T</sup></p>
        <p class="skillnad"><b>Skillnad mot föreläsningen:</b> nettoslutvärdet har ingen egen formel på föreläsningarna. Det bygger på slutvärdesformeln från F2 och ger alltid samma beslut som NPV, eftersom NSV = NPV × (1 + r)<sup>T</sup>.</p>`,
      intervall: { G: [400000, 1500000, 25000], restvarde: [40000, 200000, 10000], ranta: [5, 20, 1], ar: [3, 6, 1], kassaflode: [120000, 400000, 20000] },
      scenarier: ["en ny värmepump i lagerlokalen", "solpaneler på fabriksbyggnaden", "en automatiserad packrobot",
        "ett nytt logistiksystem", "ett energieffektivt ventilationssystem"],
      fragor: {
        sv: "Vad är slutvärdet av betalningsöverskotten inklusive restvärdet?",
        nsv: "Vad är investeringens nettoslutvärde?",
      },
      mallar: [
        "<p>Ett företag överväger att investera i <b>{scenario}</b>. Grundinvesteringen är <b>{G}</b>. Betalningsöverskotten förväntas bli <b>{kassafloden}</b>. Vid slutet av livslängden har utrustningen ett restvärde på <b>{restvarde}</b>. Kalkylräntan är <b>{ranta}</b>.</p><p><b>Fråga:</b> {fraga}</p>",
      ],
    },

    // Platshållare: {scenario} {GA} {nA} {kfA} {GB} {nB} {kfB} {ranta}
    jamfor_engang: {
      aktiv: true, grupp: "F3",
      rubrik: "Engångsinvesteringar",
      teori: `<p>Olika livslängd och ingen återinvestering (F3): räkna NPV för varje alternativ och välj det med högst NPV. Projekten är ömsesidigt uteslutande. Är alla NPV negativa genomförs inget.</p>
        <p class="formel">NPV = −G + Σ<sub>t=1</sub><sup>T</sup> KF<sub>t</sub> × (1 + r)<sup>−t</sup></p>`,
      intervall: { ranta: [6, 15, 1], GA: [300000, 800000, 50000], nA: [3, 3, 1], kfA: [120000, 300000, 20000], GB: [500000, 1200000, 50000], nB: [4, 4, 1], kfB: [150000, 350000, 20000] },
      scenarier: ["produktionsutrustning i ett tillverkningsföretag", "ett IT-system för intern effektivisering",
        "energieffektivisering i ett fastighetsbolag", "en utbildningssatsning för personalen"],
      mallar: [
        "<p>Ett företag överväger två alternativa <b>engångsinvesteringar</b> kopplade till {scenario}. Endast en kan genomföras och ingen av dem upprepas.</p><p><b>Investering A</b>: grundinvestering <b>{GA}</b>, livslängd <b>{nA} år</b>, betalningsöverskott <b>{kfA}</b>.</p><p><b>Investering B</b>: grundinvestering <b>{GB}</b>, livslängd <b>{nB} år</b>, betalningsöverskott <b>{kfB}</b>.</p><p>Kalkylräntan är <b>{ranta}</b>. Vilken investering bör väljas?</p>",
      ],
    },

    // Platshållare: {scenario} {G} {overskott} {ar} {restvardeText} {ranta}
    annuitetsmetoden: {
      aktiv: true, grupp: "F3",
      rubrik: "Annuitetsmetoden",
      teori: `<p>Annuitetsmetoden räknar om nettonuvärdet till ett lika stort belopp per år, en sorts årslönsamhet (F3).</p>
        <p class="formel">Annuitet = NPV × r / (1 − (1 + r)<sup>−n</sup>)</p>
        <p>Investeringen är lönsam om annuiteten ≥ 0, alltså samma beslut som med NPV.</p>`,
      intervall: { G: [500000, 3000000, 50000], overskott: [100000, 700000, 10000], ar: [4, 10, 1], ranta: [5, 15, 1], restvarde: [50000, 400000, 25000] },
      restvardeChans: 0.6,
      scenarier: ["en ny förpackningslinje", "en eldriven truckflotta", "ett nytt affärssystem", "en svetsrobot"],
      mallar: [
        "<p>Ett företag överväger att investera i <b>{scenario}</b>. Grundinvesteringen är <b>{G}</b> och investeringen ger ett inbetalningsöverskott på <b>{overskott} per år</b> i <b>{ar} år</b>. {restvardeText} Kalkylräntan är <b>{ranta}</b>.</p><p>Beräkna investeringens NPV och annuitet. Är investeringen lönsam?</p>",
      ],
    },

    // Platshållare: {scenario} {GA} {nA} {kfA} {GB} {nB} {kfB} {ranta}
    aterinvestering: {
      aktiv: true, grupp: "F3",
      rubrik: "Upprepade investeringar",
      teori: `<p>Olika livslängd och återinvestering (F3): räkna först NPV och sedan en årlig annuitet för varje alternativ. Välj högst annuitet.</p>
        <p class="formel">Annuitet = NPV × r / (1 − (1 + r)<sup>−n</sup>)</p>`,
      intervall: { ranta: [6, 14, 1], GA: [300000, 700000, 50000], nA: [3, 3, 1], kfA: [130000, 260000, 20000], GB: [500000, 1000000, 50000], nB: [5, 5, 1], kfB: [160000, 320000, 20000] },
      scenarier: ["produktionsutrustning som ersätts regelbundet", "ett IT-system med snabb teknisk utveckling",
        "maskinutrustning i löpande produktion", "automatiserad lagerutrustning"],
      mallar: [
        "<p>Ett företag väljer mellan två alternativ för {scenario}. Investeringarna förutsätts <b>upprepas</b> när livslängden löpt ut.</p><p><b>Investering A</b>: grundinvestering <b>{GA}</b>, livslängd <b>{nA} år</b>, betalningsöverskott <b>{kfA}</b>.</p><p><b>Investering B</b>: grundinvestering <b>{GB}</b>, livslängd <b>{nB} år</b>, betalningsöverskott <b>{kfB}</b>.</p><p>Kalkylräntan är <b>{ranta}</b>. Vilken investering bör väljas?</p>",
      ],
    },

    // Platshållare: {budget} {tabell} {ranta}
    budget_kvk: {
      aktiv: true, grupp: "F3",
      rubrik: "Kapitalvärdeskvot",
      teori: `<p>Vid budgetrestriktioner rangordnas oberoende projekt efter kapitalvärdeskvoten (F3).</p>
        <p class="formel">Kapitalvärdeskvot = NPV / G</p>
        <p>Välj uppifrån så länge budgeten räcker. Hoppa över projekt med negativt NPV och projekt som inte ryms.</p>`,
      intervall: { antal: [5, 5, 1], G: [200000, 900000, 50000], ar: [3, 6, 1], overskott: [60000, 320000, 10000], ranta: [6, 14, 1], budgetAndel: [45, 65, 5] },
      mallar: [
        "<p>Ett företag har en investeringsbudget på <b>{budget}</b> i år. Följande oberoende projekt är aktuella. Projekten kan inte delas och varje projekt ger lika stora överskott varje år.</p>{tabell}<p>Kalkylräntan är <b>{ranta}</b>. Vilka projekt bör genomföras?</p>",
      ],
    },

    /* ---------------- F4: ALTERNATIVA METODER ---------------- */

    // Platshållare: {GA} {kfA} {GB} {kfB} {krav} {ranta}
    payback: {
      aktiv: true, grupp: "F4",
      rubrik: "Återbetalningsmetoden",
      teori: `<p>Lägg ihop de odiskonterade inbetalningsöverskotten år för år tills summan minst är lika stor som grundinvesteringen (F4).</p>
        <ul><li><b>Återbetalningsperiod</b>: det år då investeringen betalas tillbaka, t.ex. mellan år 3 och 4.</li>
        <li><b>Återbetalningspunkt</b>: exakt tidpunkt om överskotten antas komma jämnt under året.</li></ul>
        <p class="formel">Punkt = år före + belopp som återstår / överskott under året</p>
        <p>Brister: tar inte hänsyn till pengars tidsvärde eller till det som händer efter återbetalningen.</p>`,
      intervall: { GA: [200000, 600000, 50000], GB: [200000, 600000, 50000], kf: [40000, 260000, 10000], ranta: [6, 12, 1], krav: [3, 4, 1] },
      mallar: [
        "<p>Ett företag har ett krav på att investeringar ska vara återbetalda inom <b>{krav} år</b>. Två alternativa investeringar övervägs:</p><p><b>Investering A</b>: grundinvestering <b>{GA}</b>, betalningsöverskott <b>{kfA}</b>.</p><p><b>Investering B</b>: grundinvestering <b>{GB}</b>, betalningsöverskott <b>{kfB}</b>.</p><p>Överskotten antas komma jämnt fördelat under året. Kalkylräntan är <b>{ranta}</b>.</p>",
      ],
    },

    // Platshållare: {G} {kassafloden} {ranta}
    internranta: {
      aktiv: true, grupp: "F4",
      rubrik: "Internräntemetoden",
      teori: `<p>Internräntan (IRR) är den kalkylränta som ger NPV = 0 (F4). Investeringen är lönsam om internräntan är högre än kalkylräntan.</p>
        <p class="formel">0 = −G + Σ<sub>t=1</sub><sup>T</sup> KF<sub>t</sub> × (1 + IRR)<sup>−t</sup></p>
        <p>På föreläsningen tas internräntan fram genom att räkna NPV vid olika kalkylräntor, t.ex. i Excel med NETNUVÄRDE eller IR.</p>
        <p class="skillnad"><b>Skillnad mot föreläsningen:</b> lösningen visar också linjär interpolation, ett sätt att räkna fram internräntan för hand. Den formeln finns inte på föreläsningen:</p>
        <p class="formel">IRR ≈ r<sub>1</sub> + NPV<sub>1</sub> / (NPV<sub>1</sub> − NPV<sub>2</sub>) × (r<sub>2</sub> − r<sub>1</sub>)</p>`,
      intervall: { G: [300000, 1000000, 50000], ar: [3, 5, 1], kassaflode: [80000, 400000, 10000], ranta: [6, 14, 1], irrMin: [3, 3, 1], irrMax: [30, 30, 1] },
      mallar: [
        "<p>En investering kräver en grundinvestering på <b>{G}</b> och ger betalningsöverskotten <b>{kassafloden}</b>. Företagets kalkylränta är <b>{ranta}</b>.</p><p>Beräkna investeringens internränta (med en decimal) och avgör om investeringen är lönsam.</p>",
      ],
    },

    /* ---------------- F5: RISK OCH OSÄKERHET ---------------- */

    // Platshållare: {produkt} {lista} {fraga}
    kanslighet: {
      aktiv: true, grupp: "F5",
      rubrik: "Känslighetsanalys",
      teori: `<p>Arbetsgång (F5):</p>
        <ol><li>Räkna NPV i grundscenariot.</li>
        <li>Identifiera de viktigaste osäkerheterna.</li>
        <li>Variera en variabel i taget och håll resten konstant.</li>
        <li>Använd rimliga intervall, t.ex. −10 %, 0 % och +10 %.</li>
        <li>Jämför hur mycket NPV ändras.</li>
        <li>Hitta brytpunkter: var blir NPV = 0?</li></ol>
        <p class="formel">KF = volym × (pris − rörlig kostnad) − fasta utbetalningar</p>
        <p class="formel">NPV = −G + KF × (1 − (1 + r)<sup>−n</sup>) / r</p>
        <p class="skillnad"><b>Skillnad mot föreläsningen:</b> föreläsningen beskriver arbetsgången men ingen färdig formel för kassaflödet. Uppställningen med volym, pris och kostnader är övningens.</p>`,
      intervall: { G: [800000, 3000000, 100000], volym: [8000, 30000, 1000], pris: [150, 400, 10], rorligAndel: [40, 65, 5], fasta: [200000, 900000, 50000], ar: [4, 8, 1], ranta: [6, 14, 1], andring: [10, 20, 5] },
      produkter: ["elcyklar", "kaffekoppar", "solcellsmoduler", "kontorsstolar", "vattenrenare"],
      // Vilka delfrågor som kan slumpas
      fragetyper: ["volym_andring", "pris_andring", "ranta_andring", "brytpunkt_volym", "max_G", "brytpunkt_pris"],
      mallar: [
        "<p>Ett företag planerar en ny produktionslinje för <b>{produkt}</b>. Grundscenariot ser ut så här:</p>{lista}<p>a) Beräkna nettonuvärdet i grundscenariot.<br>b) {fraga}</p>",
      ],
    },

    // Platshållare: {G} {ar} {ranta} {tabell}
    scenario: {
      aktiv: true, grupp: "F5",
      rubrik: "Scenarioanalys",
      teori: `<p>Risk föreligger när möjliga utfall och deras sannolikheter kan uppskattas (F5). Räkna NPV i varje scenario och väg ihop.</p>
        <p class="formel">Förväntat NPV = Σ sannolikhet × NPV<sub>scenario</sub></p>
        <p class="skillnad"><b>Skillnad mot föreläsningen:</b> föreläsningen nämner scenarioanalys men visar ingen formel för förväntat NPV. Formeln är ett vägt medelvärde.</p>`,
      intervall: { G: [1000000, 4000000, 100000], ar: [4, 8, 1], ranta: [6, 14, 1], bas: [250000, 900000, 10000], ned: [30, 55, 5], upp: [15, 40, 5] },
      sannolikheter: [[0.25, 0.5, 0.25], [0.2, 0.5, 0.3], [0.3, 0.5, 0.2], [0.2, 0.6, 0.2]],
      mallar: [
        "<p>Ett företag överväger en investering med grundinvesteringen <b>{G}</b> och livslängden <b>{ar} år</b>. Det årliga inbetalningsöverskottet är osäkert och har bedömts i tre scenarier:</p>{tabell}<p>Kalkylräntan är <b>{ranta}</b>. Beräkna NPV i det pessimistiska scenariot och det förväntade nettonuvärdet. Bör investeringen genomföras?</p>",
      ],
    },

    /* ---------------- F6: KALKYLRÄNTAN ---------------- */

    // Platshållare: {foretag} {kapitalText} {rDText} {skatt} {rEText} {projektText}
    wacc: {
      aktiv: true, grupp: "F6",
      rubrik: "WACC",
      teori: `<p>Kalkylräntan kan sättas som företagets vägda genomsnittliga kapitalkostnad (F6).</p>
        <p class="formel">WACC = W<sub>D</sub> × r<sub>D</sub>(1 − T) + W<sub>E</sub> × r<sub>E</sub></p>
        <p>W<sub>D</sub> = D/V och W<sub>E</sub> = E/V. D = räntebärande skulder och E = eget kapital, båda till marknadsvärde. V = D + E, T = bolagsskattesatsen.</p>
        <p class="formel">Gordonmodellen: r<sub>E</sub> = D<sub>1</sub> / P<sub>0</sub> + g</p>
        <p class="skillnad"><b>Skillnad mot föreläsningen:</b> föreläsningens exempel avrundar vikterna till 0,33 och 0,67. Här används exakta vikter, så svaret kan skilja på andra decimalen. Båda godkänns.</p>`,
      intervall: { D: [20, 400, 10], E: [50, 600, 10], rD: [3, 8, 0.5], rE: [8, 15, 0.5], P0: [80, 400, 10], utdelningAndel: [3, 7, 0.5], g: [1, 5, 0.5], G: [1000000, 5000000, 100000], ar: [4, 8, 1], overskott: [200000, 1200000, 10000] },
      skattesatser: [20.6, 20.6, 22, 25],
      skuldkvoter: [0.25, 0.5, 1, 1.5],     // skuld i förhållande till eget kapital
      gordonChans: 0.5,
      kvotChans: 0.4,
      projektChans: 0.5,
      mallar: [
        "<p>{foretag} ska bestämma sin kalkylränta. {kapitalText} {rDText} Bolagsskatten är <b>{skatt}</b>. {rEText}</p><p>Beräkna företagets WACC (i procent med en decimal).{projektText}</p>",
      ],
    },

    /* ---------------- F7: LEASING ---------------- */

    // Platshållare: {foretag} {maskin} {ar} {kop} {leasing} {ranta}
    leasing: {
      aktiv: true, grupp: "F7",
      rubrik: "Leasing eller köp",
      teori: `<p>Jämför nuvärdet av utbetalningarna för köp och leasing (F7). Inbetalningar som är lika för båda alternativen kan strykas.</p>
        <p class="formel">NPV<sub>köp</sub> = −K − U × NUSF + R<sub>T</sub> × (1 + r)<sup>−n</sup></p>
        <p class="formel">NPV<sub>leasing</sub> = −F<sub>0</sub> − L × NUSF</p>
        <p>K = inköpspris, U = underhåll per år, L = leasingavgift i slutet av året, F<sub>0</sub> = förhöjd första avgift (betalas idag), NUSF = nusummefaktorn. Välj det alternativ som har högst (minst negativt) NPV.</p>`,
      intervall: { kop: [150000, 1500000, 10000], restvardeAndel: [10, 35, 5], ar: [3, 6, 1], ranta: [6, 14, 1], underhall: [5000, 40000, 1000], forstaAndel: [10, 20, 5], leasingSpridning: [-8, 8, 1] },
      forstaAvgiftChans: 0.4,
      underhallChans: 0.4,
      maskiner: ["maskin", "lastbil", "truck", "kopieringsmaskin", "industrirobot"],
      mallar: [
        "<p>{foretag} behöver en <b>{maskin}</b> under <b>{ar} år</b> och funderar på att köpa eller leasa den.</p><p><b>Köp:</b> {kop}</p><p><b>Leasing:</b> {leasing}</p><p>Kalkylräntan är <b>{ranta}</b>. Beräkna NPV för båda alternativen. Bör företaget köpa eller leasa?</p>",
      ],
    },
  },
};
