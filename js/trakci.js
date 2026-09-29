/* =====================================================================
   Razredni zaslon — Trakci (tračni modeli, singapurska metoda)
   Trakovi iz delov, oklepaji z oznakami nad in pod deli, več trakov
   drug pod drugim (npr. "prej" in "potem") in stolpec za račun.
   Širine delov so v enotah — vsi trakovi imajo isto merilo, zato se
   spodnji trak lahko poravna pod dele zgornjega.
   ===================================================================== */
'use strict';

const BARVE_TRAKOV = ['#F9A65A', '#F47C7C', '#29B6E0', '#9B7BD0', '#7CC576', '#F7D154', '#F48FB1', '#FFFFFF'];

/** Na svetli barvi temno besedilo, na temni belo. */
function jeSvetla(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 165;
}

const del = (w, oznaka = '', barva = BARVE_TRAKOV[0]) => ({ w, oznaka, barva });
const oklepaj = (od, doo, oznaka, stran = 'zgoraj', slog = 'oklepaj') => ({ od, do: doo, oznaka, stran, slog });

const PREDLOGE_TRAKOV = {
  delcelota: {
    ime: 'Del + del = celota',
    model: () => ({
      // celota je svoj pravokotnik pod deli, enako dolg kot vsi deli skupaj
      trakovi: [
        { ime: '', zamik: 0, deli: [del(3, 'Del', '#F9A65A'), del(2, 'Del', '#F47C7C')], oklepaji: [] },
        { ime: '', zamik: 0, deli: [del(5, 'Celota', '#29B6E0')], oklepaji: [] },
      ],
      racun: '',
    }),
  },
  primerjava: {
    ime: 'Primerjava',
    model: () => ({
      trakovi: [
        { ime: 'Ana', zamik: 0, deli: [del(5, '20', '#29B6E0')], oklepaji: [] },
        { ime: 'Bor', zamik: 0, deli: [del(2, '8', '#9B7BD0'), del(3, '?', '#FFFFFF')],
          oklepaji: [oklepaj(1, 1, 'razlika', 'spodaj')] },
      ],
      racun: '20 − 8 = 12',
    }),
  },
  enaki: {
    ime: 'Enaki deli',
    model: () => ({
      trakovi: [{ ime: '', zamik: 0, deli: Array.from({ length: 4 }, () => del(1, '5', '#7CC576')),
                  oklepaji: [oklepaj(0, 3, '?', 'zgoraj')] }],
      racun: '4 · 5 = 20',
    }),
  },
  prejpotem: {
    ime: 'Prej in potem',
    model: () => ({
      trakovi: [
        { ime: 'Prej', zamik: 0, deli: [del(15, '15', '#F48FB1'), del(15, '15', '#F48FB1'), del(15, '15', '#F48FB1')],
          oklepaji: [oklepaj(0, 2, '45', 'zgoraj'), oklepaj(0, 0, 'ostanek', 'spodaj'), oklepaj(1, 2, 'sestra', 'spodaj')] },
        { ime: 'Potem', zamik: 0, deli: Array.from({ length: 5 }, () => del(3, '3', '#F48FB1')),
          oklepaji: [oklepaj(0, 2, 'pojedel', 'spodaj'), oklepaj(3, 4, 'ostalo', 'spodaj')] },
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
  velikost: [720, 430],

  izris(telo, zapis) {
    const p = zapis.podatki;
    if (!p.trakovi) Object.assign(p, PREDLOGE_TRAKOV.delcelota.model());
    p.pisava = p.pisava || 1;
    if (p.urejam === undefined) p.urejam = true;
    let izbor = null;          // {tip:'del'|'trak'|'oklepaj', v, d|o}

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
    const vsota = t => t.deli.reduce((s, d) => s + d.w, 0);
    const naslednjaBarva = t => BARVE_TRAKOV[(BARVE_TRAKOV.indexOf(t.deli.at(-1)?.barva) + 1) % BARVE_TRAKOV.length];

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
      const konec = Math.max(1, ...p.trakovi.map(t => t.zamik + vsota(t)));
      zadnjaSirina = model.clientWidth;
      const u = Math.max(2, (model.clientWidth - imeW - 70) / konec);   // px na enoto
      const visinaRavni = Math.round(44 * p.pisava);

      model.innerHTML = p.trakovi.map((t, vi) => {
        const meje = [t.zamik];
        t.deli.forEach(d => meje.push(meje.at(-1) + d.w));

        const oklepaji = stran => {
          const seznam = t.oklepaji.map((o, oi) => ({ ...o, oi })).filter(o => o.stran === stran)
            .sort((a, b) => (a.do - a.od) - (b.do - b.od));
          if (!seznam.length) return '';
          // krajši oklepaji bližje traku, daljši nad (pod) njimi — da se ne prekrivajo
          const ravni = [];
          const html = seznam.map(o => {
            const od = Math.max(0, Math.min(o.od, t.deli.length - 1));
            const doo = Math.max(od, Math.min(o.do, t.deli.length - 1));
            const x1 = meje[od] * u, x2 = meje[doo + 1] * u;
            // zaseden je tudi prostor oznake, ki je lahko širša od oklepaja
            const pol = Math.max(x2 - x1, o.oznaka.length * 9 * p.pisava + 14) / 2;
            const a1 = (x1 + x2) / 2 - pol, a2 = (x1 + x2) / 2 + pol;
            let L = 0;
            while ((ravni[L] || []).some(([a, b]) => a1 < b - 1 && a2 > a + 1)) L++;
            (ravni[L] = ravni[L] || []).push([a1, a2]);
            const W = Math.max(8, x2 - x1);
            const izbran = izbor?.tip === 'oklepaj' && izbor.v === vi && izbor.o === o.oi;
            const svg = `<svg width="${W}" height="14" viewBox="0 0 ${W} 14" aria-hidden="true">
                           <path d="${potOklepaja(W, o.slog)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
            const oznaka = `<span class="bm-ok-oznaka">${ubezi(o.oznaka)}</span>`;
            return `<div class="bm-oklepaj${izbran ? ' izbran' : ''}" data-v="${vi}" data-o="${o.oi}"
                         style="left:${x1}px;width:${W}px;${stran === 'zgoraj' ? 'bottom' : 'top'}:${L * visinaRavni}px">
                      ${stran === 'zgoraj' ? oznaka + svg : svg + oznaka}</div>`;
          }).join('');
          return `<div class="bm-oklepaji ${stran}" style="height:${ravni.length * visinaRavni}px">${html}</div>`;
        };

        const deli = t.deli.map((d, di) => {
          const izbran = izbor?.tip === 'del' && izbor.v === vi && izbor.d === di;
          return `<div class="bm-del${izbran ? ' izbran' : ''}" data-v="${vi}" data-d="${di}"
                       style="width:${d.w * u}px;background:${d.barva};color:${jeSvetla(d.barva) ? '#23262F' : '#fff'}">
                    <span>${ubezi(d.oznaka)}</span></div>`;
        }).join('');

        const izbranTrak = izbor?.tip === 'trak' && izbor.v === vi;
        return `<div class="bm-vrsta${izbranTrak ? ' izbran' : ''}" style="grid-template-columns:${imeW}px 1fr">
                  <div class="bm-ime" data-v="${vi}">${ubezi(t.ime)}</div>
                  ${oklepaji('zgoraj')}
                  <div class="bm-trak" style="margin-left:${t.zamik * u}px">
                    ${deli}
                    <button class="bm-plus" data-v="${vi}" title="Dodaj del" aria-label="Dodaj del">+</button>
                    ${t.ime ? '' : `<button class="bm-rocaj-traku" data-v="${vi}" title="Uredi trak" aria-label="Uredi trak">⋮</button>`}
                  </div>
                  ${oklepaji('spodaj')}
                </div>`;
      }).join('');
    }

    /* ---------------- orodna vrstica za izbrano ---------------- */

    const gumb = (akcija, besedilo, naslov = '', razred = 'mini') =>
      `<button class="${razred}" data-a="${akcija}"${naslov ? ` title="${naslov}" aria-label="${naslov}"` : ''}>${besedilo}</button>`;
    const loc = '<span class="bm-loc"></span>';

    function orodja() {
      const v = $t('.bm-izbor');
      if (!izbor) {
        v.innerHTML = '<span class="namig">Klikni del, oklepaj ali ime traku (⋮), da ga urediš. + na koncu traku doda del.</span>';
        return;
      }
      const t = p.trakovi[izbor.v];
      if (izbor.tip === 'del') {
        const d = t.deli[izbor.d];
        v.innerHTML = `
          <input class="vnos bm-oznaka" value="${ubezi(d.oznaka)}" placeholder="Oznaka (15, ?, …)">
          ${BARVE_TRAKOV.map(b => `<button class="bm-barva${b === d.barva ? ' on' : ''}" data-barva="${b}" style="background:${b}" aria-label="Barva"></button>`).join('')}
          ${loc}<span class="bm-napis">Širina</span>${gumb('ozje', '−', 'Ožje')}${gumb('sirse', '+', 'Širše')}
          ${loc}<span class="bm-napis">Razdeli</span>${[2, 3, 4, 5].map(n => gumb('razdeli' + n, n, `Razdeli na ${n} enake dele`)).join('')}
          ${loc}${gumb('dodajDel', '+ del', 'Dodaj del desno', 'gumb gumb-s')}
          ${gumb('oklepajZgoraj', 'Oklepaj ↑', 'Oklepaj nad delom', 'gumb gumb-s')}
          ${gumb('oklepajSpodaj', 'Oklepaj ↓', 'Oklepaj pod delom', 'gumb gumb-s')}
          ${gumb('brisiDel', 'Izbriši', 'Izbriši del', 'gumb gumb-t bm-brisi')}`;
      } else if (izbor.tip === 'trak') {
        v.innerHTML = `
          <input class="vnos bm-oznaka" value="${ubezi(t.ime)}" placeholder="Ime traku (npr. Prej)">
          ${loc}<span class="bm-napis">Začetek</span>${gumb('zamikLevo', '◀', 'Premakni levo')}${gumb('zamikDesno', '▶', 'Premakni desno')}
          ${loc}${gumb('gor', '↑', 'Trak višje')}${gumb('dol', '↓', 'Trak nižje')}
          ${loc}${gumb('dodajDelTrak', '+ del', 'Dodaj del na konec', 'gumb gumb-s')}
          ${gumb('kopiraj', 'Podvoji', 'Podvoji trak', 'gumb gumb-s')}
          ${gumb('brisiTrak', 'Izbriši trak', '', 'gumb gumb-t bm-brisi')}`;
      } else {
        const o = t.oklepaji[izbor.o];
        v.innerHTML = `
          <input class="vnos bm-oznaka" value="${ubezi(o.oznaka)}" placeholder="Oznaka (45, ?, sestra …)">
          ${loc}<span class="bm-napis">Začetek</span>${gumb('odLevo', '◀', 'Začetek levo')}${gumb('odDesno', '▶', 'Začetek desno')}
          ${loc}<span class="bm-napis">Konec</span>${gumb('doLevo', '◀', 'Konec levo')}${gumb('doDesno', '▶', 'Konec desno')}
          ${loc}${gumb('stran', o.stran === 'zgoraj' ? 'Pod trak ↓' : 'Nad trak ↑', 'Premakni na drugo stran', 'gumb gumb-s')}
          ${gumb('slog', o.slog === 'puscica' ? 'Oklepaj' : 'Puščica ↔', 'Zamenjaj obliko', 'gumb gumb-s')}
          ${gumb('brisiOklepaj', 'Izbriši', 'Izbriši oklepaj', 'gumb gumb-t bm-brisi')}`;
      }

      const vnos = v.querySelector('.bm-oznaka');
      vnos.addEventListener('input', () => {
        if (izbor.tip === 'del') t.deli[izbor.d].oznaka = vnos.value;
        else if (izbor.tip === 'trak') t.ime = vnos.value;
        else t.oklepaji[izbor.o].oznaka = vnos.value;
        shrani(); risi();
      });
      vnos.addEventListener('keydown', e => { if (e.key === 'Enter') vnos.blur(); });
    }

    const izberi = (novo, fokus = true) => {
      izbor = novo;
      risi(); orodja();
      if (fokus && izbor) { const i = $t('.bm-oznaka'); i?.focus(); i?.select(); }
    };

    /* ---------------- dejanja ---------------- */

    /* Ob vstavljanju ali brisanju delov oklepaji ostanejo nad pravimi deli. */
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

    /** Meje vseh drugih trakov — trak se ob premiku ustavi pod njimi. */
    const meje = vi => {
      const m = new Set([0]);
      p.trakovi.forEach((t, i) => {
        if (i === vi) return;
        let x = t.zamik; m.add(x);
        t.deli.forEach(d => { x += d.w; m.add(Math.round(x * 1000) / 1000); });
      });
      return [...m].sort((a, b) => a - b);
    };

    const dejanja = {
      ozje:  () => { const d = p.trakovi[izbor.v].deli[izbor.d]; d.w = Math.max(0.5, Math.round((d.w - 1) * 100) / 100); },
      sirse: () => { const d = p.trakovi[izbor.v].deli[izbor.d]; d.w = Math.round((d.w + 1) * 100) / 100; },
      dodajDel: () => {
        const t = p.trakovi[izbor.v], d = t.deli[izbor.d];
        t.deli.splice(izbor.d + 1, 0, del(d.w, '', d.barva));
        vstaviOklepaje(t, izbor.d, 1, false);
        izbor = { ...izbor, d: izbor.d + 1 };
      },
      brisiDel: () => {
        const t = p.trakovi[izbor.v];
        if (t.deli.length === 1) { obvesti('Trak ima samo en del — izbriši raje cel trak.'); return false; }
        t.deli.splice(izbor.d, 1);
        odstraniOklepaje(t, izbor.d);
        izbor = null;
      },
      oklepajZgoraj: () => { const t = p.trakovi[izbor.v]; t.oklepaji.push(oklepaj(izbor.d, izbor.d, '?', 'zgoraj')); izbor = { tip: 'oklepaj', v: izbor.v, o: t.oklepaji.length - 1 }; },
      oklepajSpodaj: () => { const t = p.trakovi[izbor.v]; t.oklepaji.push(oklepaj(izbor.d, izbor.d, '?', 'spodaj')); izbor = { tip: 'oklepaj', v: izbor.v, o: t.oklepaji.length - 1 }; },

      zamikLevo: () => {
        const t = p.trakovi[izbor.v], m = meje(izbor.v).filter(x => x < t.zamik - 0.001);
        t.zamik = m.length ? m.at(-1) : Math.max(0, t.zamik - 1);
      },
      zamikDesno: () => {
        const t = p.trakovi[izbor.v], m = meje(izbor.v).find(x => x > t.zamik + 0.001);
        t.zamik = m ?? t.zamik + 1;
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
      dodajDelTrak: () => { const t = p.trakovi[izbor.v]; t.deli.push(del(t.deli.at(-1)?.w || 1, '', naslednjaBarva(t))); izbor = { tip: 'del', v: izbor.v, d: t.deli.length - 1 }; },
      kopiraj: () => { p.trakovi.splice(izbor.v + 1, 0, JSON.parse(JSON.stringify(p.trakovi[izbor.v]))); izbor = { tip: 'trak', v: izbor.v + 1 }; },
      brisiTrak: () => {
        if (p.trakovi.length === 1) { obvesti('Model potrebuje vsaj en trak.'); return false; }
        p.trakovi.splice(izbor.v, 1); izbor = null;
      },

      odLevo:  () => { const o = p.trakovi[izbor.v].oklepaji[izbor.o]; if (o.od > 0) o.od--; },
      odDesno: () => { const o = p.trakovi[izbor.v].oklepaji[izbor.o]; if (o.od < o.do) o.od++; },
      doLevo:  () => { const o = p.trakovi[izbor.v].oklepaji[izbor.o]; if (o.do > o.od) o.do--; },
      doDesno: () => { const t = p.trakovi[izbor.v], o = t.oklepaji[izbor.o]; if (o.do < t.deli.length - 1) o.do++; },
      stran:   () => { const o = p.trakovi[izbor.v].oklepaji[izbor.o]; o.stran = o.stran === 'zgoraj' ? 'spodaj' : 'zgoraj'; },
      slog:    () => { const o = p.trakovi[izbor.v].oklepaji[izbor.o]; o.slog = o.slog === 'puscica' ? 'oklepaj' : 'puscica'; },
      brisiOklepaj: () => { p.trakovi[izbor.v].oklepaji.splice(izbor.o, 1); izbor = null; },
    };
    [2, 3, 4, 5].forEach(n => {
      dejanja['razdeli' + n] = () => {
        const t = p.trakovi[izbor.v], d = t.deli[izbor.d];
        const w = Math.round(d.w / n * 1000) / 1000;
        t.deli.splice(izbor.d, 1, ...Array.from({ length: n }, () => del(w, '', d.barva)));
        vstaviOklepaje(t, izbor.d, n - 1, true);
      };
    });

    /* ---------------- dogodki ---------------- */

    $t('.bm-izbor').addEventListener('click', e => {
      const b = e.target.closest('[data-a], [data-barva]');
      if (!b || !izbor) return;
      if (b.dataset.barva) {
        p.trakovi[izbor.v].deli[izbor.d].barva = b.dataset.barva;
      } else if (dejanja[b.dataset.a]?.() === false) return;
      shrani(); izberi(izbor, false);
    });

    model.addEventListener('click', e => {
      if (!p.urejam) return;
      const plus = e.target.closest('.bm-plus');
      if (plus) {
        const t = p.trakovi[+plus.dataset.v];
        t.deli.push(del(t.deli.at(-1)?.w || 1, '', naslednjaBarva(t)));
        shrani(); izberi({ tip: 'del', v: +plus.dataset.v, d: t.deli.length - 1 });
        return;
      }
      const d = e.target.closest('.bm-del'), o = e.target.closest('.bm-oklepaj');
      const t = e.target.closest('.bm-ime, .bm-rocaj-traku');
      if (d) izberi({ tip: 'del', v: +d.dataset.v, d: +d.dataset.d });
      else if (o) izberi({ tip: 'oklepaj', v: +o.dataset.v, o: +o.dataset.o });
      else if (t) izberi({ tip: 'trak', v: +t.dataset.v });
      else izberi(null);
    });

    $t('.bm-dodaj-trak').addEventListener('click', () => {
      const konec = Math.max(1, ...p.trakovi.map(t => t.zamik + vsota(t)));
      p.trakovi.push({ ime: '', zamik: 0, deli: [del(konec, '', '#29B6E0')], oklepaji: [] });
      shrani(); izberi({ tip: 'del', v: p.trakovi.length - 1, d: 0 });
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
    new ResizeObserver(() => { if (model.clientWidth !== zadnjaSirina) risi(); }).observe(model);
    risi(); orodja();
  },
});
