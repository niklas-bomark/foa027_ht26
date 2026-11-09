/* ============================================================
   diagram.js – tidslinjer, NPV-kurva, tornadodiagram, sandlåda
   ============================================================ */
(function (root) {
  "use strict";
  const { tal, kr, F } = root.Finans;
  const ns = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const kort = (v) => {
    const a = Math.abs(v);
    if (a >= 1e6) return tal(v / 1e6, 2) + " Mkr";
    if (a >= 1e4) return tal(v / 1000, 0) + " tkr";
    return tal(v, 0);
  };

  // ---------- Tidslinje ----------
  function tidslinjer(lista) {
    if (!lista || !lista.length) return "";
    const maxAbs = Math.max(...lista.flatMap((l) => l.poster.map((p) => Math.abs(p.v))), 1);
    const pos = lista.some((l) => l.poster.some((p) => p.v > 0)), neg = lista.some((l) => l.poster.some((p) => p.v < 0));
    const html = lista.map((l) => tidslinje(Object.assign({ harPos: pos, harNeg: neg }, l), maxAbs)).join("");
    const typer = new Set(lista.flatMap((l) => l.poster.map((p) => p.typ)));
    const leg = [];
    if (typer.has("in")) leg.push('<span><i style="background:var(--in)"></i>Inbetalning</span>');
    if (typer.has("ut")) leg.push('<span><i style="background:var(--ut)"></i>Utbetalning</span>');
    if (typer.has("neutral")) leg.push('<span><i style="background:var(--accent)"></i>Belopp</span>');
    return `<figure class="diagram">${html}<figcaption class="legend">${leg.join("")}</figcaption></figure>`;
  }

  function tidslinje(l, maxAbs, klass) {
    const W = 640, padL = l.namn ? 74 : 30, padR = 30, hojd = 40;
    const n = l.n || Math.max(...l.poster.map((p) => p.t), 1);
    const harPos = l.harPos !== undefined ? l.harPos : l.poster.some((p) => p.v > 0);
    const harNeg = l.harNeg !== undefined ? l.harNeg : l.poster.some((p) => p.v < 0);
    const top = (l.pil ? 34 : 4) + (harPos ? hojd + 16 : 0);
    const H = top + (harNeg ? hojd + 16 : 0) + 20;
    const steg = (W - padL - padR) / n, bw = Math.min(34, steg * 0.5);
    const x = (t) => padL + t * steg;
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tidslinje ${ns(l.namn || "")}" class="${klass || ""}">`;
    if (l.namn) s += `<text class="txt" x="0" y="${top + 4}" font-weight="700">${ns(l.namn)}</text>`;
    s += `<line class="axel" x1="${padL - 12}" x2="${W - padR + 12}" y1="${top}" y2="${top}"/>`;
    for (let t = 0; t <= n; t++) {
      s += `<line class="axel" x1="${x(t)}" x2="${x(t)}" y1="${top - 4}" y2="${top + 4}"/>`;
      s += `<text class="txt-d" x="${x(t)}" y="${H - 6}" text-anchor="middle">${t === 0 ? "Idag" : "År " + t}</text>`;
    }
    // summera poster per år och typ
    const per = {};
    l.poster.forEach((p) => { const k = p.t + "|" + p.typ; per[k] = per[k] || { t: p.t, typ: p.typ, v: 0 }; per[k].v += p.v; });
    Object.values(per).forEach((p) => {
      if (!p.v) return;
      const h = Math.max(3, (Math.abs(p.v) / maxAbs) * hojd);
      const y = p.v > 0 ? top - h : top;
      const k = p.typ === "neutral" ? "neutral" : p.v > 0 ? "in" : "ut";
      s += `<rect class="stapel ${k}" x="${x(p.t) - bw / 2}" y="${y}" width="${bw}" height="${h}" rx="2"/>`;
      const ty = p.v > 0 ? top - h - 5 : top + h + 13;
      s += `<text class="txt" x="${x(p.t)}" y="${ty}" text-anchor="middle">${kort(p.v)}</text>`;
    });
    if (l.pil) {
      const x1 = x(l.pil.fran), x2 = x(l.pil.till), y = 14, mid = (x1 + x2) / 2;
      const dir = x2 > x1 ? 1 : -1;
      s += `<path class="pil" d="M${x1} ${top - hojd - 22} Q ${mid} ${y - 10} ${x2} ${top - hojd - 22}"/>`;
      s += `<path class="pil" d="M${x2 - dir * 8} ${top - hojd - 30} L${x2} ${top - hojd - 22} L${x2 - dir * 10} ${top - hojd - 20}"/>`;
      s += `<text class="txt" x="${mid}" y="${y + 6}" text-anchor="middle" font-style="italic">${ns(l.pil.text.replace(/\^/g, " ^ "))}</text>`;
    }
    return s + "</svg>";
  }

  // ---------- NPV som funktion av kalkylräntan ----------
  function nnvkurva(e) {
    const W = 640, H = 270, pl = 74, pr = 20, pt = 16, pb = 40;
    const xs = e.punkter.map((p) => p[0]), ys = e.punkter.map((p) => p[1]);
    const xmax = Math.max(...xs), ymin = Math.min(0, ...ys), ymax = Math.max(0, ...ys);
    const X = (v) => pl + (v / xmax) * (W - pl - pr);
    const Y = (v) => pt + (1 - (v - ymin) / (ymax - ymin || 1)) * (H - pt - pb);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Nettonuvärdet vid olika kalkylräntor">`;
    for (const p of e.punkter) s += `<line class="stod" x1="${X(p[0])}" x2="${X(p[0])}" y1="${pt}" y2="${H - pb}"/><text class="txt-d" x="${X(p[0])}" y="${H - pb + 16}" text-anchor="middle">${tal(p[0], p[0] % 1 ? 1 : 0)} %</text>`;
    [ymax, ymax / 2, 0, ymin / 2, ymin].filter((v, i, a) => a.indexOf(v) === i && (v !== 0 || true)).forEach((v) => {
      s += `<text class="txt-d" x="${pl - 8}" y="${Y(v) + 4}" text-anchor="end">${kort(v)}</text>`;
    });
    s += `<line class="axel" x1="${pl}" x2="${W - pr}" y1="${Y(0)}" y2="${Y(0)}"/>`;
    s += `<path class="linje" d="${e.punkter.map((p, i) => (i ? "L" : "M") + X(p[0]) + " " + Y(p[1])).join(" ")}"/>`;
    s += `<line x1="${X(e.kalk)}" x2="${X(e.kalk)}" y1="${pt}" y2="${H - pb}" stroke="var(--dämpad)" stroke-dasharray="4 4"/>`;
    s += `<text class="txt-d" x="${X(e.kalk) + 5}" y="${pt + 10}">kalkylränta ${tal(e.kalk, 1)} %</text>`;
    s += `<circle class="markor" cx="${X(e.irr)}" cy="${Y(0)}" r="6"/><text class="txt" font-weight="700" x="${X(e.irr) + 9}" y="${Y(0) - 9}">IR ≈ ${tal(e.irr, 1)} %</text>`;
    s += `<text class="txt-d" x="${(W + pl) / 2}" y="${H - 4}" text-anchor="middle">Kalkylränta</text>`;
    return `<figure class="diagram">${s}</svg><figcaption>Nettonuvärdet sjunker när kalkylräntan stiger. Där kurvan korsar noll ligger internräntan.</figcaption></figure>`;
  }

  // ---------- Tornadodiagram ----------
  function tornado(e) {
    const W = 640, pl = 170, gap = 64, pr = 70, rad = 34, pt = 24;
    const H = pt + e.rader.length * rad + 20;
    const alla = e.rader.flatMap((r) => [r.lag, r.hog]).concat([e.bas]);
    const lo = Math.min(...alla), hi = Math.max(...alla), sp = hi - lo || 1;
    const X = (v) => pl + gap + ((v - lo) / sp) * (W - pl - gap - pr);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tornadodiagram">`;
    s += `<text class="txt-d" x="${X(e.bas)}" y="12" text-anchor="middle">Grund: ${kort(e.bas)}</text>`;
    e.rader.forEach((r, i) => {
      const y = pt + i * rad;
      const a = Math.min(r.lag, r.hog), b = Math.max(r.lag, r.hog);
      s += `<text class="txt" x="${pl - 10}" y="${y + rad / 2 + 4}" text-anchor="end">${ns(r.namn)}</text>`;
      if (a < e.bas) s += `<rect class="ut" x="${X(a)}" y="${y + 6}" width="${X(Math.min(b, e.bas)) - X(a)}" height="${rad - 12}" rx="2"/>`;
      if (b > e.bas) s += `<rect class="in" x="${X(Math.max(a, e.bas))}" y="${y + 6}" width="${X(b) - X(Math.max(a, e.bas))}" height="${rad - 12}" rx="2"/>`;
      s += `<text class="txt-d" x="${X(b) + 6}" y="${y + rad / 2 + 4}">${kort(b)}</text>`;
      s += `<text class="txt-d" x="${X(a) - 6}" y="${y + rad / 2 + 4}" text-anchor="end">${kort(a)}</text>`;
    });
    s += `<line class="axel" x1="${X(e.bas)}" x2="${X(e.bas)}" y1="${pt - 2}" y2="${H - 16}"/>`;
    if (lo < 0 && hi > 0) s += `<line x1="${X(0)}" x2="${X(0)}" y1="${pt - 2}" y2="${H - 16}" stroke="var(--ut)" stroke-dasharray="3 3"/><text class="txt-d" x="${X(0)}" y="${H - 2}" text-anchor="middle">NPV = 0</text>`;
    return `<figure class="diagram">${s}</svg><figcaption>Tornadodiagram: ju bredare stapel, desto känsligare är NPV för variabeln (±10 %).</figcaption></figure>`;
  }

  // ---------- Sandlåda (interaktiv känslighetsanalys) ----------
  function sandlada(el, b) {
    const def = [
      { k: "V", n: "Försäljningsvolym (st/år)", min: Math.round(b.V * 0.5), max: Math.round(b.V * 1.5), step: 100, f: (v) => tal(v) },
      { k: "p", n: "Pris (kr/st)", min: Math.round(b.p * 0.6), max: Math.round(b.p * 1.4), step: 1, f: (v) => kr(v) },
      { k: "v", n: "Rörlig kostnad (kr/st)", min: Math.round(b.v * 0.6), max: Math.round(b.v * 1.4), step: 1, f: (v) => kr(v) },
      { k: "F", n: "Fasta utbetalningar (kr/år)", min: Math.round(b.F * 0.4), max: Math.round(b.F * 1.6), step: 10000, f: (v) => kr(v) },
      { k: "G", n: "Grundinvestering", min: Math.round(b.G * 0.5), max: Math.round(b.G * 1.5), step: 50000, f: (v) => kr(v) },
      { k: "r", n: "Kalkylränta", min: 1, max: 25, step: 0.5, f: (v) => tal(v, v % 1 ? 1 : 0) + " %", skala: 100 },
      { k: "n", n: "Livslängd (år)", min: 2, max: 12, step: 1, f: (v) => v + " år" },
    ];
    const x = Object.assign({}, b);
    const basNPV = (b.V * (b.p - b.v) - b.F) * F.nusf(b.r, b.n) - b.G;
    el.innerHTML = `<section class="sandlada"><p>Ändra ett antagande i taget och se hur nettonuvärdet påverkas.</p>
      <div class="nnv-stor" aria-live="polite"></div><p class="varfor" data-diff></p>
      <div class="reglage">${def.map((d) => `<label><span>${d.n}<output data-o="${d.k}"></output></span>
        <input type="range" data-k="${d.k}" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.skala ? b[d.k] * d.skala : b[d.k]}"></label>`).join("")}</div>
      <div class="knapprad"><button type="button" data-aterstall>Återställ grundscenariot</button></div></section>`;
    const upd = () => {
      def.forEach((d) => { const i = el.querySelector(`[data-k="${d.k}"]`); const v = Number(i.value); x[d.k] = d.skala ? v / d.skala : v; el.querySelector(`[data-o="${d.k}"]`).textContent = d.f(v); });
      const a = x.V * (x.p - x.v) - x.F, nnv = a * F.nusf(x.r, x.n) - x.G;
      const o = el.querySelector(".nnv-stor");
      o.textContent = "NPV " + kr(nnv); o.className = "nnv-stor " + (nnv >= 0 ? "pos" : "neg");
      el.querySelector("[data-diff]").textContent = `Årligt överskott ${kr(a)}. Skillnad mot grundscenariot: ${nnv - basNPV >= 0 ? "+" : ""}${kr(nnv - basNPV)}.`;
    };
    el.querySelectorAll("input").forEach((i) => i.addEventListener("input", upd));
    el.querySelector("[data-aterstall]").addEventListener("click", () => {
      def.forEach((d) => { el.querySelector(`[data-k="${d.k}"]`).value = d.skala ? b[d.k] * d.skala : b[d.k]; });
      upd();
    });
    upd();
  }

  root.Diagram = { tidslinjer, tidslinje, nnvkurva, tornado, sandlada };
})(window);
