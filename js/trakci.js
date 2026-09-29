/* =====================================================================
   Razredni zaslon — Trakci (tračni modeli, singapurska metoda)
   Trakovi iz delov, oklepaji z oznakami nad in pod deli, več trakov
   drug pod drugim in stolpec za račun.

   Vse se ureja neposredno na modelu:
   · meje med deli vlečeš (in se prilepijo na meje drugih trakov),
   · čez več delov povlečeš, da jih izbereš skupaj,
   · trak premakneš za ročico ⋮.
   Širine so v enotah — vsi trakovi imajo isto merilo, zato se deli
   različnih trakov lahko natanko poravnajo.
   ===================================================================== */
'use strict';

const BARVE_TRAKOV = ['#F9A65A', '#F47C7C', '#29B6E0', '#9B7BD0', '#7CC576', '#F7D154', '#F48FB1', '#FFFFFF'];
const NAJMANJ_DEL = 0.2;      // najožji del v enotah
const LEPLJENJE_PX = 14;      // kako blizu mora biti meja, da se prilepi

/** Na svetli barvi temno besedilo, na temni belo. */
function jeSvetla(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 165;
}

/** "1/3 ostanka" -> ulomek s števcem nad imenovalcem. */
const oznakaHtml = s => ubezi(s).replace(/(\d+)\s*\/\s*(\d+)/g, '<span class="ulomek"><b>$1</b><i>$2</i></span>');

const zaokrozi = x => Math.round(x * 1000) / 1000;
const del = (w, oznaka = '', barva = BARVE_TRAKOV[0]) => ({ w, oznaka, barva });
const oklepaj = (od, doo, oznaka, stran = 'zgoraj', slog = 'oklepaj') => ({ od, do: doo, oznaka, stran, slog });
const trak = (deli, oklepaji = [], ime = '', zamik = 0) => ({ ime, zamik, deli, oklepaji });

const PREDLOGE_TRAKOV = {
  delcelota: {
    ime: 'Del + del = celota',
    // celota je svoj pravokotnik nad deli, enako dolg kot vsi deli skupaj
    model: () => ({
      trakovi: [trak([del(5, 'Celota', '#29B6E0')]), trak([del(3, 'Del', '#F9A65A'), del(2, 'Del', '#F47C7C')])],
      racun: '',
    }),
  },
  primerjava: {
    ime: 'Primerjava',
    model: () => ({
      trakovi: [
        trak([del(5, '20', '#29B6E0')], [], 'Ana'),
        trak([del(2, '8', '#9B7BD0'), del(3, '?', '#FFFFFF')], [oklepaj(1, 1, 'razlika', 'spodaj')], 'Bor'),
      ],
      racun: '20 − 8 = 12',
    }),
  },
  enaki: {
    ime: 'Enaki deli',
    model: () => ({
      trakovi: [trak(Array.from({ length: 4 }, () => del(1, '5', '#7CC576')), [oklepaj(0, 3, '?', 'zgoraj')])],
      racun: '4 · 5 = 20',
    }),
  },
  ostanek: {
    ime: 'Ulomek ostanka',
    // Kmet je prvi dan prodal 1/3 krompirja in še 2 kg, drugi dan 1/2 ostanka in še 3 kg,
    // tretji dan zadnjih 15 kg. Kot v singapurskih modelih ni v merilu, a tretjine
    // (19 enot) in polovici ostanka (17 enot) sta natančni.
    model: () => ({
      trakovi: [
        trak([del(19, '1/3', '#F9A65A'), del(4, '2 kg', '#F47C7C'), del(15, '', '#29B6E0'), del(19, '', '#29B6E0')],
             [oklepaj(0, 3, '? kg', 'zgoraj'), oklepaj(0, 1, '1. dan', 'spodaj'), oklepaj(2, 3, 'ostanek', 'spodaj')]),
        trak([del(17, '1/2', '#F9A65A'), del(4, '3 kg', '#F47C7C'), del(13, '15 kg', '#7CC576')],
             [oklepaj(0, 1, '2. dan', 'spodaj'), oklepaj(2, 2, '3. dan', 'spodaj')], '', 23),
      ],
      racun: '15 + 3 = 18\n18 · 2 = 36\n36 + 2 = 38\n38 : 2 = 19\n19 · 3 = 57 kg',
      pokaziRacun: true,
    }),
  },
  prejpotem: {
    ime: 'Prej in potem',
    model: () => ({
      trakovi: [
        trak([del(15, '15', '#F48FB1'), del(15, '15', '#F48FB1'), del(15, '15', '#F48FB1')],
             [oklepaj(0, 2, '45', 'zgoraj'), oklepaj(0, 0, 'ostanek', 'spodaj'), oklepaj(1, 2, 'sestra', 'spodaj')], 'Prej'),
        trak(Array.from({ length: 5 }, () => del(3, '3', '#F48FB1')),
             [oklepaj(0, 2, 'pojedel', 'spodaj'), oklepaj(3, 4, 'ostalo', 'spodaj')], 'Potem'),
      ],
      racun: '6 : 2 = 3\n5 · 3 = 15\n15 · 3 = 45',
      pokaziRacun: true,
    }),
  },
};

/** Zavit oklepaj (konici spodaj, vrh zgoraj) ali puščica ↔, širok W. */
function potOklepaja(W, slog) {
  const h = 14, s = h / 2;
  if (slog === 'puscica') {
    return `M1 ${s}H${W - 1}M1 ${s}l7 -5M1 ${s}l7 5M${W - 1} ${s}l-7 -5M${W - 1} ${s}l-7 5M1 1v${h - 2}M${W - 1} 1v${h - 2}`;
  }
  const r = Math.min(12, W / 4), m = W / 2;
  return `M1 ${h}Q1 ${s} ${1 + r} ${s}L${m - r} ${s}Q${m} ${s} ${m} 1Q${m} ${s} ${m + r} ${s}L${W - 1 - r} ${s}Q${W - 1} ${s} ${W - 1} ${h}`;
}

Platno.registriraj('trakci', {
  naslov: 'Trakci',
  velikost: [760, 440],

  izris(telo, zapis) {
    const p = zapis.podatki;
    if (!p.trakovi) Object.assign(p, PREDLOGE_TRAKOV.delcelota.model());
    p.pisava = p.pisava || 1;
    if (p.urejam === undefined) p.urejam = true;

    let izbor = null;      // {tip:'del', v, od, do} | {tip:'trak', v} | {tip:'oklepaj', v, o}
    let vlecenje = null;   // {tip:'meja'|'trak'|'izbira', …}
    let merilo = 1;        // px na enoto ob zadnjem izrisu
    let vodilo = null;     // kje (v enotah) je črta poravnave med vlečenjem

    telo.classList.add('bm');
    telo.innerHTML = `
      <div class="bm-orodja">
        <div class="bm-vrstica">
          <button class="gumb gumb-s bm-dodaj-trak">+ Trak</button>
          <select class="izbirnik bm-predloga" aria-label="Predloga">
            <option value="">Predloga …</option>
            ${Object.entries(PREDLOGE_TRAKOV).map(([k, v]) => `<option value="${k}">${ubezi(v.ime)}</option>`).join('')}
          </select>
          <button class="mini bm-racun-gumb" title="Stolpec za račun" aria-label="Stolpec za račun">=</button>
          <span style="flex:1"></span>
          <button class="mini a-pisava" data-d="-1" title="Manjša pisava"><small>A</small>−</button>
          <button class="mini a-pisava" data-d="1" title="Večja pisava">A+</button>
          <button class="gumb gumb-p bm-koncano">Končano</button>
        </div>
        <div class="bm-vrstica bm-izbor"></div>
      </div>
      <button class="gumb gumb-s bm-uredi">Uredi</button>
      <div class="bm-vsebina">
        <div class="bm-model"></div>
        <div class="bm-racun" contenteditable="true" spellcheck="false" data-prazno="Račun …"></div>
      </div>`;

    const $t = s => telo.querySelector(s);
    const model = $t('.bm-model');
    const racun = $t('.bm-racun');
    racun.textContent = p.racun || '';
    racun.addEventListener('input', () => { p.racun = racun.innerText; shraniStanje(); });

    const shrani = () => shraniStanje();
    const vsota = (t, od = 0, doo = t.deli.length - 1) => t.deli.slice(od, doo + 1).reduce((s, d) => s + d.w, 0);
    const naslednjaBarva = t => BARVE_TRAKOV[(BARVE_TRAKOV.indexOf(t.deli.at(-1)?.barva) + 1) % BARVE_TRAKOV.length];

    /** Meje vseh drugih trakov (v enotah) — na te se lepijo meje in začetki. */
    const tujeMeje = vi => {
      const m = new Set([0]);
      p.trakovi.forEach((t, i) => {
        if (i === vi) return;
        let x = t.zamik; m.add(zaokrozi(x));
        t.deli.forEach(d => { x += d.w; m.add(zaokrozi(x)); });
      });
      return [...m];
    };
    const prilepi = (vi, poz) => {
      let naj = null;
      for (const c of tujeMeje(vi)) if (Math.abs(c - poz) * merilo < LEPLJENJE_PX && (naj === null || Math.abs(c - poz) < Math.abs(naj - poz))) naj = c;
      return naj;
    };

    /* ---------------- izris modela ---------------- */

    let zadnjaSirina = 0;
    function risi() {
      telo.classList.toggle('urejam', p.urejam);
      telo.classList.toggle('prikaz', !p.urejam);
      telo.style.setProperty('--bs', p.pisava);
      racun.classList.toggle('skrit', !p.pokaziRacun);
      $t('.bm-racun-gumb').classList.toggle('on', !!p.pokaziRacun);

      const imaImena = p.trakovi.some(t => t.ime);
      const imeW = imaImena ? Math.round(86 * p.pisava) : 0;
      const rocajW = p.urejam ? 22 : 0;
      const konec = Math.max(1, ...p.trakovi.map(t => t.zamik + vsota(t)));
      zadnjaSirina = model.clientWidth;
      // med vlečenjem merilo zamrznemo, sicer bi model poskakoval
      const u = vlecenje?.u ?? Math.max(2, (model.clientWidth - 6 - 38 - rocajW - imeW) / konec);
      merilo = u;
      const visinaRavni = Math.round(44 * p.pisava);
      const stolpci = `${rocajW}px ${imeW}px 1fr`;

      model.innerHTML = p.trakovi.map((t, vi) => {
        const meje = [t.zamik];
        t.deli.forEach(d => meje.push(meje.at(-1) + d.w));

        const oklepaji = stran => {
          const seznam = t.oklepaji.map((o, oi) => ({ ...o, oi })).filter(o => o.stran === stran)
            .sort((a, b) => (a.do - a.od) - (b.do - b.od));
          if (!seznam.length) return '';
          // krajši oklepaji bližje traku; oznake, ki bi se prekrivale, gredo v novo vrsto
          const ravni = [];
          const html = seznam.map(o => {
            const od = Math.max(0, Math.min(o.od, t.deli.length - 1));
            const doo = Math.max(od, Math.min(o.do, t.deli.length - 1));
            const x1 = meje[od] * u, x2 = meje[doo + 1] * u;
            const pol = Math.max(x2 - x1, o.oznaka.length * 9 * p.pisava + 14) / 2;
            const a1 = (x1 + x2) / 2 - pol, a2 = (x1 + x2) / 2 + pol;
            let L = 0;
            while ((ravni[L] || []).some(([a, b]) => a1 < b - 1 && a2 > a + 1)) L++;
            (ravni[L] = ravni[L] || []).push([a1, a2]);
            const W = Math.max(8, x2 - x1);
            const izbran = izbor?.tip === 'oklepaj' && izbor.v === vi && izbor.o === o.oi;
            const svg = `<svg width="${W}" height="14" viewBox="0 0 ${W} 14" aria-hidden="true">
                           <path d="${potOklepaja(W, o.slog)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
            const oznaka = `<span class="bm-ok-oznaka">${oznakaHtml(o.oznaka)}</span>`;
            return `<div class="bm-oklepaj${izbran ? ' izbran' : ''}" data-v="${vi}" data-o="${o.oi}"
                         style="left:${x1}px;width:${W}px;${stran === 'zgoraj' ? 'bottom' : 'top'}:${L * visinaRavni}px">
                      ${stran === 'zgoraj' ? oznaka + svg : svg + oznaka}</div>`;
          }).join('');
          return `<div class="bm-oklepaji ${stran}" style="height:${ravni.length * visinaRavni}px">${html}</div>`;
        };

        const vIzboru = di => izbor?.tip === 'del' && izbor.v === vi && di >= izbor.od && di <= izbor.do;
        // v ozkem delu se pisava zmanjša, da oznaka ostane cela
        const osnova = 17 * p.pisava;
        const pisavaDela = (d) => {
          const znaki = d.oznaka.replace(/(\d+)\s*\/\s*(\d+)/g, (_, a, b) => a.length > b.length ? a : b).length;
          return znaki ? Math.max(9, Math.min(osnova, (d.w * u - 8) / (0.62 * znaki))) : osnova;
        };
        const deli = t.deli.map((d, di) =>
          `<div class="bm-del${vIzboru(di) ? ' izbran' : ''}" data-v="${vi}" data-d="${di}"
                style="width:${d.w * u}px;font-size:${pisavaDela(d).toFixed(1)}px;background:${d.barva};color:${jeSvetla(d.barva) ? '#23262F' : '#fff'}">
             <span>${oznakaHtml(d.oznaka)}</span></div>`).join('');
        // ročice za vlečenje mej: med deli in na koncu traku
        let x = 0;
        const rocaji = t.deli.map((d, di) => {
          x += d.w * u;
          return `<div class="bm-meja${di === t.deli.length - 1 ? ' konec' : ''}" data-v="${vi}" data-i="${di}" style="left:${x}px"
                       title="Povleci za širino"></div>`;
        }).join('');

        const izbranTrak = izbor?.tip === 'trak' && izbor.v === vi;
        return `<div class="bm-vrsta${izbranTrak ? ' izbran' : ''}" style="grid-template-columns:${stolpci}">
                  <button class="bm-rocaj-traku" data-v="${vi}" title="Klikni za urejanje traku, povleci za premik" aria-label="Trak ${vi + 1}">⋮</button>
                  <div class="bm-ime" data-v="${vi}">${ubezi(t.ime)}</div>
                  ${oklepaji('zgoraj')}
                  <div class="bm-trak" style="margin-left:${t.zamik * u}px">
                    ${deli}${rocaji}
                    <button class="bm-plus" data-v="${vi}" title="Dodaj del" aria-label="Dodaj del">+</button>
                  </div>
                  ${oklepaji('spodaj')}
                </div>`;
      }).join('');

      if (vodilo !== null) {
        model.insertAdjacentHTML('beforeend',
          `<div class="bm-vodilo" style="left:${6 + rocajW + imeW + vodilo * u}px"></div>`);
      }
    }

    /* ---------------- orodna vrstica za izbrano ---------------- */

    const gumb = (akcija, besedilo, naslov = '', razred = 'mini') =>
      `<button class="${razred}" data-a="${akcija}"${naslov ? ` title="${naslov}" aria-label="${naslov}"` : ''}>${besedilo}</button>`;
    const loc = '<span class="bm-loc"></span>';

    function orodja() {
      const v = $t('.bm-izbor');
      if (!izbor) {
        v.innerHTML = '<span class="namig">Klikni del ali povleci čez več delov · meje med deli povleci za širino · ⋮ povleci za premik traku</span>';
        return;
      }
      const t = p.trakovi[izbor.v];
      if (izbor.tip === 'del') {
        const en = izbor.od === izbor.do, d = t.deli[izbor.od];
        const enakaBarva = t.deli.slice(izbor.od, izbor.do + 1).every(x => x.barva === d.barva);
        v.innerHTML = `
          ${en ? `<input class="vnos bm-oznaka" value="${ubezi(d.oznaka)}" placeholder="Oznaka: 15, ?, 1/3 …">`
               : `<span class="bm-stevec">${izbor.do - izbor.od + 1} deli</span>`}
          ${BARVE_TRAKOV.map(b => `<button class="bm-barva${enakaBarva && b === d.barva ? ' on' : ''}" data-barva="${b}" style="background:${b}" aria-label="Barva"></button>`).join('')}
          ${loc}
          ${en ? `<span class="bm-napis">Razdeli</span>${[2, 3, 4, 5].map(n => gumb('razdeli' + n, n, `Razdeli na ${n} enake dele`)).join('')}`
               : gumb('zdruzi', 'Združi', 'Združi v en del', 'gumb gumb-s')}
          ${loc}
          ${gumb('oklepajZgoraj', 'Oklepaj ↑', 'Oklepaj nad izbranim', 'gumb gumb-s')}
          ${gumb('oklepajSpodaj', 'Oklepaj ↓', 'Oklepaj pod izbranim', 'gumb gumb-s')}
          ${gumb('trakPod', 'Trak pod ↓', 'Nov trak, enako dolg kot izbrano, tik pod njim', 'gumb gumb-s')}
          ${gumb('brisiDele', 'Izbriši', 'Izbriši izbrane dele', 'gumb gumb-t bm-brisi')}`;
      } else if (izbor.tip === 'trak') {
        v.innerHTML = `
          <input class="vnos bm-oznaka" value="${ubezi(t.ime)}" placeholder="Ime traku (npr. Prej)">
          ${loc}${gumb('gor', '↑', 'Trak višje')}${gumb('dol', '↓', 'Trak nižje')}
          ${loc}${gumb('kopiraj', 'Podvoji', 'Podvoji trak', 'gumb gumb-s')}
          ${gumb('brisiTrak', 'Izbriši trak', '', 'gumb gumb-t bm-brisi')}
          <span class="namig">⋮ povleci levo ali desno za premik</span>`;
      } else {
        const o = t.oklepaji[izbor.o];
        v.innerHTML = `
          <input class="vnos bm-oznaka" value="${ubezi(o.oznaka)}" placeholder="Oznaka: 45, ?, 1. dan …">
          ${loc}<span class="bm-napis">Od</span>${gumb('odLevo', '◀', 'Začetek levo')}${gumb('odDesno', '▶', 'Začetek desno')}
          <span class="bm-napis">do</span>${gumb('doLevo', '◀', 'Konec levo')}${gumb('doDesno', '▶', 'Konec desno')}
          ${loc}${gumb('stran', o.stran === 'zgoraj' ? 'Pod trak ↓' : 'Nad trak ↑', 'Premakni na drugo stran', 'gumb gumb-s')}
          ${gumb('slog', o.slog === 'puscica' ? 'Oklepaj' : 'Puščica ↔', 'Zamenjaj obliko', 'gumb gumb-s')}
          ${gumb('brisiOklepaj', 'Izbriši', 'Izbriši oklepaj', 'gumb gumb-t bm-brisi')}`;
      }

      const vnos = v.querySelector('.bm-oznaka');
      if (!vnos) return;
      vnos.addEventListener('input', () => {
        if (izbor.tip === 'del') t.deli[izbor.od].oznaka = vnos.value;
        else if (izbor.tip === 'trak') t.ime = vnos.value;
        else t.oklepaji[izbor.o].oznaka = vnos.value;
        shrani(); risi();
      });
      vnos.addEventListener('keydown', e => {
        if (e.key === 'Enter') vnos.blur();
        // Tab: naslednji del — oznake vpišeš po vrsti, brez miške
        if (e.key === 'Tab' && izbor.tip === 'del') {
          e.preventDefault();
          let { v: vi, od: di } = izbor;
          di += e.shiftKey ? -1 : 1;
          if (di >= p.trakovi[vi].deli.length) { vi = (vi + 1) % p.trakovi.length; di = 0; }
          if (di < 0) { vi = (vi - 1 + p.trakovi.length) % p.trakovi.length; di = p.trakovi[vi].deli.length - 1; }
          izberi({ tip: 'del', v: vi, od: di, do: di });
        }
      });
    }

    const izberi = (novo, fokus = true) => {
      izbor = novo;
      risi(); orodja();
      if (fokus && izbor) { const i = $t('.bm-oznaka'); i?.focus(); i?.select(); }
    };

    /* ---------------- dejanja ---------------- */

    /* Ob vstavljanju, brisanju ali združevanju delov oklepaji ostanejo nad pravimi deli. */
    /** k novih delov za delom i; razsiri: oklepaj, ki se konča pri i, zajame tudi nove (razdelitev). */
    const vstaviOklepaje = (t, i, k, razsiri) => t.oklepaji.forEach(o => {
      if (o.od > i) o.od += k;
      if (o.do > i || (razsiri && o.do === i)) o.do += k;
    });
    const odstraniOklepaje = (t, i) => {
      t.oklepaji = t.oklepaji.filter(o => !(o.od === i && o.do === i));
      t.oklepaji.forEach(o => { if (o.od > i) o.od--; if (o.do >= i) o.do--; });
      t.oklepaji = t.oklepaji.filter(o => o.do >= o.od);
    };
    /** Del i se zlije z delom i-1. */
    const zlijOklepaje = (t, i) => t.oklepaji.forEach(o => { if (o.od >= i) o.od--; if (o.do >= i) o.do--; });

    const izbraniTrak = () => p.trakovi[izbor.v];
    const izbranOklepaj = () => izbraniTrak().oklepaji[izbor.o];

    const dejanja = {
      zdruzi: () => {
        const t = izbraniTrak();
        for (let k = izbor.do; k > izbor.od; k--) {
          t.deli[k - 1].w = zaokrozi(t.deli[k - 1].w + t.deli[k].w);
          if (!t.deli[k - 1].oznaka) t.deli[k - 1].oznaka = t.deli[k].oznaka;
          t.deli.splice(k, 1);
          zlijOklepaje(t, k);
        }
        izbor = { ...izbor, do: izbor.od };
      },
      oklepajZgoraj: () => { const t = izbraniTrak(); t.oklepaji.push(oklepaj(izbor.od, izbor.do, '?', 'zgoraj')); izbor = { tip: 'oklepaj', v: izbor.v, o: t.oklepaji.length - 1 }; },
      oklepajSpodaj: () => { const t = izbraniTrak(); t.oklepaji.push(oklepaj(izbor.od, izbor.do, '?', 'spodaj')); izbor = { tip: 'oklepaj', v: izbor.v, o: t.oklepaji.length - 1 }; },
      trakPod: () => {
        const t = izbraniTrak();
        const nov = trak([del(zaokrozi(vsota(t, izbor.od, izbor.do)), '', naslednjaBarva(t))], [], '',
                         zaokrozi(t.zamik + vsota(t, 0, izbor.od - 1)));
        p.trakovi.splice(izbor.v + 1, 0, nov);
        izbor = { tip: 'del', v: izbor.v + 1, od: 0, do: 0 };
      },
      brisiDele: () => {
        const t = izbraniTrak();
        if (izbor.do - izbor.od + 1 >= t.deli.length) {
          if (p.trakovi.length === 1) { obvesti('Model potrebuje vsaj en trak.'); return false; }
          p.trakovi.splice(izbor.v, 1); izbor = null; return;
        }
        for (let k = izbor.do; k >= izbor.od; k--) { t.deli.splice(k, 1); odstraniOklepaje(t, k); }
        izbor = null;
      },

      gor: () => {
        if (izbor.v === 0) return false;
        [p.trakovi[izbor.v - 1], p.trakovi[izbor.v]] = [p.trakovi[izbor.v], p.trakovi[izbor.v - 1]];
        izbor = { ...izbor, v: izbor.v - 1 };
      },
      dol: () => {
        if (izbor.v === p.trakovi.length - 1) return false;
        [p.trakovi[izbor.v + 1], p.trakovi[izbor.v]] = [p.trakovi[izbor.v], p.trakovi[izbor.v + 1]];
        izbor = { ...izbor, v: izbor.v + 1 };
      },
      kopiraj: () => { p.trakovi.splice(izbor.v + 1, 0, JSON.parse(JSON.stringify(izbraniTrak()))); izbor = { tip: 'trak', v: izbor.v + 1 }; },
      brisiTrak: () => {
        if (p.trakovi.length === 1) { obvesti('Model potrebuje vsaj en trak.'); return false; }
        p.trakovi.splice(izbor.v, 1); izbor = null;
      },

      odLevo:  () => { const o = izbranOklepaj(); if (o.od > 0) o.od--; },
      odDesno: () => { const o = izbranOklepaj(); if (o.od < o.do) o.od++; },
      doLevo:  () => { const o = izbranOklepaj(); if (o.do > o.od) o.do--; },
      doDesno: () => { const o = izbranOklepaj(); if (o.do < izbraniTrak().deli.length - 1) o.do++; },
      stran:   () => { const o = izbranOklepaj(); o.stran = o.stran === 'zgoraj' ? 'spodaj' : 'zgoraj'; },
      slog:    () => { const o = izbranOklepaj(); o.slog = o.slog === 'puscica' ? 'oklepaj' : 'puscica'; },
      brisiOklepaj: () => { izbraniTrak().oklepaji.splice(izbor.o, 1); izbor = null; },
    };
    [2, 3, 4, 5].forEach(n => {
      dejanja['razdeli' + n] = () => {
        const t = izbraniTrak(), d = t.deli[izbor.od];
        t.deli.splice(izbor.od, 1, ...Array.from({ length: n }, () => del(zaokrozi(d.w / n), '', d.barva)));
        vstaviOklepaje(t, izbor.od, n - 1, true);
        // oznaka celote ("? kg") ostane kot oklepaj nad novimi deli
        if (d.oznaka.trim()) t.oklepaji.push(oklepaj(izbor.od, izbor.od + n - 1, d.oznaka, 'zgoraj'));
      };
    });

    /* ---------------- vlečenje in izbira na modelu ---------------- */

    model.addEventListener('pointerdown', e => {
      if (!p.urejam || e.button > 0 || e.target.closest('.bm-plus')) return;
      const meja = e.target.closest('.bm-meja');
      const rocaj = e.target.closest('.bm-rocaj-traku');
      const d = e.target.closest('.bm-del');

      if (meja) {
        const vi = +meja.dataset.v, i = +meja.dataset.i, t = p.trakovi[vi];
        vlecenje = { tip: 'meja', v: vi, i, x0: e.clientX, u: merilo, wL: t.deli[i].w, wR: t.deli[i + 1]?.w };
      } else if (rocaj) {
        const vi = +rocaj.dataset.v;
        vlecenje = { tip: 'trak', v: vi, x0: e.clientX, u: merilo, z0: p.trakovi[vi].zamik, premik: false };
      } else if (d) {
        const vi = +d.dataset.v, di = +d.dataset.d;
        vlecenje = { tip: 'izbira', v: vi, zac: di };
        izbor = { tip: 'del', v: vi, od: di, do: di };
        risi();
      } else {
        const o = e.target.closest('.bm-oklepaj'), ime = e.target.closest('.bm-ime');
        if (o) izberi({ tip: 'oklepaj', v: +o.dataset.v, o: +o.dataset.o });
        else if (ime) izberi({ tip: 'trak', v: +ime.dataset.v });
        else izberi(null);
        return;
      }
      e.preventDefault();
      try { model.setPointerCapture(e.pointerId); } catch (_) {}
    });

    model.addEventListener('pointermove', e => {
      if (!vlecenje) return;
      const t = p.trakovi[vlecenje.v];

      if (vlecenje.tip === 'meja') {
        const { i, wL, wR, u } = vlecenje;
        const notranja = wR !== undefined;
        const zac = t.zamik + vsota(t, 0, i - 1);
        const omeji = w => notranja ? Math.min(Math.max(NAJMANJ_DEL, w), wL + wR - NAJMANJ_DEL) : Math.max(NAJMANJ_DEL, w);
        let w = omeji(wL + (e.clientX - vlecenje.x0) / u);
        const c = prilepi(vlecenje.v, zac + w);
        vodilo = null;
        if (c !== null && omeji(c - zac) === c - zac) { w = c - zac; vodilo = c; }
        t.deli[i].w = zaokrozi(w);
        if (notranja) t.deli[i + 1].w = zaokrozi(wL + wR - w);
        risi();
      } else if (vlecenje.tip === 'trak') {
        const dx = e.clientX - vlecenje.x0;
        if (Math.abs(dx) > 4) vlecenje.premik = true;
        if (!vlecenje.premik) return;
        let z = Math.max(0, vlecenje.z0 + dx / vlecenje.u);
        // prilepi začetek ali konec traku na meje drugih trakov
        const dolzina = vsota(t);
        const cz = prilepi(vlecenje.v, z), ck = prilepi(vlecenje.v, z + dolzina);
        vodilo = null;
        if (cz !== null) { z = cz; vodilo = cz; }
        else if (ck !== null && ck - dolzina >= 0) { z = ck - dolzina; vodilo = ck; }
        t.zamik = zaokrozi(z);
        risi();
      } else {
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('.bm-del');
        if (!el || +el.dataset.v !== vlecenje.v) return;
        const di = +el.dataset.d;
        const od = Math.min(vlecenje.zac, di), doo = Math.max(vlecenje.zac, di);
        if (od !== izbor.od || doo !== izbor.do) { izbor = { ...izbor, od, do: doo }; risi(); }
      }
    });

    const koncajVlecenje = e => {
      if (!vlecenje) return;
      const v = vlecenje;
      vlecenje = null; vodilo = null;
      try { model.releasePointerCapture(e.pointerId); } catch (_) {}
      if (v.tip === 'trak' && !v.premik) { izberi({ tip: 'trak', v: v.v }); return; }
      if (v.tip === 'izbira') { izberi(izbor, izbor.od === izbor.do); return; }
      shrani(); risi();
    };
    model.addEventListener('pointerup', koncajVlecenje);
    model.addEventListener('pointercancel', koncajVlecenje);

    model.addEventListener('click', e => {
      const plus = e.target.closest('.bm-plus');
      if (!plus || !p.urejam) return;
      const vi = +plus.dataset.v, t = p.trakovi[vi];
      t.deli.push(del(t.deli.at(-1)?.w || 1, '', naslednjaBarva(t)));
      shrani(); izberi({ tip: 'del', v: vi, od: t.deli.length - 1, do: t.deli.length - 1 });
    });

    /* ---------------- orodna vrstica ---------------- */

    $t('.bm-izbor').addEventListener('click', e => {
      const b = e.target.closest('[data-a], [data-barva]');
      if (!b || !izbor) return;
      if (b.dataset.barva) {
        izbraniTrak().deli.slice(izbor.od, izbor.do + 1).forEach(d => d.barva = b.dataset.barva);
      } else if (dejanja[b.dataset.a]?.() === false) return;
      // po novem traku, oklepaju ali združitvi takoj vpišeš oznako
      shrani(); izberi(izbor, ['trakPod', 'oklepajZgoraj', 'oklepajSpodaj', 'zdruzi'].includes(b.dataset.a));
    });

    $t('.bm-dodaj-trak').addEventListener('click', () => {
      const konec = Math.max(1, ...p.trakovi.map(t => t.zamik + vsota(t)));
      p.trakovi.push(trak([del(zaokrozi(konec), '', '#29B6E0')]));
      shrani(); izberi({ tip: 'del', v: p.trakovi.length - 1, od: 0, do: 0 });
    });
    $t('.bm-predloga').addEventListener('change', e => {
      const k = e.target.value;
      e.target.value = '';
      if (!k) return;
      const nov = PREDLOGE_TRAKOV[k].model();
      p.trakovi = nov.trakovi; p.racun = nov.racun; p.pokaziRacun = !!nov.pokaziRacun;
      racun.textContent = p.racun;
      shrani(); izberi(null);
    });
    $t('.bm-racun-gumb').addEventListener('click', () => { p.pokaziRacun = !p.pokaziRacun; shrani(); risi(); });
    telo.querySelectorAll('.a-pisava').forEach(b => b.addEventListener('click', () => {
      p.pisava = Math.round(Math.min(2.6, Math.max(0.7, p.pisava + b.dataset.d * 0.15)) * 100) / 100;
      shrani(); risi();
    }));
    $t('.bm-koncano').addEventListener('click', () => { p.urejam = false; shrani(); izberi(null); });
    $t('.bm-uredi').addEventListener('click', () => { p.urejam = true; shrani(); izberi(null); });

    // merilo se prilagodi širini okna
    new ResizeObserver(() => { if (!vlecenje && model.clientWidth !== zadnjaSirina) risi(); }).observe(model);
    risi(); orodja();
  },
});
