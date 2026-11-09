require("../js/fragebank.js");
const bank = globalThis.FRAGEBANK;
const M = require("../js/moduler.js");
let fel = 0;
for (const id of Object.keys(bank.moduler)) {
  const t0 = Date.now(); let n = 0;
  for (let s = 10000; s < 10400; s++) {
    try {
      const q = M.skapaFraga(id, s, bank);
      for (const a of q.svar) {
        if ((a.typ||"tal")==="tal" && !isFinite(a.facit)) throw new Error("facit NaN "+a.id);
      }
      if (/\{\w+\}/.test(q.fraga)) throw new Error("ofylld platshållare: "+q.fraga.match(/\{\w+\}/)[0]);
      if (/NaN|undefined/.test(q.fraga + JSON.stringify(q.steg))) throw new Error("NaN/undefined i text");
      n++;
    } catch (e) { fel++; if (fel < 15) console.log(id, s, e.message); }
  }
  console.log(id.padEnd(22), n, "ok", (Date.now()-t0)+"ms");
}
console.log("FEL:", fel);
