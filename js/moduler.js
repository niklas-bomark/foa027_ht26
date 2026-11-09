/* ============================================================
   moduler.js – skapar frågor, facit och lösningar
   Varje generator får (R, c, bank):
     R    = seedad slumptalsgenerator (samma frågenummer -> samma fråga)
     c    = övningens inställningar i fragebank.js
     bank = hela frågebanken
   och returnerar ett frågeobjekt:
     { fraga, svar[], ledtrad, steg[], slutsats, tidslinjer[], extra[] }
   ============================================================ */
(function (root) {
  "use strict";
  const Fi = root.Finans || (typeof require !== "undefined" ? require("./finans.js") : null);
  const { F, tal, kr, pct, fakt, fyll } = Fi;

  // ---------- Hjälpfunktioner ----------
  const range = (n) => Array.from({ length: n }, (_, i) => i + 1);
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  const rp = (p) => pct(p / 100); // procenttal -> "8 %"
  const runda = (x, steg) => Math.round(x / steg) * steg;
  let REL = 0.005;
  const tolKr = (x, min) => Math.max(min || 1, Math.abs(x) * REL);
  const formel = (s) => `<span class="formel">${s}</span>`;
  const kfText = (cf) => cf.map((c, i) => `år ${i + 1}: ${kr(c)}`).join(", ");

  function tabell(huvud, rader, fot) {
    const th = huvud.map((h) => `<th>${h}</th>`).join("");
    const tr = rader.map((r) => "<tr>" + r.map((c) => `<td>${c}</td>`).join("") + "</tr>").join("");
    const tf = fot ? "<tfoot><tr>" + fot.map((c) => `<td>${c}</td>`).join("") + "</tr></tfoot>" : "";
    return `<div class="tabwrap"><table class="tab"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody>${tf}</table></div>`;
  }
  function lista(poster) { return "<ul class=\"data\">" + poster.map((p) => `<li>${p}</li>`).join("") + "</ul>"; }

  // Diskonteringstabell för en ström (+ ev. restvärde)
  function nvTabell(cf, r, rv) {
    const rader = cf.map((c, i) => {
      const t = i + 1, f = F.nvf(r, t);
      return [String(t), kr(c), fakt(f), kr(c * f)];
    });
    let tot = F.nvStrom(cf, r);
    if (rv) {
      const n = cf.length, f = F.nvf(r, n);
      rader.push([`${n} (restvärde)`, kr(rv), fakt(f), kr(rv * f)]);
      tot += rv * f;
    }
    return { html: tabell(["År", "Kassaflöde", "(1 + r)<sup>−t</sup>", "Nuvärde"], rader, ["Summa", "", "", `<b>${kr(tot)}</b>`]), tot };
  }

  const JaNej = [{ v: "ja", t: "Ja, lönsam" }, { v: "nej", t: "Nej, inte lönsam" }];
  const ABIngen = [{ v: "A", t: "Investering A" }, { v: "B", t: "Investering B" }, { v: "ingen", t: "Ingen av dem" }];

  // Bygg lista med relevant + irrelevant info i blandad ordning
  function medIrrelevant(R, relevanta, c, antal) {
    const valda = R.urval(c.irrelevant, antal).map((it) => {
      const b = R.steg(c.intervall.irrelevantBelopp);
      return { text: fyll(it.text, { belopp: kr(b) }), varfor: it.varfor };
    });
    const alla = relevanta.slice();
    valda.forEach((v) => alla.splice(R.int(1, alla.length), 0, v.text));
    return { listaHtml: lista(alla), irr: valda };
  }
  const irrSteg = (irr) => ({
    r: "Sortera bort irrelevant information",
    h: "<ul>" + irr.map((i) => `<li><s>${i.text}</s><br><span class="varfor">${i.varfor}</span></li>`).join("") + "</ul>",
  });

  const M = {};

  /* =================== F2 =================== */

  M.slutvarde = (R, c) => {
    const I = c.intervall;
    const B = R.steg(I.belopp), r = R.steg(I.ranta) / 100, n = R.steg(I.ar), m = R.valj(I.tillskrivning);
    const pr = r / m, N = m * n, fv = B * Math.pow(1 + pr, N);
    return {
      fraga: fyll(R.valj(c.mallar), { belopp: kr(B), ranta: pct(r), ar: n, tillskrivning: m }),
      svar: [{ id: "sv", etikett: "Slutvärde", enhet: "kr", facit: fv, tol: tolKr(fv) }],
      ledtrad: "Räkna först ut periodräntan (årsränta delat med antal tillskrivningar per år) och antalet perioder (år × tillskrivningar).",
      steg: [
        { r: "Periodränta", h: `${pct(r)} / ${m} = <b>${tal(pr * 100, 4).replace(/,?0+$/, "")} %</b> = ${fakt(pr, 6).replace(/0+$/, "")}` },
        { r: "Antal perioder", h: `${n} år × ${m} = <b>${N}</b>` },
        { r: "Formel", h: formel(`SV = ${kr(B)} × (1 + ${fakt(pr, 6).replace(/0+$/, "")})<sup>${N}</sup>`) },
        { r: "Slutvärde", h: `<b>${kr(fv)}</b>` },
      ],    };
  };

  M.nuvarde = (R, c) => {
    const I = c.intervall;
    const B = R.steg(I.belopp), r = R.steg(I.ranta) / 100, n = R.steg(I.ar);
    const f = F.nvf(r, n), pv = B * f;
    return {
      fraga: fyll(R.valj(c.mallar), { belopp: kr(B), ranta: pct(r), ar: n }),
      svar: [{ id: "nv", etikett: "Nuvärde", enhet: "kr", facit: pv, tol: tolKr(pv) }],
      ledtrad: "Multiplicera beloppet med nuvärdesfaktorn (1 + r)<sup>−n</sup>.",
      steg: [
        { r: "Antal perioder", h: `<b>${n}</b> år` },
        { r: "Nuvärdesfaktor", h: formel(`(1 + ${tal(r, 2)})<sup>−${n}</sup> = ${fakt(f)}`) },
        { r: "Nuvärde", h: formel(`${kr(B)} × ${fakt(f)} = <b>${kr(pv)}</b>`) },
      ],    };
  };

  M.nuvarde_strom = (R, c) => {
    const I = c.intervall;
    const n = R.steg(I.ar), r = R.steg(I.ranta) / 100, cf = R.serie(I.kassaflode, n);
    const t = nvTabell(cf, r);
    return {
      fraga: fyll(R.valj(c.mallar), { kassafloden: kfText(cf), ranta: pct(r), ar: n }),
      svar: [{ id: "nv", etikett: "Nuvärde", enhet: "kr", facit: t.tot, tol: tolKr(t.tot) }],
      ledtrad: "Ställ upp en tabell: år, kassaflöde, nuvärdesfaktor och nuvärde. Summera nuvärdena.",
      steg: [
        { r: "Diskontera varje år för sig", h: t.html },
        { r: "Summera", h: `Nuvärde: <b>${kr(t.tot)}</b>` },
      ],
      tidslinjer: [{ n, poster: cf.map((v, i) => ({ t: i + 1, v, typ: "in" })), pil: { fran: n, till: 0, text: "diskontera" } }],
    };
  };

  M.slutvarde_strom = (R, c) => {
    const I = c.intervall;
    const n = R.steg(I.ar), r = R.steg(I.ranta) / 100, cf = R.serie(I.kassaflode, n);
    const rader = cf.map((v, i) => { const e = n - (i + 1), f = F.svf(r, e); return [String(i + 1), kr(v), String(e), fakt(f), kr(v * f)]; });
    const sv = F.svStrom(cf, r);
    return {
      fraga: fyll(R.valj(c.mallar), { kassafloden: kfText(cf), ranta: pct(r), ar: n }),
      svar: [{ id: "sv", etikett: "Slutvärde", enhet: "kr", facit: sv, tol: tolKr(sv) }],
      ledtrad: `Ett belopp som betalas år t växer i (${n} − t) år. Det sista beloppet växer inte alls.`,
      steg: [
        { r: "Räkna upp varje belopp till år " + n, h: tabell(["År", "Belopp", "Antal år kvar", "(1 + r)<sup>n−t</sup>", "Värde år " + n], rader, ["Summa", "", "", "", `<b>${kr(sv)}</b>`]) },
      ],    };
  };

  // Kontrolltabell med den allmänna formeln (för lika stora belopp)
  function kontrollTabell(kf, r, n, typ) {
    if (n > 10) return `<p class="varfor">Med ${n} år blir tabellen lång, men summan av alla ${typ === "nv" ? "diskonterade" : "uppräknade"} belopp ger exakt samma svar.</p>`;
    let s = 0;
    const rader = range(n).map((t) => {
      const e = typ === "nv" ? -t : n - t, f = Math.pow(1 + r, e), v = kf * f; s += v;
      return [String(t), kr(kf), fakt(f), kr(v)];
    });
    const rub = typ === "nv" ? "(1 + r)<sup>−t</sup>" : "(1 + r)<sup>n−t</sup>";
    return tabell(["År", "Belopp", rub, typ === "nv" ? "Nuvärde" : "Värde år " + n], rader, ["Summa", "", "", `<b>${kr(s)}</b>`]);
  }

  M.nuvarde_lika = (R, c) => {
    const I = c.intervall;
    const kf = R.steg(I.kf), r = R.steg(I.ranta) / 100, n = R.steg(I.ar);
    const nusf = F.nusf(r, n), pv = kf * nusf;
    return {
      fraga: fyll(R.valj(c.mallar), { kf: kr(kf), ranta: pct(r), ar: n }),
      svar: [{ id: "nv", etikett: "Nuvärde", enhet: "kr", facit: pv, tol: tolKr(pv) }],
      ledtrad: "Beloppet är lika stort varje år. Räkna nusummefaktorn (1 − (1 + r)<sup>−n</sup>) / r och multiplicera med beloppet.",
      steg: [
        { r: "Nusummefaktor", h: formel(`NUSF = (1 − (1 + ${tal(r, 2)})<sup>−${n}</sup>) / ${tal(r, 2)} = ${fakt(nusf)}`) },
        { r: "Nuvärde", h: formel(`PV = ${kr(kf)} × ${fakt(nusf)} = <b>${kr(pv)}</b>`) },
        { r: "Kontroll med den allmänna formeln", h: kontrollTabell(kf, r, n, "nv") },
      ],
      slutsats: `Nusummefaktorn ger samma svar som att diskontera varje år för sig och summera.`,
      tidslinjer: [{ n, poster: range(n).map((t) => ({ t, v: kf, typ: "in" })), pil: { fran: n, till: 0, text: "diskontera" } }],
    };
  };

  M.slutvarde_lika = (R, c) => {
    const I = c.intervall;
    const kf = R.steg(I.kf), r = R.steg(I.ranta) / 100, n = R.steg(I.ar);
    const m = R.chans(c.tillskrivningChans) ? R.valj(I.tillskrivning) : 1;
    const re = m === 1 ? r : F.eff(r, m);
    const svsf = F.svsf(re, n), sv = kf * svsf;
    const nusf = F.nusf(re, n), nv = kf * nusf, upp = Math.pow(1 + r / m, m * n);
    const rTxt = m === 1 ? tal(r, 2) : fakt(re, 6);
    const steg = [];
    if (m > 1) {
      steg.push({ r: "Effektiv årsränta", h: `Insättningarna görs en gång per år men räntan läggs till ${m} gånger per år. Räkna därför om till effektiv årsränta:<br>`
        + formel(`r<sub>eff</sub> = (1 + ${tal(r, 2)}/${m})<sup>${m}</sup> − 1 = ${fakt(re, 6)} = ${pct(re, 3)}`) });
    }
    steg.push(
      { r: "Sätt 1: Slutvärdefaktorn", h: formel(`SVF = ((1 + ${rTxt})<sup>${n}</sup> − 1) / ${rTxt} = ${fakt(svsf)}`) + "<br>" + formel(`FV = ${kr(kf)} × ${fakt(svsf)} = <b>${kr(sv)}</b>`) },
      { r: "Sätt 2: Nuvärde först, sedan uppräkning", h: formel(`NV = ${kr(kf)} × (1 − (1 + ${rTxt})<sup>−${n}</sup>) / ${rTxt} = ${kr(kf)} × ${fakt(nusf)} = ${kr(nv)}`) + "<br>"
        + (m === 1
          ? formel(`SV = ${kr(nv)} × (1 + ${tal(r, 2)})<sup>${n}</sup> = ${kr(nv)} × ${fakt(upp)} = <b>${kr(nv * upp)}</b>`)
            + `<br><span class="varfor">Det är SV = KF<sub>0</sub> × (1 + r/m)<sup>m·n</sup> med m = 1, använd på nuvärdet (ett enda belopp).</span>`
          : formel(`SV = ${kr(nv)} × (1 + ${tal(r, 2)}/${m})<sup>${m * n}</sup> = ${kr(nv)} × ${fakt(upp)} = <b>${kr(nv * upp)}</b>`)
            + `<br><span class="varfor">Exponenten är m·n = ${m} × ${n} = ${m * n} perioder. Formeln SV = KF<sub>0</sub> × (1 + r/m)<sup>m·n</sup> fungerar här eftersom nuvärdet är ett enda belopp. Nuvärdet måste dock räknas med den effektiva årsräntan.</span>`) },
    );
    if (m === 1) steg.push({ r: "Sätt 3: Den allmänna formeln", h: kontrollTabell(kf, r, n, "sv") });
    const felR = kf * F.svsf(r, n);
    return {
      fraga: fyll(R.valj(c.mallar), { kf: kr(kf), ranta: pct(r), ar: n, tillskrivningText: m === 1 ? "" : ` (räntetillskrivning ${m} gånger per år)` }),
      svar: [{ id: "sv", etikett: "Slutvärde", enhet: "kr", facit: sv, tol: tolKr(sv) }],
      ledtrad: m === 1
        ? "Beloppen är lika stora varje år: använd slutvärdefaktorn ((1 + r)<sup>n</sup> − 1) / r. Eller räkna nuvärdet med nusummefaktorn och räkna upp det n år."
        : `Insättningarna sker en gång per år, men räntan tillskrivs ${m} gånger per år. Räkna först ut den effektiva årsräntan (1 + r/m)<sup>m</sup> − 1 och använd den i slutvärdefaktorn.`,
      steg,
      slutsats: m === 1
        ? "Alla tre sätten ger samma slutvärde. Slutvärdefaktorn är snabbast, men nuvärde × (1 + r)<sup>n</sup> fungerar lika bra."
        : `Båda sätten ger samma slutvärde. Om man räknar med ${pct(r)} rakt av och bortser från tillskrivningarna får man ${kr(felR)}, alltså för lite.`,
      tidslinjer: [{ n, poster: range(n).map((t) => ({ t, v: kf, typ: "in" })), pil: { fran: 0, till: n, text: "räkna upp" } }],
    };
  };

  M.annuitet = (R, c) => {
    const I = c.intervall;
    const B = R.steg(I.belopp), r = R.steg(I.ranta) / 100, n = R.steg(I.ar);
    const namn = 1 - F.nvf(r, n), af = r / namn, A = B * af;
    let skuld = B; const rader = [];
    for (let t = 1; t <= n; t++) {
      const ranta = skuld * r, amort = A - ranta, ut = skuld - amort;
      rader.push([String(t), kr(skuld), kr(ranta), kr(amort), kr(A), kr(Math.abs(ut) < 0.5 ? 0 : ut)]);
      skuld = ut;
    }
    return {
      fraga: fyll(R.valj(c.mallar), { belopp: kr(B), ranta: pct(r), ar: n }),
      svar: [{ id: "a", etikett: "Årlig betalning", enhet: "kr", facit: A, tol: tolKr(A) }],
      ledtrad: "Räkna först nämnaren 1 − (1 + r)<sup>−n</sup>, sedan annuitetsfaktorn r / nämnaren.",
      steg: [
        { r: "Nämnaren", h: formel(`1 − (1 + ${tal(r, 2)})<sup>−${n}</sup> = ${fakt(namn)}`) },
        { r: "Annuitetsfaktor", h: formel(`${tal(r, 2)} / ${fakt(namn)} = ${fakt(af)}`) },
        { r: "Annuitet", h: formel(`${kr(B)} × ${fakt(af)} = <b>${kr(A)}</b>`) },
      ],    };
  };

  /* =================== F3 =================== */

  M.nnv_rationalisering = (R, c) => {
    const I = c.intervall;
    const G = R.steg(I.G), a = R.steg(I.besparing), n = R.steg(I.ar), r = R.steg(I.ranta) / 100;
    const harRV = R.chans(c.restvardeChans), RV = harRV ? R.steg(I.restvarde) : 0;
    const nusf = F.nusf(r, n), nvA = a * nusf, nvRV = RV * F.nvf(r, n), nnv = nvA + nvRV - G;
    const steg = [
      { r: "Nusummefaktor", h: formel(`(1 − (1 + ${tal(r, 2)})<sup>−${n}</sup>) / ${tal(r, 2)} = ${fakt(nusf)}`) },
      { r: "Nuvärde av besparingarna", h: formel(`${kr(a)} × ${fakt(nusf)} = ${kr(nvA)}`) },
    ];
    if (harRV) steg.push({ r: "Nuvärde av restvärdet", h: formel(`${kr(RV)} × (1 + ${tal(r, 2)})<sup>−${n}</sup> = ${kr(nvRV)}`) });
    steg.push({ r: "Nettonuvärde", h: formel(`−${kr(G)} + ${kr(nvA)}${harRV ? " + " + kr(nvRV) : ""} = <b>${kr(nnv)}</b>`) });
    return {
      fraga: fyll(R.valj(c.mallar), {
        scenario: R.valj(c.scenarier), G: kr(G), besparing: kr(a), ar: n, ranta: pct(r),
        restvardeText: harRV ? `Restvärdet efter ${n} år beräknas till <b>${kr(RV)}</b>.` : "Investeringen har inget restvärde.",
      }),
      svar: [
        { id: "nnv", etikett: "Nettonuvärde", enhet: "kr", facit: nnv, tol: tolKr(G, 500) },
        { id: "beslut", etikett: "Är investeringen lönsam?", typ: "val", alternativ: JaNej, facit: nnv >= 0 ? "ja" : "nej" },
      ],
      ledtrad: "Besparingen är lika stor varje år – använd nusummefaktorn. Glöm inte att dra av grundinvesteringen.",
      steg,
      slutsats: nnv >= 0 ? `NPV är positivt (${kr(nnv)}). Investeringen ger mer än kalkylräntan ${pct(r)} och är lönsam.` : `NPV är negativt (${kr(nnv)}). Besparingarna räcker inte för att ge kalkylräntan ${pct(r)}; investeringen är inte lönsam.`,
      tidslinjer: [{ n, poster: [{ t: 0, v: -G, typ: "ut" }].concat(range(n).map((t) => ({ t, v: a + (t === n ? RV : 0), typ: "in" }))) }],
    };
  };

  M.nnv_produktion = (R, c, bank) => {
    const I = c.intervall;
    let G, V, p, L, D, n, RV, r, a;
    for (let k = 0; k < 200; k++) {
      G = R.steg(I.G); V = R.steg(I.volym); p = R.steg(I.pris); L = R.steg(I.loner); D = R.steg(I.drift);
      n = R.steg(I.ar); RV = R.steg(I.restvarde); r = R.steg(I.ranta) / 100;
      a = V * p - L - D;
      if (a > 0.08 * G) break;
    }
    const relevanta = [
      `Grundinvestering: ${kr(G)}`,
      `Försäljning: ${tal(V)} st per år`,
      `Försäljningspris: ${kr(p)} per st`,
      `Lönekostnader för maskinen: ${kr(L)} per år`,
      `Drift- och underhållskostnader: ${kr(D)} per år`,
      `Ekonomisk livslängd: ${n} år`,
      `Restvärde efter ${n} år: ${kr(RV)}`,
      `Kalkylränta: ${pct(r)}`,
    ];
    const { listaHtml, irr } = medIrrelevant(R, relevanta, c, R.steg(I.antalIrrelevanta));
    const nusf = F.nusf(r, n), nvA = a * nusf, nvRV = RV * F.nvf(r, n), nnv = nvA + nvRV - G;
    return {
      fraga: fyll(R.valj(c.mallar), { foretag: R.valj(bank.foretag), maskin: R.valj(c.maskiner), lista: listaHtml }),
      svar: [{ id: "nnv", etikett: "Nettonuvärde", enhet: "kr", facit: nnv, tol: tolKr(G, 500) }],
      ledtrad: "Fråga dig för varje post: uppstår betalningen <em>på grund av</em> investeringen? Om inte – stryk den.",
      steg: [
        irrSteg(irr),
        { r: "Årligt inbetalningsöverskott", h: formel(`${tal(V)} × ${kr(p)} − ${kr(L)} − ${kr(D)} = ${kr(a)}`) },
        { r: "Nuvärde av överskotten", h: formel(`${kr(a)} × nusummefaktor(${pct(r)}, ${n} år) = ${kr(a)} × ${fakt(nusf)} = ${kr(nvA)}`) },
        { r: "Nuvärde av restvärdet", h: formel(`${kr(RV)} × (1 + ${tal(r, 2)})<sup>−${n}</sup> = ${kr(nvRV)}`) },
        { r: "Nettonuvärde", h: formel(`−${kr(G)} + ${kr(nvA)} + ${kr(nvRV)} = <b>${kr(nnv)}</b>`) },
      ],
      slutsats: nnv >= 0 ? "NPV ≥ 0: investeringen är lönsam." : "NPV < 0: investeringen är inte lönsam.",
      tidslinjer: [{ n, poster: [{ t: 0, v: -G, typ: "ut" }].concat(range(n).map((t) => ({ t, v: a + (t === n ? RV : 0), typ: "in" }))) }],
    };
  };

  M.nnv_ersattning = (R, c, bank) => {
    const I = c.intervall;
    const G = R.steg(I.G), lb = R.steg(I.lonbesparing), eb = R.steg(I.energibesparing), n = R.steg(I.ar), r = R.steg(I.ranta) / 100;
    const harS = R.chans(c.gammalChans), S = harS ? R.steg(I.gammalForsaljning) : 0;
    const relevanta = [
      `Den nya maskinen kostar ${kr(G)}`,
      harS ? `Den gamla maskinen kan säljas idag för ${kr(S)}` : "Den gamla maskinen saknar försäljningsvärde",
      `Minskade lönekostnader: ${kr(lb)} per år`,
      `Minskade energikostnader: ${kr(eb)} per år`,
      `Ekonomisk livslängd för den nya maskinen: ${n} år, inget restvärde`,
      `Kalkylränta: ${pct(r)}`,
    ];
    const { listaHtml, irr } = medIrrelevant(R, relevanta, c, R.int(1, 2));
    const a = lb + eb, nusf = F.nusf(r, n), nvA = a * nusf, nnv = nvA - G + S;
    const steg = [irrSteg(irr)];
    if (harS) steg.push({ r: "Grundinvestering netto", h: formel(`${kr(G)} − ${kr(S)} = ${kr(G - S)}`) + "<br>Försäljningen av den gamla maskinen sker bara om vi byter, så den är en relevant inbetalning år 0." });
    steg.push(
      { r: "Årligt överskott (besparingar)", h: formel(`${kr(lb)} + ${kr(eb)} = ${kr(a)}`) },
      { r: "Nuvärde av besparingarna", h: formel(`${kr(a)} × ${fakt(nusf)} = ${kr(nvA)}`) },
      { r: "Nettonuvärde", h: formel(`−${kr(G - S)} + ${kr(nvA)} = <b>${kr(nnv)}</b>`) },
    );
    return {
      fraga: fyll(R.valj(c.mallar), { foretag: R.valj(bank.foretag), lista: listaHtml }),
      svar: [{ id: "nnv", etikett: "Nettonuvärde", enhet: "kr", facit: nnv, tol: tolKr(G, 500) }],
      ledtrad: "Kassaflödena är skillnaden mellan att byta och att behålla. Vad påverkas faktiskt av beslutet?",
      steg,
      slutsats: nnv >= 0 ? "NPV ≥ 0: bytet är lönsamt." : "NPV < 0: det är inte lönsamt att byta maskin.",
      tidslinjer: [{ n, poster: [{ t: 0, v: -(G - S), typ: "ut" }].concat(range(n).map((t) => ({ t, v: a, typ: "in" }))) }],
    };
  };

  M.nettoslutvarde = (R, c) => {
    const I = c.intervall;
    const G = R.steg(I.G), RV = R.steg(I.restvarde), r = R.steg(I.ranta) / 100, n = R.steg(I.ar);
    const cf = R.serie(I.kassaflode, n), typ = R.valj(["sv", "nsv"]);
    const rader = cf.map((v, i) => { const e = n - (i + 1), f = F.svf(r, e); return [String(i + 1), kr(v), fakt(f), kr(v * f)]; });
    rader.push([`${n} (restvärde)`, kr(RV), fakt(1), kr(RV)]);
    const sv = F.svStrom(cf, r) + RV, Gs = G * F.svf(r, n), nsv = sv - Gs, nnv = F.nnv(G, cf, r, RV);
    const steg = [{ r: "Räkna upp överskotten till år " + n, h: tabell(["År", "Överskott", "(1 + r)<sup>n−t</sup>", "Värde år " + n], rader, ["Summa", "", "", `<b>${kr(sv)}</b>`]) + "<p>Restvärdet räknas inte upp.</p>" }];
    if (typ === "nsv") steg.push(
      { r: "Räkna upp grundinvesteringen", h: formel(`${kr(G)} × (1 + ${tal(r, 2)})<sup>${n}</sup> = ${kr(Gs)}`) },
      { r: "Nettoslutvärde", h: formel(`${kr(sv)} − ${kr(Gs)} = <b>${kr(nsv)}</b>`) });
    return {
      fraga: fyll(R.valj(c.mallar), { scenario: R.valj(c.scenarier), G: kr(G), kassafloden: kfText(cf), restvarde: kr(RV), ranta: pct(r), fraga: c.fragor[typ] }),
      svar: [typ === "sv"
        ? { id: "sv", etikett: "Slutvärde av överskotten", enhet: "kr", facit: sv, tol: tolKr(sv) }
        : { id: "nsv", etikett: "Nettoslutvärde", enhet: "kr", facit: nsv, tol: tolKr(Gs, 500) }],
      ledtrad: typ === "sv" ? "Varje överskott växer från året det betalas till sista året. Restvärdet läggs till utan uppräkning." : "Räkna upp både överskotten och grundinvesteringen till sista året och ta skillnaden.",
      steg,
      tidslinjer: [{ n, poster: [{ t: 0, v: -G, typ: "ut" }].concat(cf.map((v, i) => ({ t: i + 1, v: v + (i + 1 === n ? RV : 0), typ: "in" }))), pil: { fran: 0, till: n, text: "räkna upp" } }],
    };
  };

  function tvaInvesteringar(R, I) {
    const r = R.steg(I.ranta) / 100;
    const A = { G: R.steg(I.GA), n: R.steg(I.nA) }; A.cf = R.serie(I.kfA, A.n);
    const B = { G: R.steg(I.GB), n: R.steg(I.nB) }; B.cf = R.serie(I.kfB, B.n);
    [A, B].forEach((x) => { x.nnv = F.nnv(x.G, x.cf, r); x.af = F.af(r, x.n); x.ann = x.nnv * x.af; });
    return { r, A, B };
  }
  const tidsl2 = (A, B) => [
    { namn: "A", n: Math.max(A.n, B.n), poster: [{ t: 0, v: -A.G, typ: "ut" }].concat(A.cf.map((v, i) => ({ t: i + 1, v, typ: "in" }))) },
    { namn: "B", n: Math.max(A.n, B.n), poster: [{ t: 0, v: -B.G, typ: "ut" }].concat(B.cf.map((v, i) => ({ t: i + 1, v, typ: "in" }))) },
  ];

  M.jamfor_engang = (R, c) => {
    let d;
    for (let k = 0; k < 50; k++) { d = tvaInvesteringar(R, c.intervall); if (Math.abs(d.A.nnv - d.B.nnv) > 5000) break; }
    const { r, A, B } = d;
    const tA = nvTabell(A.cf, r), tB = nvTabell(B.cf, r);
    const best = Math.max(A.nnv, B.nnv) < 0 ? "ingen" : A.nnv > B.nnv ? "A" : "B";
    return {
      fraga: fyll(R.valj(c.mallar), { scenario: R.valj(c.scenarier), GA: kr(A.G), nA: A.n, kfA: kfText(A.cf), GB: kr(B.G), nB: B.n, kfB: kfText(B.cf), ranta: pct(r) }),
      svar: [
        { id: "nnvA", etikett: "NPV för A", enhet: "kr", facit: A.nnv, tol: tolKr(A.G, 500) },
        { id: "nnvB", etikett: "NPV för B", enhet: "kr", facit: B.nnv, tol: tolKr(B.G, 500) },
        { id: "val", etikett: "Vilken bör väljas?", typ: "val", alternativ: ABIngen, facit: best },
      ],
      ledtrad: "Räkna NPV för båda. Engångsinvesteringar jämförs direkt på NPV, oavsett livslängd.",
      steg: [
        { r: "Investering A", h: tA.html + formel(`NPV A = ${kr(tA.tot)} − ${kr(A.G)} = <b>${kr(A.nnv)}</b>`) },
        { r: "Investering B", h: tB.html + formel(`NPV B = ${kr(tB.tot)} − ${kr(B.G)} = <b>${kr(B.nnv)}</b>`) },
      ],
      slutsats: best === "ingen" ? "Båda har negativt NPV – ingen av investeringarna bör genomföras."
        : `Investering ${best} har högst nettonuvärde och bör väljas.`,
      tidslinjer: tidsl2(A, B),
    };
  };

  M.annuitetsmetoden = (R, c) => {
    const I = c.intervall;
    let G, a, n, r, RV, harRV, nnv;
    for (let k = 0; k < 100; k++) {
      G = R.steg(I.G); a = R.steg(I.overskott); n = R.steg(I.ar); r = R.steg(I.ranta) / 100;
      harRV = R.chans(c.restvardeChans); RV = harRV ? Math.min(R.steg(I.restvarde), runda(0.4 * G, 25000)) : 0;
      nnv = a * F.nusf(r, n) + RV * F.nvf(r, n) - G;
      if (Math.abs(nnv) / G > 0.03 && Math.abs(nnv) / G < 0.5) break;
    }
    const nusf = F.nusf(r, n), af = F.af(r, n), nvRV = RV * F.nvf(r, n), ann = nnv * af;
    return {
      fraga: fyll(R.valj(c.mallar), {
        scenario: R.valj(c.scenarier), G: kr(G), overskott: kr(a), ar: n, ranta: pct(r),
        restvardeText: harRV ? `Restvärdet efter ${n} år är <b>${kr(RV)}</b>.` : "Inget restvärde.",
      }),
      svar: [
        { id: "npv", etikett: "NPV", enhet: "kr", facit: nnv, tol: tolKr(G, 500) },
        { id: "ann", etikett: "Annuitet per år", enhet: "kr", facit: ann, tol: tolKr(G * 0.3, 300) },
        { id: "beslut", etikett: "Är investeringen lönsam?", typ: "val", alternativ: JaNej, facit: ann >= 0 ? "ja" : "nej" },
      ],
      ledtrad: "Räkna först NPV. Multiplicera sedan NPV med annuitetsfaktorn r / (1 − (1 + r)<sup>−n</sup>).",
      steg: [
        { r: "NPV", h: formel(`−${kr(G)} + ${kr(a)} × ${fakt(nusf)}${harRV ? " + " + kr(RV) + " × (1 + " + tal(r, 2) + ")<sup>−" + n + "</sup>" : ""} = <b>${kr(nnv)}</b>`) },
        { r: "Annuitetsfaktor", h: formel(`${tal(r, 2)} / (1 − (1 + ${tal(r, 2)})<sup>−${n}</sup>) = ${fakt(af)}`) },
        { r: "Annuitet", h: formel(`${kr(nnv)} × ${fakt(af)} = <b>${kr(ann)}</b> per år`) },
      ],
      slutsats: ann >= 0 ? `Annuiteten är positiv: investeringen ger ${kr(ann)} per år utöver kalkylräntan och är lönsam.` : `Annuiteten är negativ (${kr(ann)} per år): investeringen är inte lönsam.`,
      tidslinjer: [{ n, poster: [{ t: 0, v: -G, typ: "ut" }].concat(range(n).map((t) => ({ t, v: a + (t === n ? RV : 0), typ: "in" }))) }],
    };
  };

  M.aterinvestering = (R, c) => {
    let d;
    for (let k = 0; k < 80; k++) {
      d = tvaInvesteringar(R, c.intervall);
      const okAnn = Math.abs(d.A.ann - d.B.ann) > 2000;
      if (okAnn && (k > 40 || Math.sign(d.A.nnv - d.B.nnv) !== Math.sign(d.A.ann - d.B.ann))) break;
    }
    const { r, A, B } = d;
    const best = Math.max(A.ann, B.ann) < 0 ? "ingen" : A.ann > B.ann ? "A" : "B";
    const nnvBest = A.nnv > B.nnv ? "A" : "B";
    return {
      fraga: fyll(R.valj(c.mallar), { scenario: R.valj(c.scenarier), GA: kr(A.G), nA: A.n, kfA: kfText(A.cf), GB: kr(B.G), nB: B.n, kfB: kfText(B.cf), ranta: pct(r) }),
      svar: [
        { id: "annA", etikett: "Annuitet för A (per år)", enhet: "kr", facit: A.ann, tol: tolKr(A.G * 0.3, 300) },
        { id: "annB", etikett: "Annuitet för B (per år)", enhet: "kr", facit: B.ann, tol: tolKr(B.G * 0.3, 300) },
        { id: "val", etikett: "Vilken bör väljas?", typ: "val", alternativ: ABIngen, facit: best },
      ],
      ledtrad: "Steg 1: räkna NPV för båda. Steg 2: multiplicera varje NPV med annuitetsfaktorn för respektive livslängd.",
      steg: [
        { r: "Steg 1: Nettonuvärde", h: formel(`NPV A = ${kr(A.nnv)}`) + "<br>" + formel(`NPV B = ${kr(B.nnv)}`) },
        { r: "Steg 2: Annuitetsfaktorer", h: formel(`A (${A.n} år): ${fakt(A.af)}`) + "<br>" + formel(`B (${B.n} år): ${fakt(B.af)}`) },
        { r: "Steg 3: Annuiteter", h: formel(`A: ${kr(A.nnv)} × ${fakt(A.af)} = <b>${kr(A.ann)}</b> per år`) + "<br>" + formel(`B: ${kr(B.nnv)} × ${fakt(B.af)} = <b>${kr(B.ann)}</b> per år`) },
      ],
      slutsats: (best === "ingen" ? "Båda har negativ annuitet – ingen bör väljas." : `Investering ${best} ger högst annuitet och bör väljas.`)
        + (best !== "ingen" && nnvBest !== best ? ` Observera: ${nnvBest} har högst NPV. Att bara jämföra NPV hade gett fel svar, eftersom ${A.n < B.n ? "A" : "B"} hinner upprepas fler gånger.` : ""),
      tidslinjer: tidsl2(A, B),
    };
  };

  M.budget_kvk = (R, c) => {
    const I = c.intervall;
    const bokst = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const valj = (proj, budget, nyckel) => {
      const ord = proj.filter((p) => p.nnv >= 0).sort((x, y) => y[nyckel] - x[nyckel]);
      let kvar = budget; const valda = [];
      ord.forEach((p) => { if (p.G <= kvar) { valda.push(p.id); kvar -= p.G; } });
      return valda.sort();
    };
    const optimum = (proj, budget) => {
      let bast = { v: -1, set: [] };
      const pos = proj.filter((p) => p.nnv >= 0);
      for (let m = 0; m < 1 << pos.length; m++) {
        let g = 0, v = 0; const s = [];
        pos.forEach((p, i) => { if (m & (1 << i)) { g += p.G; v += p.nnv; s.push(p.id); } });
        if (g <= budget && v > bast.v) bast = { v, set: s.sort() };
      }
      return bast.set;
    };
    let res = null, reserv = null;
    for (let k = 0; k < 300; k++) {
      const antal = R.steg(I.antal), r = R.steg(I.ranta) / 100;
      const proj = range(antal).map((i) => {
        const G = R.steg(I.G), n = R.steg(I.ar);
        // överskott anpassat efter G så att NPV blir rimligt
        const a = runda(G * F.af(r, n) * (0.85 + 0.5 * R.next()), 5000);
        const nnv = a * F.nusf(r, n) - G;
        return { id: bokst[i - 1], G, n, a, nnv, kvk: nnv / G };
      });
      const totG = sum(proj.filter((p) => p.nnv >= 0).map((p) => p.G));
      const budget = runda(totG * R.steg(I.budgetAndel) / 100, 50000);
      const kv = valj(proj, budget, "kvk"), opt = optimum(proj, budget), nn = valj(proj, budget, "nnv");
      const ok = kv.join() === opt.join() && kv.length >= 2 && kv.length < proj.filter((p) => p.nnv >= 0).length;
      if (!ok) continue;
      const cand = { r, proj, budget, kv, nn };
      if (kv.join() !== nn.join()) { res = cand; break; }
      if (!reserv) reserv = cand;
    }
    res = res || reserv;
    const { r, proj, budget, kv, nn } = res;
    const fragTab = tabell(["Projekt", "Grundinvestering", "Överskott per år", "Livslängd"], proj.map((p) => [p.id, kr(p.G), kr(p.a), p.n + " år"]));
    const ord = proj.slice().sort((x, y) => y.kvk - x.kvk);
    let ack = 0;
    const losTab = tabell(["Rang", "Projekt", "NPV", "KVK", "Ryms i budget?", "Ackumulerad G"], ord.map((p, i) => {
      const val = kv.includes(p.id); if (val) ack += p.G;
      const skal = p.nnv <= 0 ? "Nej – negativt NPV" : val ? "<b>Ja – väljs</b>" : "Nej – för dyrt";
      return [String(i + 1), p.id, kr(p.nnv), tal(p.kvk, 3), skal, val ? kr(ack) : "–"];
    }));
    const totNPV = (set) => sum(proj.filter((p) => set.includes(p.id)).map((p) => p.nnv));
    return {
      fraga: fyll(R.valj(c.mallar), { budget: kr(budget), tabell: fragTab, ranta: pct(r) }),
      svar: [{ id: "val", etikett: "Markera de projekt som ska genomföras", typ: "flerval", alternativ: proj.map((p) => ({ v: p.id, t: "Projekt " + p.id })), facit: kv }],
      ledtrad: "Räkna NPV för varje projekt (överskott × nusummefaktor − G), sedan KVK = NPV / G. Välj i ordning efter KVK så länge budgeten räcker.",
      steg: [
        { r: "NPV för varje projekt", h: proj.map((p) => formel(`${p.id}: ${kr(p.a)} × ${fakt(F.nusf(r, p.n))} − ${kr(p.G)} = ${kr(p.nnv)}`)).join("<br>") },
        { r: "Rangordna efter kapitalvärdeskvot", h: losTab },
        { r: "Total NPV", h: `Valda projekt (${kv.join(", ")}) använder ${kr(sum(proj.filter((p) => kv.includes(p.id)).map((p) => p.G)))} av budgeten och ger NPV ${kr(totNPV(kv))}.` },
      ],
      slutsats: `Genomför projekt ${kv.join(", ")}.` + (kv.join() !== nn.join() ? ` Om man i stället rangordnat efter NPV hade man valt ${nn.join(", ")} med total NPV ${kr(totNPV(nn))} – sämre, eftersom stora projekt binder mycket av den begränsade budgeten.` : ""),
    };
  };

  /* =================== F4 =================== */

  M.payback = (R, c) => {
    const I = c.intervall;
    let d = null;
    for (let k = 0; k < 400; k++) {
      const r = R.steg(I.ranta) / 100, krav = R.steg(I.krav);
      const A = { G: R.steg(I.GA), cf: R.serie(I.kf, 5).sort((x, y) => y - x) };
      const B = { G: R.steg(I.GB), cf: R.serie(I.kf, 6).sort((x, y) => x - y) };
      [A, B].forEach((x) => { x.pb = F.payback(x.G, x.cf); x.nnv = F.nnv(x.G, x.cf, r); });
      if (!A.pb || !B.pb) continue;
      if (Math.abs(A.pb.period - B.pb.period) < 0.3 || Math.abs(A.nnv - B.nnv) < 10000) continue;
      if (A.pb.period > 4.6 || B.pb.period > 5.6) continue;
      const cand = { r, krav, A, B };
      d = cand;
      // Föredra fall där metoderna ger olika svar (pedagogiskt)
      const pbBest = A.pb.period < B.pb.period ? "A" : "B", nnvBest = A.nnv > B.nnv ? "A" : "B";
      if (pbBest !== nnvBest && Math.max(A.nnv, B.nnv) > 0) break;
    }
    const { r, krav, A, B } = d;
    const pbBest = A.pb.period < B.pb.period ? "A" : "B";
    const nnvBest = Math.max(A.nnv, B.nnv) < 0 ? "ingen" : A.nnv > B.nnv ? "A" : "B";
    const uppfyller = ["A", "B"].filter((x) => (x === "A" ? A : B).pb.period <= krav);
    const ackTab = (x) => tabell(["År", "Överskott", "Ackumulerat"], x.cf.slice(0, x.pb.punkt).map((v, i) => [String(i + 1), kr(v), kr(x.pb.ack[i])]));
    const interp = (x) => { const k = x.pb.punkt, fore = k > 1 ? x.pb.ack[k - 2] : 0; return formel(`(${k} − 1) + (${kr(x.G)} − ${kr(fore)}) / ${kr(x.cf[k - 1])} = <b>${tal(x.pb.period, 2)} år</b>`); };
    const disk = (x) => { const d2 = F.payback(x.G, x.cf.map((v, i) => v * F.nvf(r, i + 1))); return d2 ? tal(d2.period, 2) + " år" : "uppnås inte"; };
    return {
      fraga: fyll(R.valj(c.mallar), { GA: kr(A.G), kfA: kfText(A.cf), GB: kr(B.G), kfB: kfText(B.cf), krav, ranta: pct(r) }),
      svar: [
        { id: "pbA", etikett: "Återbetalningspunkt A", enhet: "år", facit: A.pb.period, tol: 0.06, dec: 2 },
        { id: "pbB", etikett: "Återbetalningspunkt B", enhet: "år", facit: B.pb.period, tol: 0.06, dec: 2 },
        { id: "krav", etikett: `Vilka uppfyller kravet på ${krav} år?`, typ: "flerval", alternativ: [{ v: "A", t: "A" }, { v: "B", t: "B" }], facit: uppfyller },
        { id: "nnv", etikett: "Vilken är bäst enligt nettonuvärdesmetoden?", typ: "val", alternativ: ABIngen, facit: nnvBest },
      ],
      ledtrad: "Ackumulera överskotten år för år tills summan når grundinvesteringen. Interpolera inom det året.",
      steg: [
        { r: "Investering A – ackumulera", h: ackTab(A) + `Återbetalningsperiod: mellan år ${A.pb.punkt - 1} och ${A.pb.punkt}.<br>Återbetalningspunkt: ` + interp(A) },
        { r: "Investering B – ackumulera", h: ackTab(B) + `Återbetalningsperiod: mellan år ${B.pb.punkt - 1} och ${B.pb.punkt}.<br>Återbetalningspunkt: ` + interp(B) },
        { r: "Jämför med nettonuvärdet", h: formel(`NPV A = ${kr(A.nnv)}`) + "<br>" + formel(`NPV B = ${kr(B.nnv)}`) },
      ],
      slutsats: `Enligt återbetalningsmetoden är ${pbBest} bäst (kortast tid). ${uppfyller.length ? uppfyller.join(" och ") + " uppfyller kravet på " + krav + " år." : "Ingen uppfyller kravet på " + krav + " år."} `
        + (nnvBest !== "ingen" && nnvBest !== pbBest ? `Men ${nnvBest} har högst NPV: återbetalningsmetoden missar de stora överskotten som kommer sent.` : nnvBest === "ingen" ? "Båda har dock negativt NPV." : `${nnvBest} har också högst NPV, så metoderna är överens här.`),
      tidslinjer: tidsl2({ G: A.G, cf: A.cf, n: 5 }, { G: B.G, cf: B.cf, n: 6 }),
    };
  };

  M.internranta = (R, c) => {
    const I = c.intervall;
    let G, n, cf, r, irr;
    for (let k = 0; k < 300; k++) {
      G = R.steg(I.G); n = R.steg(I.ar); r = R.steg(I.ranta) / 100;
      cf = R.serie(I.kassaflode, n).map((v) => Math.max(v, runda(G / n * (0.6 + 0.8 * R.next()), 10000)));
      irr = F.irr(G, cf);
      if (irr >= I.irrMin[0] / 100 && irr <= I.irrMax[0] / 100 && Math.abs(irr - r) > 0.008) break;
    }
    const r1 = Math.floor(irr * 100) / 100, r2 = r1 + 0.01;
    const n1 = F.nnv(G, cf, r1), n2 = F.nnv(G, cf, r2), est = r1 + n1 / (n1 - n2) * (r2 - r1);
    const max = Math.ceil(irr * 100 / 5) * 5 + 5;
    const punkter = []; for (let p = 0; p <= max; p += (max > 30 ? 5 : 2.5)) punkter.push([p, F.nnv(G, cf, p / 100)]);
    const nnvR = F.nnv(G, cf, r);
    return {
      fraga: fyll(R.valj(c.mallar), { G: kr(G), kassafloden: kfText(cf), ranta: pct(r) }),
      svar: [
        { id: "irr", etikett: "Internränta", enhet: "%", facit: irr * 100, tol: 0.3, dec: 2 },
        { id: "beslut", etikett: "Lönsam vid kalkylräntan?", typ: "val", alternativ: JaNej, facit: irr > r ? "ja" : "nej" },
      ],
      ledtrad: `Prova att räkna NPV vid kalkylräntan ${pct(r)}. Är NPV positivt ligger internräntan högre – prova en högre ränta tills NPV blir negativt.`,
      steg: [
        { r: "NPV vid kalkylräntan", h: formel(`NPV(${pct(r)}) = ${kr(nnvR)}`) + ` → internräntan är ${nnvR > 0 ? "högre" : "lägre"} än ${pct(r)}.` },
        { r: "Hitta två räntor där NPV byter tecken", h: formel(`NPV(${pct(r1)}) = ${kr(n1)}`) + "<br>" + formel(`NPV(${pct(r2)}) = ${kr(n2)}`) },
        { r: "Interpolera linjärt", h: formel(`${tal(r1 * 100, 0)} + ${kr(n1)} / (${kr(n1)} − ${kr(n2)}) × 1 = <b>${tal(est * 100, 2)} %</b>`) + `<br>Exakt (med Excel IR): ${tal(irr * 100, 2)} %.` },
      ],
      slutsats: irr > r ? `Internräntan ${tal(irr * 100, 1)} % är högre än kalkylräntan ${pct(r)}: lönsam.` : `Internräntan ${tal(irr * 100, 1)} % är lägre än kalkylräntan ${pct(r)}: inte lönsam.`,
      tidslinjer: [{ n, poster: [{ t: 0, v: -G, typ: "ut" }].concat(cf.map((v, i) => ({ t: i + 1, v, typ: "in" }))) }],
      extra: [{ typ: "nnvkurva", punkter, irr: irr * 100, kalk: r * 100 }],
    };
  };

  /* =================== F5 =================== */

  const kModell = (x) => {
    const a = x.V * (x.p - x.v) - x.F, nusf = F.nusf(x.r, x.n);
    return { a, nusf, nnv: a * nusf - x.G };
  };

  M.kanslighet = (R, c) => {
    const I = c.intervall;
    let b, m;
    for (let k = 0; k < 300; k++) {
      const p = R.steg(I.pris);
      b = { G: R.steg(I.G), V: R.steg(I.volym), p, v: Math.round(p * R.steg(I.rorligAndel) / 100), F: R.steg(I.fasta), n: R.steg(I.ar), r: R.steg(I.ranta) / 100 };
      m = kModell(b);
      if (m.nnv > 0.05 * b.G && m.nnv < 0.45 * b.G) break;
    }
    const x = R.steg(I.andring) / 100, typ = R.valj(c.fragetyper);
    const tg = b.p - b.v;
    let fraga, sv, extraSteg;
    if (typ === "volym_andring") {
      const mm = kModell(Object.assign({}, b, { V: b.V * (1 - x) }));
      fraga = `Hur stort blir nettonuvärdet om försäljningsvolymen blir ${tal(x * 100)} % lägre än i grundscenariot?`;
      sv = { id: "k", etikett: "b) NPV vid lägre volym", enhet: "kr", facit: mm.nnv, tol: tolKr(b.G, 500) };
      extraSteg = { r: "b) Volym −" + tal(x * 100) + " %", h: formel(`Ny volym ${tal(b.V * (1 - x))} st → överskott ${tal(b.V * (1 - x))} × ${kr(tg)} − ${kr(b.F)} = ${kr(mm.a)}`) + "<br>" + formel(`NPV = ${kr(mm.a)} × ${fakt(mm.nusf)} − ${kr(b.G)} = <b>${kr(mm.nnv)}</b>`) };
    } else if (typ === "pris_andring") {
      const mm = kModell(Object.assign({}, b, { p: b.p * (1 - x) }));
      fraga = `Hur stort blir nettonuvärdet om priset blir ${tal(x * 100)} % lägre (den rörliga kostnaden per styck är oförändrad)?`;
      sv = { id: "k", etikett: "b) NPV vid lägre pris", enhet: "kr", facit: mm.nnv, tol: tolKr(b.G, 500) };
      extraSteg = { r: "b) Pris −" + tal(x * 100) + " %", h: formel(`Nytt pris ${kr(b.p * (1 - x), 2)} → täckningsbidrag ${kr(b.p * (1 - x) - b.v, 2)} per st`) + "<br>" + formel(`Överskott ${tal(b.V)} × ${kr(b.p * (1 - x) - b.v, 2)} − ${kr(b.F)} = ${kr(mm.a)}`) + "<br>" + formel(`NPV = ${kr(mm.a)} × ${fakt(mm.nusf)} − ${kr(b.G)} = <b>${kr(mm.nnv)}</b>`) };
    } else if (typ === "ranta_andring") {
      const d = 0.03, mm = kModell(Object.assign({}, b, { r: b.r + d }));
      fraga = `Hur stort blir nettonuvärdet om kalkylräntan i stället är ${pct(b.r + d)}?`;
      sv = { id: "k", etikett: "b) NPV vid högre ränta", enhet: "kr", facit: mm.nnv, tol: tolKr(b.G, 500) };
      extraSteg = { r: "b) Kalkylränta " + pct(b.r + d), h: formel(`Ny nusummefaktor ${fakt(mm.nusf)} → NPV = ${kr(m.a)} × ${fakt(mm.nusf)} − ${kr(b.G)} = <b>${kr(mm.nnv)}</b>`) };
    } else if (typ === "brytpunkt_volym") {
      const Vs = (b.G / m.nusf + b.F) / tg;
      fraga = "Hur låg kan den årliga försäljningsvolymen bli innan nettonuvärdet blir negativt? (Brytpunkt, avrunda till hela styck.)";
      sv = { id: "k", etikett: "b) Brytpunkt volym", enhet: "st", facit: Vs, tol: Math.max(2, Vs * REL) };
      extraSteg = { r: "b) Brytpunkt för volymen", h: `Sätt NPV = 0: överskottet måste vara G / nusummefaktor = ${kr(b.G)} / ${fakt(m.nusf)} = ${kr(b.G / m.nusf)} per år.<br>` + formel(`Volym = (${kr(b.G / m.nusf)} + ${kr(b.F)}) / ${kr(tg)} = <b>${tal(Vs)} st</b>`) + `<br>Det är ${tal((1 - Vs / b.V) * 100, 1)} % under grundscenariot.` };
    } else if (typ === "max_G") {
      const Gm = m.a * m.nusf;
      fraga = "Hur stor får grundinvesteringen bli innan investeringen blir olönsam?";
      sv = { id: "k", etikett: "b) Högsta grundinvestering", enhet: "kr", facit: Gm, tol: tolKr(Gm) };
      extraSteg = { r: "b) Brytpunkt för grundinvesteringen", h: formel(`G<sub>max</sub> = ${kr(m.a)} × ${fakt(m.nusf)} = <b>${kr(Gm)}</b>`) + `<br>Grundinvesteringen kan öka med ${tal((Gm / b.G - 1) * 100, 1)} %.` };
    } else {
      const ps = (b.G / m.nusf + b.F) / b.V + b.v;
      fraga = "Vilket är det lägsta pris per styck som ger NPV = 0? (Brytpunkt, två decimaler.)";
      sv = { id: "k", etikett: "b) Brytpunkt pris", enhet: "kr", facit: ps, tol: Math.max(0.05, ps * 0.002), dec: 2 };
      extraSteg = { r: "b) Brytpunkt för priset", h: `Överskottet måste vara ${kr(b.G / m.nusf)} per år.<br>` + formel(`Pris = (${kr(b.G / m.nusf)} + ${kr(b.F)}) / ${tal(b.V)} + ${kr(b.v)} = <b>${kr(ps, 2)}</b>`) + `<br>Priset kan sjunka ${tal((1 - ps / b.p) * 100, 1)} %.` };
    }
    // Känslighetstabell ±10 %
    const vars = [
      { k: "V", n: "Försäljningsvolym" }, { k: "p", n: "Pris" }, { k: "v", n: "Rörlig kostnad per st" },
      { k: "F", n: "Fasta utbetalningar" }, { k: "G", n: "Grundinvestering" },
    ];
    const tornado = vars.map((vv) => ({
      namn: vv.n,
      lag: kModell(Object.assign({}, b, { [vv.k]: b[vv.k] * 0.9 })).nnv,
      hog: kModell(Object.assign({}, b, { [vv.k]: b[vv.k] * 1.1 })).nnv,
    }));
    tornado.push({ namn: "Kalkylränta", lag: kModell(Object.assign({}, b, { r: b.r * 0.9 })).nnv, hog: kModell(Object.assign({}, b, { r: b.r * 1.1 })).nnv });
    tornado.sort((p, q) => Math.abs(q.hog - q.lag) - Math.abs(p.hog - p.lag));
    const kTab = tabell(["Variabel", "−10 %", "Grund", "+10 %", "Spann"], tornado.map((t) => [t.namn, kr(t.lag), kr(m.nnv), kr(t.hog), kr(Math.abs(t.hog - t.lag))]));
    const produkt = R.valj(c.produkter);
    const listaHtml = lista([
      `Grundinvestering: ${kr(b.G)}`, `Försäljningsvolym: ${tal(b.V)} st per år`, `Pris: ${kr(b.p)} per st`,
      `Rörlig kostnad: ${kr(b.v)} per st`, `Fasta utbetalningar: ${kr(b.F)} per år`,
      `Ekonomisk livslängd: ${b.n} år, inget restvärde`, `Kalkylränta: ${pct(b.r)}`,
    ]);
    return {
      fraga: fyll(R.valj(c.mallar), { produkt, lista: listaHtml, fraga }),
      svar: [{ id: "bas", etikett: "a) NPV i grundscenariot", enhet: "kr", facit: m.nnv, tol: tolKr(b.G, 500) }, sv],
      ledtrad: "Täckningsbidrag per styck = pris − rörlig kostnad. Årligt överskott = volym × täckningsbidrag − fasta utbetalningar. Ändra bara en sak i taget.",
      steg: [
        { r: "a) Grundscenario", h: formel(`Överskott = ${tal(b.V)} × (${kr(b.p)} − ${kr(b.v)}) − ${kr(b.F)} = ${kr(m.a)}`) + "<br>" + formel(`NPV = ${kr(m.a)} × ${fakt(m.nusf)} − ${kr(b.G)} = <b>${kr(m.nnv)}</b>`) },
        extraSteg
      ],
      slutsats: `Störst påverkan har ${tornado[0].namn.toLowerCase()} och ${tornado[1].namn.toLowerCase()}.`,
      extra: [{ typ: "tornado", rader: tornado, bas: m.nnv }, { typ: "sandlada", bas: b }],
    };
  };

  M.scenario = (R, c) => {
    const I = c.intervall;
    let G, n, r, bas, pess, opt, P, nn, E;
    for (let k = 0; k < 200; k++) {
      G = R.steg(I.G); n = R.steg(I.ar); r = R.steg(I.ranta) / 100;
      bas = R.steg(I.bas); pess = runda(bas * (1 - R.steg(I.ned) / 100), 10000); opt = runda(bas * (1 + R.steg(I.upp) / 100), 10000);
      P = R.valj(c.sannolikheter);
      const nusf = F.nusf(r, n);
      nn = [pess, bas, opt].map((a) => a * nusf - G);
      E = P[0] * nn[0] + P[1] * nn[1] + P[2] * nn[2];
      if (nn[0] < 0 && nn[2] > 0 && Math.abs(E) > 0.03 * G) break;
    }
    const nusf = F.nusf(r, n), namn = ["Pessimistiskt", "Troligt", "Optimistiskt"], aa = [pess, bas, opt];
    const fragTab = tabell(["Scenario", "Överskott per år", "Sannolikhet"], namn.map((s, i) => [s, kr(aa[i]), tal(P[i] * 100) + " %"]));
    const losTab = tabell(["Scenario", "NPV", "Sannolikhet", "Sannolikhet × NPV"], namn.map((s, i) => [s, kr(nn[i]), tal(P[i], 2), kr(P[i] * nn[i])]), ["Förväntat NPV", "", "", `<b>${kr(E)}</b>`]);
    return {
      fraga: fyll(R.valj(c.mallar), { G: kr(G), ar: n, ranta: pct(r), tabell: fragTab }),
      svar: [
        { id: "pess", etikett: "NPV pessimistiskt", enhet: "kr", facit: nn[0], tol: tolKr(G, 500) },
        { id: "E", etikett: "Förväntat NPV", enhet: "kr", facit: E, tol: tolKr(G, 500) },
        { id: "beslut", etikett: "Bör investeringen genomföras?", typ: "val", alternativ: [{ v: "ja", t: "Ja" }, { v: "nej", t: "Nej" }], facit: E >= 0 ? "ja" : "nej" },
      ],
      ledtrad: "Räkna NPV för varje scenario med nusummefaktorn. Väg sedan ihop med sannolikheterna.",
      steg: [
        { r: "Nusummefaktor", h: formel(`${pct(r)}, ${n} år: ${fakt(nusf)}`) },
        { r: "NPV per scenario", h: namn.map((s, i) => formel(`${s}: ${kr(aa[i])} × ${fakt(nusf)} − ${kr(G)} = ${kr(nn[i])}`)).join("<br>") },
        { r: "Väg ihop", h: losTab },
      ],
      slutsats: (E > 0 ? `Förväntat NPV är positivt (${kr(E)}), så investeringen är lönsam i genomsnitt.` : `Förväntat NPV är negativt (${kr(E)}), så investeringen bör inte genomföras.`)
        + ` I det pessimistiska scenariot blir NPV ${kr(nn[0])}.`,
    };
  };

  /* =================== F6 =================== */

  M.wacc = (R, c, bank) => {
    const I = c.intervall;
    const T = R.valj(c.skattesatser) / 100, rD = R.steg(I.rD) / 100;
    const kvot = R.chans(c.kvotChans), gordon = R.chans(c.gordonChans), projekt = R.chans(c.projektChans);
    let D, E, wD, wE, kapitalText, kapSteg;
    if (kvot) {
      const k = R.valj(c.skuldkvoter);
      const ord = { 0.25: "en fjärdedel av", 0.5: "hälften av", 1: "lika stor som", 1.5: "en och en halv gång så stor som" }[k];
      wD = k / (1 + k); wE = 1 / (1 + k);
      kapitalText = `Företaget har som mål att den räntebärande skulden ska vara <b>${ord}</b> det egna kapitalets marknadsvärde.`;
      kapSteg = `Om eget kapital = 100 är skulden ${tal(100 * k)}. Totalt kapital = ${tal(100 + 100 * k)}.<br>` + formel(`D/V = ${tal(100 * k)} / ${tal(100 + 100 * k)} = ${fakt(wD)}`) + "<br>" + formel(`E/V = 100 / ${tal(100 + 100 * k)} = ${fakt(wE)}`);
    } else {
      D = R.steg(I.D); E = R.steg(I.E); wD = D / (D + E); wE = E / (D + E);
      kapitalText = `Marknadsvärdet av det egna kapitalet är <b>${tal(E)} Mkr</b> och de räntebärande skulderna är <b>${tal(D)} Mkr</b>.`;
      kapSteg = formel(`V = ${tal(D)} + ${tal(E)} = ${tal(D + E)} Mkr`) + "<br>" + formel(`D/V = ${tal(D)} / ${tal(D + E)} = ${fakt(wD)}`) + "<br>" + formel(`E/V = ${tal(E)} / ${tal(D + E)} = ${fakt(wE)}`);
    }
    let rE, rEText, P0, D1, g;
    if (gordon) {
      P0 = R.steg(I.P0); D1 = Math.round(P0 * R.steg(I.utdelningAndel) / 100 * 2) / 2; g = R.steg(I.g) / 100;
      rE = F.gordon(P0, D1, g);
      rEText = `Företagets aktie handlas idag för <b>${kr(P0)}</b>. Nästa års utdelning väntas bli <b>${kr(D1, D1 % 1 ? 2 : 0)}</b> per aktie och utdelningen förväntas sedan växa med <b>${pct(g)}</b> per år.`;
    } else {
      rE = R.steg(I.rE) / 100;
      rEText = `Ägarnas avkastningskrav är <b>${pct(rE)}</b>.`;
    }
    const w = wD * rD * (1 - T) + wE * rE;
    const wR = Math.round(w * 1000) / 1000; // avrundad till en decimal i procent
    let pG, pa, pn, pnnv, projektText = "";
    if (projekt) {
      pG = R.steg(I.G); pn = R.steg(I.ar); pa = runda(pG * F.af(wR, pn) * (0.85 + 0.35 * R.next()), 10000);
      pnnv = pa * F.nusf(wR, pn) - pG;
      projektText = ` Använd sedan WACC (avrundad till en decimal) som kalkylränta och beräkna nettonuvärdet för en investering med grundinvesteringen <b>${kr(pG)}</b> som ger <b>${kr(pa)} per år</b> i <b>${pn} år</b>.`;
    }
    const svar = [];
    if (gordon) svar.push({ id: "rE", etikett: "Ägarnas avkastningskrav r<sub>E</sub>", enhet: "%", facit: rE * 100, tol: 0.06, dec: 2 });
    svar.push({ id: "wacc", etikett: "WACC", enhet: "%", facit: w * 100, tol: 0.06, dec: 2 });
    if (projekt) svar.push({ id: "nnv", etikett: "NPV med WACC som kalkylränta", enhet: "kr", facit: pnnv, tol: tolKr(pG, 500) });
    const steg = [{ r: "Vikter", h: kapSteg }];
    if (gordon) steg.push({ r: "Avkastningskrav på eget kapital (Gordon)", h: formel(`r<sub>E</sub> = ${kr(D1, 2)} / ${kr(P0)} + ${tal(g, 3)} = ${tal(D1 / P0, 4)} + ${tal(g, 3)} = <b>${pct(rE, 2)}</b>`) });
    steg.push(
      { r: "Skuldkostnad efter skatt", h: formel(`${pct(rD)} × (1 − ${tal(T, 3)}) = ${pct(rD * (1 - T), 3)}`) },
      { r: "WACC", h: formel(`${fakt(wD)} × ${pct(rD * (1 - T), 3)} + ${fakt(wE)} × ${pct(rE, 2)} = <b>${pct(w, 2)}</b>`) },
    );
    if (projekt) steg.push({ r: "NPV med WACC " + pct(wR, 1), h: formel(`${kr(pa)} × ${fakt(F.nusf(wR, pn))} − ${kr(pG)} = <b>${kr(pnnv)}</b>`) });
    return {
      fraga: fyll(R.valj(c.mallar), {
        foretag: R.valj(bank.foretag), kapitalText, rDText: `Räntan på skulderna är <b>${pct(rD)}</b>.`,
        skatt: pct(T, 1), rEText, projektText,
      }),
      svar,
      ledtrad: "Räkna vikterna D/V och E/V först. Glöm inte (1 − T) på skuldräntan." + (gordon ? " Ägarnas krav: r<sub>E</sub> = D<sub>1</sub>/P<sub>0</sub> + g." : ""),
      steg,
      slutsats: `Företagets kalkylränta blir cirka ${pct(wR, 1)}.` + (projekt ? (pnnv >= 0 ? " Investeringen är lönsam vid den räntan." : " Investeringen är inte lönsam vid den räntan.") : ""),
    };
  };

  /* =================== F7 =================== */

  M.leasing = (R, c, bank) => {
    const I = c.intervall;
    let K, RV, n, r, U, F0, L, kop, lea;
    for (let k = 0; k < 200; k++) {
      K = R.steg(I.kop); RV = runda(K * R.steg(I.restvardeAndel) / 100, 5000); n = R.steg(I.ar); r = R.steg(I.ranta) / 100;
      U = R.chans(c.underhallChans) ? R.steg(I.underhall) : 0;
      F0 = R.chans(c.forstaAvgiftChans) ? runda(K * R.steg(I.forstaAndel) / 100, 5000) : 0;
      const nusf = F.nusf(r, n);
      kop = K + U * nusf - RV * F.nvf(r, n);
      L = runda((kop - F0) / nusf * (1 + R.steg(I.leasingSpridning) / 100), 1000);
      lea = F0 + L * nusf;
      if (L > 0 && Math.abs(kop - lea) / kop > 0.004) break;
    }
    const nusf = F.nusf(r, n);
    let kopText = `Inköpspris idag <b>${kr(K)}</b>. Restvärde efter ${n} år <b>${kr(RV)}</b>.`;
    if (U) kopText += ` Vid köp står företaget själv för underhållet, <b>${kr(U)} per år</b>.`;
    let leasText = `Leasingavgift <b>${kr(L)} per år</b>, betalas i slutet av varje år i ${n} år.`;
    if (F0) leasText += ` Dessutom betalas en förhöjd första avgift på <b>${kr(F0)}</b> när kontraktet skrivs.`;
    if (U) leasText += " Leasegivaren står för underhållet.";
    const kopH = formel(`NPV<sub>köp</sub> = −${kr(K)}${U ? " − " + kr(U) + " × " + fakt(nusf) : ""} + ${kr(RV)} × (1 + ${tal(r, 2)})<sup>−${n}</sup>`) + "<br>" + formel(`= −${kr(K)}${U ? " − " + kr(U * nusf) : ""} + ${kr(RV * F.nvf(r, n))} = <b>${kr(-kop)}</b>`);
    const leaH = formel(`NPV<sub>leasing</sub> = ${F0 ? "−" + kr(F0) + " " : ""}−${kr(L)} × ${fakt(nusf)} = <b>${kr(-lea)}</b>`);
    const best = kop < lea ? "kop" : "leasing";
    return {
      fraga: fyll(R.valj(c.mallar), { foretag: R.valj(bank.foretag), maskin: R.valj(c.maskiner), ar: n, kop: kopText, leasing: leasText, ranta: pct(r) }),
      svar: [
        { id: "kop", etikett: "NPV köp", enhet: "kr", facit: -kop, tol: tolKr(kop), fritecken: true },
        { id: "lea", etikett: "NPV leasing", enhet: "kr", facit: -lea, tol: tolKr(lea), fritecken: true },
        { id: "val", etikett: "Köpa eller leasa?", typ: "val", alternativ: [{ v: "kop", t: "Köpa" }, { v: "leasing", t: "Leasa" }], facit: best },
      ],
      ledtrad: "Inbetalningarna från maskinen är lika i båda fallen och kan strykas. Räkna NPV av utbetalningarna (negativa belopp) och välj det minst negativa. Restvärdet är en inbetalning vid köp.",
      steg: [
        { r: "Nusummefaktor", h: formel(`${pct(r)}, ${n} år: ${fakt(nusf)}`) },
        { r: "Köp", h: kopH },
        { r: "Leasing", h: leaH },
      ],
      slutsats: `${best === "kop" ? "Köp" : "Leasing"} har högst (minst negativt) NPV, skillnad ${kr(Math.abs(kop - lea))}. Svaret godkänns med eller utan minustecken.`,
      tidslinjer: [
        { namn: "Köp", n, poster: [{ t: 0, v: -K, typ: "ut" }].concat(range(n).map((t) => ({ t, v: -U + (t === n ? RV : 0), typ: -U + (t === n ? RV : 0) >= 0 ? "in" : "ut" }))).filter((p) => p.v !== 0) },
        { namn: "Leasing", n, poster: (F0 ? [{ t: 0, v: -F0, typ: "ut" }] : []).concat(range(n).map((t) => ({ t, v: -L, typ: "ut" }))) },
      ],
    };
  };

  /* ============================================================ */

  function skapaFraga(id, seed, bank) {
    const c = bank.moduler[id];
    REL = (bank.tolerans && bank.tolerans.relativ) || 0.005;
    const R = Fi.skapaRng(seed, id);
    const q = M[id](R, c, bank);
    q.id = id; q.seed = seed; q.rubrik = c.rubrik;
    return q;
  }

  const API = { generatorer: M, skapaFraga, tabell };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.Moduler = API;
})(typeof window !== "undefined" ? window : globalThis);
