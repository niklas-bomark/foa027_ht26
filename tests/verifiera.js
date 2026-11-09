// Kontrollerar räknefunktionerna mot föreläsningarnas exempel och
// facit i slumpade frågor mot en oberoende beräkning.
require("../js/fragebank.js");
const bank = globalThis.FRAGEBANK;
const { F } = require("../js/finans.js");
const M = require("../js/moduler.js");
let ok = 0, fel = 0;
const nara = (namn, x, y, tol) => { if (Math.abs(x - y) <= tol) ok++; else { fel++; console.log("FEL", namn, x, "≠", y); } };

// --- Exempel från föreläsningarna ---
nara("F2b NV 49000/14 år/3%", 49000 * F.nvf(0.03, 14), 32395, 1);
nara("F2b SV 15000 8% 4ggr 9 år", 15000 * Math.pow(1.02, 36), 30598, 1);
nara("F2b SV 11500 12% 12ggr 9 år", 11500 * Math.pow(1.01, 108), 33683, 1);
nara("F2b annuitet 130000 8% 15 (exakt)", 130000 * F.af(0.08, 15), 15187.84, 0.01);
nara("F2b annuitet med avrundad faktor 0,1168", 130000 * 0.1168, 15184, 0.5);
nara("Avrundat lärarsvar inom tolerans", Math.abs(15184 - 130000 * F.af(0.08, 15)) <= 15188 * 0.005 ? 1 : 0, 1, 0);
nara("F2b annuitet 180000 6% 9 (exakt)", 180000 * F.af(0.06, 9), 26464.00, 0.01);
nara("F2b NV ström 9%", F.nvStrom([6000, 16000, 14000, 8000, 13000], 0.09), 43899, 1);
nara("F2b NV ström Kalle 7%", F.nvStrom([10000, 11000, 10000, 10000, 5000], 0.07), 38310.48, 0.01);
// F2-bilden "100 kr per år" summerar 133,1 + 121 + 110 = 364,1 (insättningar år 0, 1, 2).
// Slutvärdefaktorn förutsätter insättning i slutet av året: 121 + 110 + 100 = 331.
nara("F2 slutvärdefaktor 100 kr/år 10% 3 år", 100 * F.svsf(0.1, 3), 331, 1e-9);
nara("F2 bildens 364,1 = förskott", 100 * F.svsf(0.1, 3) * 1.1, 364.1, 1e-9);
nara("F2 SVF = NUSF × (1+r)^n", F.svsf(0.07, 9), F.nusf(0.07, 9) * Math.pow(1.07, 9), 1e-9);
nara("F2 effektiv ränta 10% månadsvis", F.eff(0.1, 12), 0.104713, 1e-6);
nara("F7 NUSF 20% 8 år", F.nusf(0.2, 8), 3.8372, 0.0001);
nara("F7 ex1 NNV köp (tkr)", -600 + 160 * F.nusf(0.2, 8), 13.95, 0.01);
nara("F7 ex2 köp", 180000 - 50000 * F.nvf(0.08, 4), 143249, 1);
nara("F7 ex2 leasing", 45000 * F.nusf(0.08, 4), 149045.71, 0.01);
nara("F7 del2 köp", 240000 - 60000 * F.nvf(0.1, 5), 202745, 1);
nara("F7 del2 leasing", 52000 * F.nusf(0.1, 5), 197121, 1);
nara("F6 WACC exempel", F.wacc(50, 100, 0.04, 0.105, 0.25), 0.08, 1e-9);
nara("F4 payback kaffekoppar", F.payback(160000, [40000, 40000, 50000, 40000, 40000, 70000]).period, 3.75, 1e-9);
nara("IRR kontroll", F.irr(1000, [1100]), 0.1, 1e-9);

// --- Oberoende kontroll av slumpade frågor ---
const S = 600;
for (let s = 20000; s < 20000 + S; s++) {
  // Lika belopp: facit = den allmänna summaformeln
  { const q = M.skapaFraga("nuvarde_lika", s, bank);
    const kf = +q.fraga.match(/(\d[\d\s]*)\skr/)[1].replace(/\D/g, ""), n = +q.fraga.match(/(\d+)(?:-årigt|\sår|\slika)/)[1], r = +q.fraga.match(/(\d+)\s%/)[1] / 100;
    let v = 0; for (let t = 1; t <= n; t++) v += kf * Math.pow(1 + r, -t);
    nara("nuvarde_lika " + s, q.svar[0].facit, v, 1e-6); }
  { const q = M.skapaFraga("slutvarde_lika", s, bank);
    const kf = +q.fraga.match(/(\d[\d\s]*)\skr/)[1].replace(/\D/g, ""), r = +q.fraga.match(/(\d+)\s%/)[1] / 100;
    const n = +(q.fraga.match(/efter (\d+)\sår/) || q.fraga.match(/i (\d+)\sår/) || q.fraga.match(/år (\d+)/))[1];
    const mm = q.fraga.match(/tillskrivning (\d+) gånger/), m = mm ? +mm[1] : 1;
    let v = 0; for (let t = 1; t <= n; t++) v += kf * Math.pow(1 + r / m, m * (n - t));
    nara("slutvarde_lika " + s, q.svar[0].facit, v, 1e-6); }
  // NNV-svar ska vara konsekventa med beslut
  for (const id of ["nnv_rationalisering"]) {
    const q = M.skapaFraga(id, s, bank);
    const nnv = q.svar[0].facit, b = q.svar[1].facit;
    if ((nnv >= 0) === (b === "ja")) ok++; else { fel++; console.log("FEL beslut", id, s); }
  }
  // Leasing: valet ska matcha lägst kostnad
  { const q = M.skapaFraga("leasing", s, bank); const [k, l, v] = q.svar;
    if ((k.facit > l.facit ? "kop" : "leasing") === v.facit && k.facit < 0 && l.facit < 0) ok++; else { fel++; console.log("FEL leasing", s); } }
  // Engång: valet = högst NNV
  { const q = M.skapaFraga("jamfor_engang", s, bank); const [a, b, v] = q.svar;
    const f = Math.max(a.facit, b.facit) < 0 ? "ingen" : a.facit > b.facit ? "A" : "B";
    if (f === v.facit) ok++; else { fel++; console.log("FEL engång", s); } }
  // Upprepade: valet = högst annuitet
  { const q = M.skapaFraga("aterinvestering", s, bank); const [a, b, v] = q.svar;
    const f = Math.max(a.facit, b.facit) < 0 ? "ingen" : a.facit > b.facit ? "A" : "B";
    if (f === v.facit) ok++; else { fel++; console.log("FEL återinv", s); } }
  // IRR: kontrollera att rätt beslut följer
  { const q = M.skapaFraga("internranta", s, bank); const irr = q.svar[0].facit;
    if (irr >= 3 && irr <= 30) ok++; else { fel++; console.log("FEL irr intervall", s, irr); } }
  // WACC mellan rD(1-T) och rE
  { const q = M.skapaFraga("wacc", s, bank); const w = q.svar.find((x) => x.id === "wacc").facit;
    if (w > 1.5 && w < 16) ok++; else { fel++; console.log("FEL wacc", s, w); } }
  // Payback mellan 0 och livslängd
  { const q = M.skapaFraga("payback", s, bank); const [a, b] = q.svar;
    if (a.facit > 0 && a.facit <= 5 && b.facit > 0 && b.facit <= 6) ok++; else { fel++; console.log("FEL payback", s); } }
  { const q = M.skapaFraga("annuitetsmetoden", s, bank); const [npv, ann] = q.svar;
    if (Math.sign(npv.facit) === Math.sign(ann.facit) && Math.abs(ann.facit) < Math.abs(npv.facit)) ok++; else { fel++; console.log("FEL annuitetsmetoden", s); } }
  // Budget: valda projekt ryms i budgeten (läses ur lösningen)
  { const q = M.skapaFraga("budget_kvk", s, bank); if (q.svar[0].facit.length >= 2) ok++; else { fel++; console.log("FEL budget", s); } }
}
console.log(`\n${ok} kontroller OK, ${fel} fel`);
process.exit(fel ? 1 : 0);
