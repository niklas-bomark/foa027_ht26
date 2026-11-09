# Investeringsbedömning – övningar

Slumpade räkneövningar med rättning och steg-för-steg-lösningar för FOA027, delkurs 3 (investeringsbedömning). Sidan är helt statisk – HTML, CSS och JavaScript – och körs gratis på GitHub Pages. Ingen server behövs, så det kostar inget oavsett hur många studenter som använder den samtidigt.

## Innehåll

| Föreläsning | Övningar |
|---|---|
| F2 Pengars tidsvärde | Slutvärde, nuvärde, nuvärde och slutvärde av betalningsström, nuvärde och slutvärde av lika stora belopp (nusummefaktor, slutvärdefaktor), annuitet |
| F3 Nettonuvärdesmetoden | NNV med lika överskott, NNV med irrelevant information och sunk costs, ersättningsinvestering, slutvärde/nettoslutvärde, jämföra engångsinvesteringar, annuitetsmetoden, upprepade investeringar, budgetrestriktion (kapitalvärdeskvot) |
| F4 Alternativa metoder | Återbetalningsmetoden (inkl. diskonterad), internräntemetoden |
| F5 Risk och osäkerhet | Känslighetsanalys med brytpunkter, tornadodiagram och reglage, scenarioanalys |
| F6 Kalkylräntan | WACC, avkastningskrav med Gordonmodellen, NNV med WACC |
| F7 Leasing | Leasing eller köp (restvärde, underhåll, förhöjd första avgift) |

Varje fråga har ett **frågenummer**. Samma nummer ger alltid samma fråga, så studenter kan dela en länk till exakt den uppgift de fastnat på. Under *Lärare: skriv ut övningsblad* skapas utskriftsbara blad med facit.

## Publicera på GitHub Pages (en gång)

1. Skapa ett nytt **publikt** repository på github.com, till exempel `investeringskalkyler`.
2. Klicka **Add file → Upload files** och dra in *innehållet* i den här mappen (index.html, mapparna `css`, `js`, `tests` och övriga filer). Klicka **Commit changes**.
3. Gå till **Settings → Pages**. Under *Build and deployment* väljer du *Source: Deploy from a branch*, *Branch: main* och mappen */ (root)*. Spara.
4. Efter någon minut finns sidan på `https://<ditt-användarnamn>.github.io/investeringskalkyler/`.

Du kan också öppna `index.html` direkt i webbläsaren på din dator för att prova – det fungerar utan internet (typsnitten faller då tillbaka till systemets).

## Ändra frågorna

Allt studenterna ser styrs från **`js/fragebank.js`**. Du kan redigera filen direkt på GitHub (klicka på filen → pennan → *Commit changes*); sidan uppdateras inom någon minut.

För varje övning finns:

- `aktiv: true/false` – visa eller dölj övningen.
- `rubrik` och `teori` – namn i menyn och teorirutan (HTML är tillåtet).
- `intervall` – vilka tal som slumpas, skrivet `[min, max, steg]`. Räntor i procent: `ranta: [2, 12, 1]` ger 2 %, 3 %, …, 12 %.
- `mallar` – frågetexter. En mall slumpas per fråga, och `{platshållare}` ersätts med siffror. Vilka platshållare som finns står i kommentaren ovanför varje övning.
- Listor som `scenarier`, `maskiner`, `irrelevant` – lägg till en rad för att få mer variation.

Exempel – lägg till en ny formulering för annuitetsfrågan:

```js
mallar: [
  "Hur stor blir den årliga betalningen för ett lån på {belopp} med räntan {ranta} och löptiden {ar} år?",
  "Ett företag lånar {belopp} till en ny lastbil. Lånet betalas med lika stora belopp i {ar} år och räntan är {ranta}. Vad blir den årliga betalningen?",
],
```

Exempel – lägg till irrelevant information (sunk cost) i NNV-övningen:

```js
{ text: "Företaget betalade {belopp} för en konsultrapport förra året.", varfor: "Sunk cost – redan betald." },
```

Tolerans för rätt svar ställs in högst upp (`tolerans.relativ`, standard 0,5 %). Det gör att svar räknade med tabellvärden på fyra decimaler godkänns.

**Kontrollera efter ändringar:** kommatecken mellan raderna, och att citattecken öppnas och stängs. Blir sidan tom har det oftast blivit ett skrivfel – öppna webbläsarens konsol (F12) så står raden där.

## Formler: föreläsningar och övningar

Övningarna använder samma formler och beteckningar som föreläsningarna F2–F7 (NPV, KF<sub>t</sub>, R<sub>T</sub>, G, r, NUSF, W<sub>D</sub>, W<sub>E</sub>). Alla formler finns på sidan under **Formelsamling**. Där övningarna går utöver föreläsningen står det en kort kommentar i teorirutan:

| Övning | Skillnad mot föreläsningen |
|---|---|
| Nettoslutvärde | Ingen egen formel på föreläsningarna. Bygger på slutvärdesformeln i F2 och ger samma beslut som NPV (NSV = NPV × (1 + r)<sup>T</sup>). |
| Internräntemetoden | F4 tar fram internräntan genom att räkna NPV vid olika räntor i Excel. Lösningen visar även linjär interpolation som ett sätt att räkna för hand. |
| Känslighetsanalys | F5 beskriver arbetsgången. Uppställningen KF = volym × (pris − rörlig kostnad) − fasta utbetalningar är övningens egen. |
| Scenarioanalys | Förväntat NPV (vägt medelvärde) visas inte som formel på föreläsningen. |
| WACC | F6:s exempel avrundar vikterna till 0,33 och 0,67. Övningen räknar med exakta vikter; båda svaren godkänns. |
| Slutvärde – lika belopp | Lösningen visar även SV = NV × (1 + r)<sup>n</sup> (nuvärdet räknat med nusummefaktorn). Ungefär var tredje fråga har flera räntetillskrivningar per år med årliga insättningar; då räknas med effektiv årsränta. F2-bildens exempel "100 kr per år" (364,1 kr) räknar insättningarna som gjorda år 0–2. Med insättning i slutet av året, som slutvärdefaktorn förutsätter, blir svaret 331 kr. |
| Annuitet (F2b) | Föreläsningen avrundar annuitetsfaktorn till fyra decimaler (15 184 kr i stället för exakt 15 188 kr). Båda godkänns. |

Perpetuitet, ROI och effektiv ränta (F2) finns i formelsamlingen men har inga egna övningar.

## Filer

```
index.html          själva sidan
css/style.css       utseende (färger högst upp i filen)
js/fragebank.js     ← frågetexter, intervall och teori (redigera här)
js/finans.js        räntematematik, slumptal och svensk formatering
js/moduler.js       skapar frågor, facit och lösningar
js/diagram.js       tidslinjer, NNV-kurva, tornadodiagram, reglage
js/app.js           navigering, rättning och lärarläge
tests/              automatiska kontroller (kräver Node.js)
```

## Tester

Med Node.js installerat:

```
node tests/rok.js        # skapar 400 frågor per övning och letar fel
node tests/verifiera.js  # jämför mot föreläsningarnas exempel och kontrollerar facit
```

`verifiera.js` kontrollerar bland annat slutvärdefaktorn mot F2, att övningarna med lika belopp stämmer med summaformeln, exemplen från F2b (nuvärde, slutvärde, annuitet, betalningsströmmar), F4 (återbetalningstid för kaffekoppsmaskinen), F6 (WACC-exemplet 8,0 %) och F7 (leasingexemplen).

## Ändringar jämfört med Shiny-apparna

Vid genomgången av R-koden hittades följande, som är rättat här:

1. **Appen startade inte.** `nnv_server` fanns inte – modul 3:s serverfunktion hette av misstag `slutvarde_server` och skrev över modul 2:s.
2. **Modul 2 (slutvärde)** använde variabler som inte fanns (`overskott`, `r`, `rv` …) och kraschade vid "Slumpa ny fråga". Lösningen visade bara slutvärdet även när frågan gällde nettoslutvärde.
3. **Modul 8 (kapitalvärdeskvot)** var metodiskt fel: två ömsesidigt uteslutande projekt ska väljas på högst NNV, inte KVK, och budgeten användes aldrig. Nu finns flera oberoende projekt och en budget som inte räcker till alla – det läge där KVK är rätt metod. Lösningen visar också vad en rangordning efter NNV hade gett.
4. **Annuitet, sparande** (`questions_onetime.R`): "bygga upp ett kapital på X kr" är ett *slutvärde*, men facit räknades med nuvärdesannuiteten. Scenariot är omskrivet till ett uttag från ett arv, där formeln stämmer.
5. **Slutvärde av betalningsström** angav inte att beloppen betalas i slutet av året. Det står nu i frågan.
6. Modul 4 och 5 kraschade om man klickade "Visa lösning" innan en fråga skapats. Alternativet "ingen investering" saknades när alla NNV var negativa.
7. Föreläsningsbilderna (F2b) avrundar annuitetsfaktorn till fyra decimaler, t.ex. 0,1168 → 15 184 kr. Exakt är 15 188 kr. Båda godkänns tack vare toleransen.

Nytt jämfört med Shiny: rättning av elevens svar med återkoppling (för högt/lågt, fel tecken, procent vs decimal), ledtrådar, tidslinjer, frågenummer och delbara länkar, utskriftsbara övningsblad, mobilanpassning och mörkt läge, samt övningarna för annuitetsmetoden, återbetalning, internränta, känslighets- och scenarioanalys, WACC och leasing.
