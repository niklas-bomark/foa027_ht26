/* ============================================================
   finans.js – räknefunktioner, slumptal och formatering
   Ändra normalt INTE i denna fil. Frågornas texter och
   sifferintervall finns i js/fragebank.js
   ============================================================ */
(function (root) {
  "use strict";

  // ---------- Räntematematik ----------
  const F = {
    // Nuvärdesfaktor (1 + r)^-t
    nvf: (r, t) => Math.pow(1 + r, -t),
    // Slutvärdesfaktor (1 + r)^t
    svf: (r, t) => Math.pow(1 + r, t),
    // Nusummefaktor (1 - (1+r)^-n) / r
    nusf: (r, n) => (r === 0 ? n : (1 - Math.pow(1 + r, -n)) / r),
    // Slutvärdefaktor för lika stora belopp ((1+r)^n - 1) / r
    svsf: (r, n) => (r === 0 ? n : (Math.pow(1 + r, n) - 1) / r),
    // Effektiv årsränta vid m tillskrivningar per år
    eff: (r, m) => Math.pow(1 + r / m, m) - 1,
    // Annuitetsfaktor r / (1 - (1+r)^-n)
    af: (r, n) => (r === 0 ? 1 / n : r / (1 - Math.pow(1 + r, -n))),
    // Nuvärde av ström; cf[0] betalas i slutet av år 1
    nvStrom: (cf, r) => cf.reduce((s, c, i) => s + c * Math.pow(1 + r, -(i + 1)), 0),
    // Slutvärde (vid år n) av ström; cf[0] betalas i slutet av år 1
    svStrom: (cf, r) => {
      const n = cf.length;
      return cf.reduce((s, c, i) => s + c * Math.pow(1 + r, n - (i + 1)), 0);
    },
    // Nettonuvärde: -G + NV(kassaflöden) + NV(restvärde)
    nnv: (G, cf, r, rv) => -G + F.nvStrom(cf, r) + (rv || 0) * Math.pow(1 + r, -cf.length),
    // Internränta via bisektion. Returnerar NaN om ingen teckenväxling hittas.
    irr: (G, cf, rv) => {
      let lo = -0.9, hi = 5;
      let flo = F.nnv(G, cf, lo, rv), fhi = F.nnv(G, cf, hi, rv);
      if (flo * fhi > 0) return NaN;
      for (let i = 0; i < 200; i++) {
        const mid = (lo + hi) / 2, fm = F.nnv(G, cf, mid, rv);
        if (Math.abs(fm) < 1e-9) return mid;
        if (flo * fm < 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; }
      }
      return (lo + hi) / 2;
    },
    // Återbetalningstid (odiskonterad). Returnerar {punkt, period, ack} eller null.
    payback: (G, cf) => {
      let ack = 0;
      const ackLista = [];
      let res = null;
      for (let i = 0; i < cf.length; i++) {
        const fore = ack;
        ack += cf[i];
        ackLista.push(ack);
        if (res === null && ack >= G) {
          res = { punkt: i + 1, period: i + (G - fore) / cf[i] };
        }
      }
      return res ? Object.assign(res, { ack: ackLista }) : null;
    },
    // WACC
    wacc: (D, E, rD, rE, T) => (D / (D + E)) * rD * (1 - T) + (E / (D + E)) * rE,
    // Gordonmodellen: rE = D1 / P0 + g
    gordon: (P0, D1, g) => D1 / P0 + g,
  };

  // ---------- Seedad slumptalsgenerator (mulberry32) ----------
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function skapaRng(seed, namn) {
    let a = (hashStr(String(namn || "")) ^ (Number(seed) * 2654435761)) >>> 0;
    const next = () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const R = {
      next,
      int: (min, max) => min + Math.floor(next() * (max - min + 1)),
      // intervall [min, max, steg]
      steg: (iv) => {
        const [min, max, steg] = iv;
        const s = steg || 1;
        const antal = Math.floor((max - min) / s + 1e-9);
        return Math.round((min + s * R.int(0, antal)) * 1e6) / 1e6;
      },
      valj: (arr) => arr[Math.floor(next() * arr.length)],
      chans: (p) => next() < p,
      blanda: (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
        return a;
      },
      urval: (arr, k) => R.blanda(arr).slice(0, k),
      serie: (iv, n) => Array.from({ length: n }, () => R.steg(iv)),
    };
    return R;
  }

  // ---------- Formatering (svensk) ----------
  const NBSP = " ";
  function tal(x, d) {
    d = d === undefined ? 0 : d;
    if (!isFinite(x)) return "–";
    const s = new Intl.NumberFormat("sv-SE", { minimumFractionDigits: d, maximumFractionDigits: d }).format(x);
    return s.replace(/−/g, "−").replace(/\s/g, NBSP);
  }
  const kr = (x, d) => tal(x, d || 0) + NBSP + "kr";
  // Ränta given som decimal (0.08) -> "8 %"; d decimaler tas bort om onödiga
  const pct = (r, d) => {
    d = d === undefined ? 2 : d;
    const v = Math.round(r * 100 * Math.pow(10, d)) / Math.pow(10, d);
    const dd = Number.isInteger(v) ? 0 : (Number.isInteger(v * 10) ? 1 : d);
    return tal(v, dd) + NBSP + "%";
  };
  const fakt = (x, d) => tal(x, d === undefined ? 4 : d);
  const fyll = (mall, v) => mall.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m));

  // Tolka elevens svar: "12 345,6 kr", "8,5 %", "−1200"
  function tolka(s) {
    if (s === null || s === undefined) return NaN;
    let t = String(s).trim().toLowerCase()
      .replace(/kr|sek|%|år/g, "")
      .replace(/[\s  ]/g, "")
      .replace(/[−–]/g, "-");
    if (/,/.test(t) && /\./.test(t)) t = t.replace(/\./g, "").replace(",", ".");
    else t = t.replace(",", ".");
    if (t === "" || t === "-") return NaN;
    return Number(t);
  }

  const API = { F, skapaRng, tal, kr, pct, fakt, fyll, tolka, NBSP };
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.Finans = API;
})(typeof window !== "undefined" ? window : globalThis);
