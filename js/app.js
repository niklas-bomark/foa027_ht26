/* ============================================================
   app.js – sidor, navigering, rättning och lärarläge
   ============================================================ */
(function () {
  "use strict";
  const bank = window.FRAGEBANK;
  const { tal, kr, tolka } = window.Finans;
  const D = window.Diagram;
  const $ = (s, el) => (el || document).querySelector(s);
  const main = $("#innehall");
  const aktiva = Object.keys(bank.moduler).filter((id) => bank.moduler[id].aktiv && window.Moduler.generatorer[id]);
  const nyttSeed = () => 10000 + Math.floor(Math.random() * 90000);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- Framsteg (sparas bara i den egna webbläsaren) ----------
  const NYCKEL = "investera-framsteg-v1";
  function lasFramsteg() { try { return JSON.parse(localStorage.getItem(NYCKEL)) || {}; } catch (e) { return {}; } }
  function sparaFramsteg(id, ratt) {
    try { const f = lasFramsteg(); f[id] = f[id] || { klara: 0, seeds: [] };
      if (ratt && !f[id].seeds.includes(ratt)) { f[id].klara++; f[id].seeds = f[id].seeds.concat(ratt).slice(-50); }
      localStorage.setItem(NYCKEL, JSON.stringify(f)); } catch (e) { /* privat läge – ignorera */ }
  }

  // ---------- Meny ----------
  function byggMeny(aktuell) {
    const f = lasFramsteg();
    const html = `<a class="varumarke" href="#/"><strong>${esc(bank.kurs.namn)}</strong><span>${esc(bank.kurs.kod)}</span></a>`
      + bank.grupper.map((g) => {
        const ids = aktiva.filter((id) => bank.moduler[id].grupp === g.id);
        if (!ids.length) return "";
        return `<div class="meny-grupp"><h2><b>${esc(g.id)}</b>${esc(g.namn)}</h2><ul>`
          + ids.map((id) => `<li><a class="lank" href="#/ovning/${id}" ${id === aktuell ? 'aria-current="page"' : ""}><span>${esc(bank.moduler[id].rubrik)}</span>${f[id] && f[id].klara ? `<span class="poang" title="Antal frågor du klarat">✓ ${f[id].klara}</span>` : ""}</a></li>`).join("")
          + "</ul></div>";
      }).join("")
      + `<div class="extra-lankar"><ul>
          <li><a class="lank" href="#/formler" ${aktuell === "formler" ? 'aria-current="page"' : ""}><span>Formelsamling</span></a></li>
          <li><a class="lank" href="#/blandat" ${aktuell === "blandat" ? 'aria-current="page"' : ""}><span>Blandade övningar</span></a></li>
          <li><a class="lank" href="#/larare" ${aktuell === "larare" ? 'aria-current="page"' : ""}><span>Lärare: skriv ut övningsblad</span></a></li>
        </ul><button class="tyst tema-knapp" type="button" data-tema>Byt ljust/mörkt läge</button></div>`;
    $("#meny").innerHTML = html;
    $("#meny-mobil").innerHTML = html;
    document.querySelectorAll("[data-tema]").forEach((b) => b.addEventListener("click", bytTema));
  }
  function bytTema() {
    const r = document.documentElement;
    const morkNu = r.dataset.theme ? r.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    r.dataset.theme = morkNu ? "light" : "dark";
    try { localStorage.setItem("investera-tema", r.dataset.theme); } catch (e) {}
  }
  try { const t = localStorage.getItem("investera-tema"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}

  // ---------- Startsida ----------
  function visaStart() {
    main.innerHTML = `
      <h1>${esc(bank.kurs.namn)}</h1>
      <p class="ingress">Räkneövningar med rättning och lösningar. Välj ett område nedan eller i menyn. Svar inom 0,5 % av facit räknas som rätt. Alla formler finns samlade i <a href="#/formler">formelsamlingen</a>.</p>
      <div class="oversikt">${bank.grupper.map((g) => {
        const ids = aktiva.filter((id) => bank.moduler[id].grupp === g.id);
        if (!ids.length) return "";
        return `<section><h2><span>${esc(g.id)}</span> ${esc(g.namn)}</h2><ul>${ids.map((id) => `<li><a href="#/ovning/${id}">${esc(bank.moduler[id].rubrik)}</a></li>`).join("")}</ul></section>`;
      }).join("")}</div>`;
    document.title = "Investeringsbedömning – övningar";
  }

  // ---------- Övning ----------
  function visaOvning(id, seed, blandat) {
    const c = bank.moduler[id];
    const grupp = bank.grupper.find((g) => g.id === c.grupp) || { id: "", namn: "" };
    let q;
    try { q = window.Moduler.skapaFraga(id, seed, bank); }
    catch (e) { main.innerHTML = `<h1>Något gick fel</h1><p>Frågan kunde inte skapas: ${esc(e.message)}. Kontrollera intervallen för <code>${id}</code> i fragebank.js.</p>`; return; }
    const fel = {}; let losningVisad = false;
    document.title = c.rubrik + " – övning";
    main.innerHTML = `
      <header class="overskrift">
        <p class="grupp-etikett">${blandat ? "Blandade övningar – " : ""}${esc(grupp.id)} ${esc(grupp.namn)}</p>
        <h1>${esc(c.rubrik)}</h1>
      </header>
      <details class="teori"><summary>Teori och formler</summary>${c.teori}</details>
      <section class="uppgift" aria-labelledby="fraga-rubrik">
        <div class="meta"><span id="fraga-rubrik">Fråga nr <b>${seed}</b></span>
          <span class="skarmbara"><button class="tyst" type="button" data-kopiera>Kopiera länk</button></span></div>
        <div class="fraga">${q.fraga}</div>
        <form class="svar" novalidate>${q.svar.map(svarsFalt).join("")}</form>
        <div class="ledtrad-plats" aria-live="polite"></div>
        <div class="knapprad">
          <button class="primar" type="button" data-ratta>Rätta</button>
          <button type="button" data-ledtrad>Ledtråd</button>
          <button type="button" data-losning>Visa lösning</button>
          <button type="button" data-ny>Ny fråga</button>
        </div>
      </section>
      <section class="losning" hidden></section>`;
    const form = $(".svar", main);
    form.addEventListener("submit", (e) => { e.preventDefault(); ratta(); });
    form.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.matches("input[type=text]")) { e.preventDefault(); ratta(); } });

    function ratta() {
      let allaRatt = true;
      q.svar.forEach((s) => {
        const rad = $(`[data-svar="${s.id}"]`, main), fb = $(".aterkoppling", rad);
        const res = kontrollera(s, rad);
        rad.classList.remove("ratt", "fel");
        if (res.tom) { fb.textContent = "Fyll i ett svar."; allaRatt = false; return; }
        rad.classList.add(res.ok ? "ratt" : "fel");
        fb.textContent = res.ok ? "Rätt!" : res.tips;
        if (!res.ok) { allaRatt = false; fel[s.id] = (fel[s.id] || 0) + 1; }
      });
      if (allaRatt) { sparaFramsteg(id, seed); byggMeny(blandat ? "blandat" : id); }
      else if (Object.values(fel).some((n) => n >= 2) && !$(".ledtrad", main)) visaLedtrad();
    }
    function visaLedtrad() { $(".ledtrad-plats", main).innerHTML = `<div class="ledtrad"><strong>Ledtråd</strong>${q.ledtrad}</div>`; }
    function visaLosning() {
      const el = $(".losning", main);
      if (losningVisad) { el.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
      losningVisad = true;
      el.hidden = false;
      el.innerHTML = `<h2>Lösning</h2>`
        + (q.tidslinjer ? D.tidslinjer(q.tidslinjer) : "")
        + `<ol class="steg">${q.steg.map((s) => `<li><h3>${s.r}</h3><div>${s.h}</div></li>`).join("")}</ol>`
        + `<div class="slutsats"><table class="facit">${q.svar.map((s) => `<tr><th>${s.etikett}</th><td>${visaFacit(s)}</td></tr>`).join("")}</table>`
        + (q.slutsats ? `<p>${q.slutsats}</p>` : "") + `</div>`
        + `<div class="extra"></div>`;
      const ex = $(".extra", el);
      (q.extra || []).forEach((e) => {
        if (e.typ === "nnvkurva") ex.insertAdjacentHTML("beforeend", D.nnvkurva(e));
        if (e.typ === "tornado") ex.insertAdjacentHTML("beforeend", D.tornado(e));
        if (e.typ === "sandlada") { const det = document.createElement("details"); det.className = "utforska"; det.innerHTML = "<summary>Utforska själv med reglage</summary>"; const d = document.createElement("div"); det.appendChild(d); ex.appendChild(det); D.sandlada(d, e.bas); }
      });
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    $("[data-ratta]", main).addEventListener("click", ratta);
    $("[data-ledtrad]", main).addEventListener("click", visaLedtrad);
    $("[data-losning]", main).addEventListener("click", visaLosning);
    $("[data-ny]", main).addEventListener("click", () => { location.hash = blandat ? "#/blandat/" + nyttSeed() : `#/ovning/${id}/${nyttSeed()}`; });
    $("[data-kopiera]", main).addEventListener("click", (e) => {
      const url = location.href.split("#")[0] + `#/ovning/${id}/${seed}`;
      const klar = () => { e.target.textContent = "Länken är kopierad"; };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(klar, () => prompt("Kopiera länken:", url));
      else prompt("Kopiera länken:", url);
    });
  }

  function svarsFalt(s) {
    const typ = s.typ || "tal";
    if (typ === "tal") {
      return `<div class="svarsrad" data-svar="${s.id}"><label for="in-${s.id}">${s.etikett}</label>
        <div class="falt"><input type="text" id="in-${s.id}" inputmode="decimal" autocomplete="off"><span class="enhet">${s.enhet || ""}</span></div>
        <div class="aterkoppling" aria-live="polite"></div></div>`;
    }
    const t = typ === "flerval" ? "checkbox" : "radio";
    return `<fieldset class="svarsrad" data-svar="${s.id}" style="border:0;padding:0;margin:0"><legend class="etikett">${s.etikett}${typ === "flerval" ? ' <span class="varfor">(markera alla som stämmer)</span>' : ""}</legend>
      <div class="val-lista">${s.alternativ.map((a) => `<label><input type="${t}" name="v-${s.id}" value="${esc(a.v)}">${esc(a.t)}</label>`).join("")}</div>
      <div class="aterkoppling" aria-live="polite"></div></fieldset>`;
  }

  function kontrollera(s, rad) {
    const typ = s.typ || "tal";
    if (typ === "val") {
      const v = $("input:checked", rad);
      if (!v) return { tom: true };
      return { ok: v.value === s.facit, tips: "Inte rätt. Fundera på beslutsregeln för metoden." };
    }
    if (typ === "flerval") {
      const v = [...rad.querySelectorAll("input:checked")].map((i) => i.value).sort();
      const ok = v.join() === s.facit.slice().sort().join();
      return { ok, tips: s.facit.length === 0 && v.length ? "Inte rätt. Kan det vara så att inget alternativ stämmer?" : "Inte rätt kombination ännu." };
    }
    const x = tolka($("input", rad).value);
    if (!isFinite(x)) return $("input", rad).value.trim() ? { ok: false, tips: "Skriv ett tal, till exempel 12 345 eller 8,5." } : { tom: true };
    const facit = s.facit, diff = Math.abs((s.fritecken ? Math.abs(x) : x) - (s.fritecken ? Math.abs(facit) : facit));
    if (diff <= s.tol) return { ok: true };
    let tips = "Inte rätt än.";
    if (!s.fritecken && Math.abs(Math.abs(x) - Math.abs(facit)) <= s.tol) tips = "Beloppet stämmer men tecknet är fel – är det positivt eller negativt?";
    else if (s.enhet === "%" && Math.abs(x * 100 - facit) <= s.tol * 100) tips = "Ange svaret i procent, till exempel 8,5 och inte 0,085.";
    else if (Math.abs(facit) > 0) {
      const rel = (x - facit) / Math.abs(facit);
      tips += Math.abs(rel) < 0.03 ? " Du är nära – kontrollera avrundningen i mellanleden." : rel > 0 ? " Ditt svar är för högt." : " Ditt svar är för lågt.";
    }
    return { ok: false, tips };
  }

  function visaFacit(s) {
    const typ = s.typ || "tal";
    if (typ === "val") return esc((s.alternativ.find((a) => a.v === s.facit) || {}).t || s.facit);
    if (typ === "flerval") return s.facit.length ? s.facit.join(", ") : "inget";
    const d = s.dec !== undefined ? s.dec : 0;
    if (s.enhet === "kr") return kr(s.facit, d);
    return tal(s.facit, d) + (s.enhet ? " " + s.enhet : "");
  }

  // ---------- Formelsamling ----------
  function visaFormler() {
    document.title = "Formelsamling";
    main.innerHTML = `<h1>Formelsamling</h1>
      <p class="ingress">Formlerna från föreläsningarna F2–F7, med samma beteckningar som i övningarna. Där övningarna skiljer sig från föreläsningen står det i en kort kommentar.</p>
      ${bank.grupper.map((g) => {
        const ids = aktiva.filter((id) => bank.moduler[id].grupp === g.id);
        if (!ids.length) return "";
        return `<section class="formelgrupp"><h2>${esc(g.id)} ${esc(g.namn)}</h2>${ids.map((id) => `<div class="formelpost"><h3><a href="#/ovning/${id}">${esc(bank.moduler[id].rubrik)}</a></h3>${bank.moduler[id].teori}</div>`).join("")}</section>`;
      }).join("")}
      ${bank.ovrigaFormler ? `<section class="formelgrupp"><h2>${esc(bank.ovrigaFormler.rubrik)}</h2><div class="formelpost">${bank.ovrigaFormler.html}<p class="varfor">Dessa formler har inga egna övningar.</p></div></section>` : ""}`;
  }

  // ---------- Lärarläge ----------
  function visaLarare() {
    document.title = "Övningsblad – lärare";
    main.innerHTML = `
      <h1>Skriv ut övningsblad</h1>
      <p class="ingress">Välj övningar och antal frågor. Facit hamnar på en egen sida. Samma startnummer ger alltid samma blad.</p>
      <form class="larare" novalidate>
        ${bank.grupper.map((g) => {
          const ids = aktiva.filter((id) => bank.moduler[id].grupp === g.id);
          if (!ids.length) return "";
          return `<h2>${esc(g.id)} ${esc(g.namn)}</h2><div class="larar-val">${ids.map((id) => `<label><input type="checkbox" name="m" value="${id}">${esc(bank.moduler[id].rubrik)}</label>`).join("")}</div>`;
        }).join("")}
        <div class="larar-installning">
          <label>Frågor per övning<input type="number" name="antal" min="1" max="20" value="3"></label>
          <label>Startnummer<input type="number" name="start" min="10000" max="99999" value="${nyttSeed()}"></label>
          <label>Facit<select name="facit"><option value="kort">Bara svar</option><option value="lang">Med lösningar</option></select></label>
          <button class="primar" type="submit">Skapa blad</button>
        </div>
      </form>
      <div class="blad"></div>`;
    $("form.larare", main).addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target), ids = fd.getAll("m");
      if (!ids.length) { $(".blad", main).innerHTML = "<p>Markera minst en övningstyp ovan.</p>"; return; }
      const antal = Math.max(1, Math.min(20, Number(fd.get("antal")) || 1)), start = Number(fd.get("start")) || 10000, lang = fd.get("facit") === "lang";
      const fragor = []; let nr = start;
      ids.forEach((id) => { for (let i = 0; i < antal; i++) fragor.push(window.Moduler.skapaFraga(id, nr++, bank)); });
      $(".blad", main).innerHTML = `<div class="knapprad"><button class="primar" type="button" onclick="window.print()">Skriv ut</button></div>
        <h2>Övningsblad – ${esc(bank.kurs.namn)}</h2>
        ${fragor.map((q, i) => `<div class="blad-uppgift"><h3>Uppgift ${i + 1}: ${esc(q.rubrik)} <span class="nr">(fråga nr ${q.seed})</span></h3>${q.fraga}</div>`).join("")}
        <div class="facit-blad"><h2>Facit</h2>
        ${fragor.map((q, i) => `<div class="blad-uppgift"><h3>Uppgift ${i + 1}</h3><p>${q.svar.map((s) => `${s.etikett}: <b>${visaFacit(s)}</b>`).join("<br>")}</p>
          ${lang ? `<div class="losning"><ol class="steg">${q.steg.map((s) => `<li><h3>${s.r}</h3><div>${s.h}</div></li>`).join("")}</ol>${q.slutsats ? `<p>${q.slutsats}</p>` : ""}</div>` : ""}</div>`).join("")}</div>`;
      $(".blad", main).scrollIntoView({ behavior: "smooth" });
    });
  }

  // ---------- Router ----------
  function route() {
    const delar = location.hash.replace(/^#\/?/, "").split("/");
    let aktuell = null;
    if (delar[0] === "ovning" && aktiva.includes(delar[1])) {
      const seed = Number(delar[2]);
      if (!seed) { location.replace(`#/ovning/${delar[1]}/${nyttSeed()}`); return; }
      aktuell = delar[1]; visaOvning(delar[1], seed, false);
    } else if (delar[0] === "blandat") {
      const seed = Number(delar[1]);
      if (!seed) { location.replace(`#/blandat/${nyttSeed()}`); return; }
      aktuell = "blandat";
      const id = aktiva[seed % aktiva.length];
      visaOvning(id, seed, true);
    } else if (delar[0] === "larare") { aktuell = "larare"; visaLarare(); }
    else if (delar[0] === "formler") { aktuell = "formler"; visaFormler(); }
    else visaStart();
    byggMeny(aktuell);
    const mm = $(".mobil-meny"); if (mm) mm.open = false;
    $("#mobil-titel").textContent = aktuell && bank.moduler[aktuell] ? bank.moduler[aktuell].rubrik : bank.kurs.namn;
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
