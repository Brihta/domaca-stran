/* =====================================================================
   Razredni zaslon — Trakci (tračni modeli, singapurska metoda)
   Prosto platno, vse se ureja neposredno na modelu:
   · povleci po praznem platnu, da narišeš nov trak,
   · trak primeš za katerikoli del in ga prosto premakneš
     (prilepi se tik pod, nad ali ob druge trakove, brez razmika),
   · izbran del (ali več delov) primeš in ga odneseš iz traku kot svoj kos,
   · z Alt (⌥) povlečeš kopijo traku — ali izbranih delov — ven,
   · meje med deli in konca traku vlečeš za širino,
   · ves model premakneš naenkrat (gumb ✥, presledek ali srednji gumb miške)
     ali ga z ⊕ postaviš na sredino platna,
   · izbran trak ali del razdeliš na enake dele z enim klikom,
   · oznake na delih, ime traku in oklepaji z oznako nad ali pod deli;
     konce oklepaja vlečeš čez več trakov, oklepaj ob strani zajame trakove
     drug pod drugim.
   Koordinate so v enotah platna (širina = 1000), zato se model ob
   spremembi velikosti okna le sorazmerno poveča ali zmanjša.
   ===================================================================== */
'use strict';

const BARVE_TRAKOV = ['#29B6E0', '#F9A65A', '#F47C7C', '#9B7BD0', '#7CC576', '#F7D154', '#F48FB1', '#FFFFFF'];
const SIRINA_PLATNA = 1000;   // enot čez celo širino
const VISINA_TRAKU = 64;      // enot
const NAJMANJ_DEL = 8;        // najožji del v enotah
const LEPLJENJE_PX = 12;      // kako blizu mora biti rob, da se prilepi
const PRAG_PREMIKA = 5;       // px, preden klik postane vlečenje
const POVECAVA = [0.6, 3];    // najmanjša in največja povečava

/** Na svetli barvi temno besedilo, na temni belo. */
function jeSvetla(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.299 * (n >> 16) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) > 165;
}

/** "1/3 ostanka" -> ulomek s števcem nad imenovalcem. */
const oznakaHtml = s => ubezi(s).replace(/(\d+)\s*\/\s*(\d+)/g, '<span class="ulomek"><b>$1</b><i>$2</i></span>');

const zaokrozi = x => Math.round(x * 100) / 100;
const del = (w, oznaka = '', barva = BARVE_TRAKOV[0]) => ({ w, oznaka, barva });
const oklepaj = (od, doo, oznaka, stran = 'zgoraj') => ({ od, do: doo, oznaka, stran });
const dolzina = t => t.deli.reduce((s, d) => s + d.w, 0);

/** Zavit oklepaj (konici spodaj, vrh zgoraj) ali puščica ↔, širok W. */
function potOklepaja(W, slog) {
  const h = 14, s = h / 2;
  if (slog === 'puscica') {
    return `M1 ${s}H${W - 1}M1 ${s}l7 -5M1 ${s}l7 5M${W - 1} ${s}l-7 -5M${W - 1} ${s}l-7 5M1 1v${h - 2}M${W - 1} 1v${h - 2}`;
  }
  const r = Math.min(12, W / 4), m = W / 2;
  return `M1 ${h}Q1 ${s} ${1 + r} ${s}L${m - r} ${s}Q${m} ${s} ${m} 1Q${m} ${s} ${m + r} ${s}L${W - 1 - r} ${s}Q${W - 1} ${s} ${W - 1} ${h}`;
}

/** Modeli iz prejšnje različice (trakovi v vrstah, širine v enotah) -> prosto platno. */
function pretvoriStariModel(p) {
  const stari = p.trakovi || [];
  const konec = Math.max(1, ...stari.map(t => (t.zamik || 0) + dolzina(t)));
  const k = 740 / konec;
  let y = 30;
  p.trakovi = stari.map(t => {
    const ima = stran => (t.oklepaji || []).some(o => o.stran === stran);
    if (ima('zgoraj')) y += 50;
    const nov = {
      x: zaokrozi(180 + (t.zamik || 0) * k), y, ime: t.ime || '',
      deli: t.deli.map(d => del(zaokrozi(d.w * k), d.oznaka, d.barva)),
      oklepaji: (t.oklepaji || []).map(o => ({ ...o })),
    };
    y += VISINA_TRAKU + (ima('spodaj') ? 50 : 0);
    return nov;
  });
  ['racun', 'pokaziRacun', 'urejam', 'pisava'].forEach(k => delete p[k]);
  p.v = 2;
}

Platno.registriraj('trakci', {
  naslov: 'Trakci',
  velikost: [880, 500],
  celZaslon: true,

  izris(telo, zapis) {
    const p = zapis.podatki;
    if (p.v !== 2) { if (p.trakovi) pretvoriStariModel(p); else { p.trakovi = []; p.v = 2; } }

    let izbor = null;      // {tip:'del', v, od, do} | {tip:'trak', v} | {tip:'oklepaj', v, o}
    let vlecenje = null;
    let s = 1;             // px na enoto ob zadnjem izrisu
    let vodila = [];       // [{x}|{y}] v enotah — črte poravnave med vlečenjem
    let duh = null;        // trak, ki ga ravno rišeš: {x, y, w}
    let premikVse = false; // gumb ✥: vsako vlečenje premakne ves model
    let presledek = false; // drži presledek: enako, le začasno
    const zgodovina = [];

    telo.classList.add('bm');
    telo.innerHTML = `
      <div class="bm-izbor"></div>
      <div class="bm-platno"><div class="bm-svet" tabindex="-1"></div></div>
      <div class="bm-plavajoce">
        <button class="mini bm-vse" title="Premakni vse trakove (ali drži presledek)" aria-label="Premakni vse" aria-pressed="false">${ikona('premik')}</button>
        <button class="mini bm-sredina" title="Postavi na sredino" aria-label="Postavi na sredino">${ikona('sredina')}</button>
        <button class="mini" data-povecava="-1" title="Pomanjšaj" aria-label="Pomanjšaj">${ikona('minus')}</button>
        <button class="mini" data-povecava="1" title="Povečaj" aria-label="Povečaj">${ikona('plus')}</button>
        <button class="mini bm-razveljavi" title="Razveljavi (Ctrl+Z)" aria-label="Razveljavi">${ikona('ponastavi')}</button>
      </div>`;

    const $t = q => telo.querySelector(q);
    const platno = $t('.bm-platno');
    const svet = $t('.bm-svet');
    const shrani = () => shraniStanje();
    const zapomni = () => {
      zgodovina.push(JSON.stringify(p.trakovi));
      if (zgodovina.length > 80) zgodovina.shift();
    };

    /* ---------------- lepljenje ---------------- */

    /** Vse meje drugih trakov (v enotah) — nanje se lepijo robovi. */
    const mejeX = razen => {
      const m = [];
      p.trakovi.forEach((t, i) => {
        if (i === razen) return;
        let x = t.x; m.push(x);
        t.deli.forEach(d => { x += d.w; m.push(x); });
      });
      return m;
    };
    /** Vrh traku se prilepi: v isto vrsto, tik pod ali tik nad drug trak. */
    const vrhoviY = razen => p.trakovi.flatMap((t, i) => i === razen ? [] : [t.y, t.y + VISINA_TRAKU, t.y - VISINA_TRAKU]);
    const najblizje = (kandidati, vr) => {
      let naj = null;
      for (const c of kandidati) {
        if (Math.abs(c - vr) * s < LEPLJENJE_PX && (naj === null || Math.abs(c - vr) < Math.abs(naj - vr))) naj = c;
      }
      return naj;
    };

    /* ---------------- oklepaji ---------------- */

    const mejeTraku = t => { const m = [t.x]; t.deli.forEach(d => m.push(m.at(-1) + d.w)); return m; };
    /** Vodoraven oklepaj: od/do sta dela lastnega traku; ko konec vlečeš na drug trak,
        sta x1/x2 odmika od začetka lastnega traku (oklepaj gre s trakom, ko ga premakneš). */
    const konci = (t, o) => {
      if (o.x1 !== undefined) return [t.x + o.x1, t.x + o.x2];
      const m = mejeTraku(t);
      const od = Math.max(0, Math.min(o.od, t.deli.length - 1));
      const doo = Math.max(od, Math.min(o.do, t.deli.length - 1));
      return [m[od], m[doo + 1]];
    };
    /** Oklepaj ob strani: [vrh, dno, x] v enotah; privzeto ob lastnem traku. */
    const konciOb = (t, o) => [t.y + (o.y1 ?? 0), t.y + (o.y2 ?? VISINA_TRAKU), t.x + (o.xr ?? dolzina(t))];
    /** Oklepaj ob strani stoji desno od najdaljšega traku, ki ga zajame. */
    function postaviOb(t, o) {
      const [y1, y2] = konciOb(t, o);
      const desni = p.trakovi.filter(tr => tr.y < y2 - 1 && tr.y + VISINA_TRAKU > y1 + 1).map(tr => tr.x + dolzina(tr));
      o.xr = zaokrozi(Math.max(t.x + dolzina(t), ...desni) - t.x);
    }

    /* ---------------- izris ---------------- */

    function risi() {
      s = Math.max(0.25, platno.clientWidth / SIRINA_PLATNA) * (p.povecava || 1);
      const H = VISINA_TRAKU * s;
      const pisavaOk = Math.max(11, 19 * s);
      const ravnina = Math.round(pisavaOk * 1.35 + 20);   // višina ene vrste oklepajev
      let html = '';
      let desno = 0, spodaj = 0;

      p.trakovi.forEach((t, vi) => {
        const meje = [t.x];
        t.deli.forEach(d => meje.push(meje.at(-1) + d.w));
        const izbranTrak = izbor?.v === vi && izbor.tip === 'trak';
        const vIzboru = di => izbor?.tip === 'del' && izbor.v === vi && di >= izbor.od && di <= izbor.do;
        desno = Math.max(desno, meje.at(-1));
        let globinaSpodaj = 0;

        // v ozkem delu se pisava zmanjša, da oznaka ostane cela
        const osnova = Math.max(11, 24 * s);
        const pisavaDela = d => {
          const znaki = d.oznaka.replace(/(\d+)\s*\/\s*(\d+)/g, (_, a, b) => a.length > b.length ? a : b).length;
          return znaki ? Math.max(9, Math.min(osnova, (d.w * s - 8) / (0.62 * znaki))) : osnova;
        };
        const deli = t.deli.map((d, di) =>
          `<div class="bm-del${vIzboru(di) ? ' izbran' : ''}" data-v="${vi}" data-d="${di}"
                style="width:${d.w * s}px;font-size:${pisavaDela(d).toFixed(1)}px;background:${d.barva};color:${jeSvetla(d.barva) ? '#23262F' : '#fff'}">
             <span>${oznakaHtml(d.oznaka)}</span></div>`).join('');
        // ročice za vlečenje: levi rob (-1), meje med deli in desni rob
        const rocaji = meje.map((m, i) =>
          `<div class="bm-meja${i === 0 || i === meje.length - 1 ? ' rob' : ''}" data-v="${vi}" data-i="${i - 1}"
                style="left:${(m - t.x) * s}px" title="Povleci za širino"></div>`).join('');

        html += `<div class="bm-trak${izbranTrak ? ' izbran' : ''}" style="left:${t.x * s}px;top:${t.y * s}px;height:${H}px">
                   ${deli}${rocaji}</div>`;
        if (t.ime) {
          html += `<div class="bm-ime" data-v="${vi}" style="left:${t.x * s - 170}px;top:${t.y * s}px;height:${H}px;font-size:${Math.max(11, 18 * s)}px">
                     <span>${ubezi(t.ime)}</span></div>`;
        }

        // oklepaj ob strani: navpičen, zajame trakove drug pod drugim
        t.oklepaji.forEach((o, oi) => {
          if (o.stran !== 'desno') return;
          const [y1, y2, xr] = konciOb(t, o);
          const Hh = Math.max(8, (y2 - y1) * s);
          const izbran = izbor?.tip === 'oklepaj' && izbor.v === vi && izbor.o === oi;
          const robova = izbran
            ? `<i class="bm-ok-rob" data-konec="od" style="top:-7px"></i><i class="bm-ok-rob" data-konec="do" style="top:${Hh - 7}px"></i>`
            : '';
          html += `<div class="bm-oklepaj desno${izbran ? ' izbran' : ''}" data-v="${vi}" data-o="${oi}"
                        style="left:${xr * s + 4}px;top:${y1 * s}px;height:${Hh}px">
                     <svg width="14" height="${Hh}" viewBox="0 0 14 ${Hh}" aria-hidden="true">
                       <path transform="matrix(0 1 -1 0 14 0)" d="${potOklepaja(Hh, o.slog)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                     <span class="bm-ok-oznaka" style="font-size:${pisavaOk}px">${oznakaHtml(o.oznaka)}</span>${robova}</div>`;
          desno = Math.max(desno, xr + (o.oznaka.length * pisavaOk * 0.6 + 40) / s);
          spodaj = Math.max(spodaj, y2 * s);
        });

        // oklepaji: krajši bližje traku; ki bi se prekrivali, gredo v novo vrsto
        ['zgoraj', 'spodaj'].forEach(stran => {
          const ravni = [];
          t.oklepaji.map((o, oi) => ({ ...o, oi })).filter(o => o.stran === stran)
            .sort((a, b) => (a.do - a.od) - (b.do - b.od))
            .forEach(o => {
              const [a, b] = konci(t, o);
              const x1 = a * s, x2 = b * s;
              desno = Math.max(desno, b);
              const pol = Math.max(x2 - x1, o.oznaka.length * pisavaOk * 0.6 + 14) / 2;
              const a1 = (x1 + x2) / 2 - pol, a2 = (x1 + x2) / 2 + pol;
              let L = 0;
              while ((ravni[L] || []).some(([a, b]) => a1 < b - 1 && a2 > a + 1)) L++;
              (ravni[L] = ravni[L] || []).push([a1, a2]);
              const W = Math.max(8, x2 - x1);
              const izbran = izbor?.tip === 'oklepaj' && izbor.v === vi && izbor.o === o.oi;
              const top = stran === 'zgoraj' ? t.y * s - (L + 1) * ravnina : t.y * s + H + L * ravnina;
              if (stran === 'spodaj') globinaSpodaj = Math.max(globinaSpodaj, (L + 1) * ravnina);
              const svg = `<svg width="${W}" height="14" viewBox="0 0 ${W} 14" aria-hidden="true">
                             <path d="${potOklepaja(W, o.slog)}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
              const oznaka = `<span class="bm-ok-oznaka" style="font-size:${pisavaOk}px">${oznakaHtml(o.oznaka)}</span>`;
              const robova = izbran
                ? `<i class="bm-ok-rob" data-konec="od" style="left:-7px"></i><i class="bm-ok-rob" data-konec="do" style="left:${W - 7}px"></i>`
                : '';
              html += `<div class="bm-oklepaj ${stran}${izbran ? ' izbran' : ''}" data-v="${vi}" data-o="${o.oi}"
                            style="left:${x1}px;width:${W}px;top:${top}px;height:${ravnina}px">
                         ${stran === 'zgoraj' ? oznaka + svg : svg + oznaka}${robova}</div>`;
            });
        });
        spodaj = Math.max(spodaj, t.y * s + H + globinaSpodaj);
      });

      if (duh) {
        html += `<div class="bm-duh" style="left:${duh.x * s}px;top:${duh.y * s}px;width:${duh.w * s}px;height:${H}px"></div>`;
        desno = Math.max(desno, duh.x + duh.w);
      }
      vodila.forEach(g => {
        html += g.x !== undefined
          ? `<div class="bm-vodilo navpicno" style="left:${g.x * s}px"></div>`
          : `<div class="bm-vodilo vodoravno" style="top:${g.y * s}px"></div>`;
      });
      if (!p.trakovi.length && !duh) {
        html += '<div class="bm-prazno">Povleci po platnu, da narišeš trak</div>';
      }

      svet.innerHTML = html;
      // med vlečenjem se svet ne krči, sicer bi platno poskakovalo
      // velikost sveta je odvisna le od vsebine (najmanj celo platno določi CSS),
      // da drsnik ne vpliva nazaj na izris
      const w = desno * s + 40, h = spodaj + 40;
      if (!vlecenje || w > parseFloat(svet.style.width || 0)) svet.style.width = w + 'px';
      if (!vlecenje || h > parseFloat(svet.style.height || 0)) svet.style.height = h + 'px';
    }

    /* ---------------- orodna vrstica za izbrano ---------------- */

    const gumb = (akcija, besedilo, naslov = '', razred = 'mini') =>
      `<button class="${razred}" data-a="${akcija}"${naslov ? ` title="${naslov}" aria-label="${naslov}"` : ''}>${besedilo}</button>`;
    const loc = '<span class="bm-loc"></span>';
    const barve = trenutna => BARVE_TRAKOV.map(b =>
      `<button class="bm-barva${b === trenutna ? ' on' : ''}" data-barva="${b}" style="background:${b}" aria-label="Barva"></button>`).join('');
    const razdeli = `<span class="bm-napis">Razdeli</span>
      ${[2, 3, 4, 5, 6, 7, 8].map(n => `<button class="mini bm-n" data-razdeli="${n}" title="Razdeli na ${n} enakih delov">${n}</button>`).join('')}`;
    const brisi = naslov => `<button class="mini bm-brisi" data-a="brisi" title="${naslov}" aria-label="${naslov}">${ikona('pospravi')}</button>`;

    function orodja() {
      const v = $t('.bm-izbor');
      if (!izbor) {
        v.innerHTML = `<span class="namig">Povleci po praznem — nov trak · primi trak — premakni · izbran del povleci ven · ⌥/Alt + povleci — kopija · ✥ ali presledek — premakni vse · povleci mejo — širina · klik — del, 2. klik — cel trak</span>
          ${p.trakovi.length ? `<span style="flex:1"></span>${gumb('pocisti', 'Počisti', 'Izbriši vse trakove', 'gumb gumb-t bm-brisi')}` : ''}`;
        return;
      }
      const t = p.trakovi[izbor.v];
      if (izbor.tip === 'trak') {
        const enaBarva = t.deli.every(d => d.barva === t.deli[0].barva);
        v.innerHTML = `
          <input class="vnos bm-oznaka" value="${ubezi(t.ime)}" placeholder="Ime traku …">
          ${barve(enaBarva ? t.deli[0].barva : null)}
          ${loc}${razdeli}
          ${loc}${gumb('oklepajZgoraj', '⏞ Nad', 'Oklepaj z oznako nad trakom', 'gumb gumb-s')}
          ${gumb('oklepajOb', '} Ob strani', 'Oklepaj ob strani — konce povleci čez trakove spodaj', 'gumb gumb-s')}
          ${loc}${gumb('kopiraj', 'Podvoji', 'Kopija tik pod trakom', 'gumb gumb-s')}
          ${brisi('Izbriši trak')}`;
      } else if (izbor.tip === 'del') {
        const en = izbor.od === izbor.do, d = t.deli[izbor.od];
        const izbrani = t.deli.slice(izbor.od, izbor.do + 1);
        v.innerHTML = `
          ${en ? `<input class="vnos bm-oznaka" value="${ubezi(d.oznaka)}" placeholder="Oznaka: 15, ?, 1/3 …">`
               : `<span class="bm-stevec">${izbrani.length} deli</span>`}
          ${barve(izbrani.every(x => x.barva === d.barva) ? d.barva : null)}
          ${loc}${en ? razdeli : gumb('zdruzi', 'Združi', 'Združi v en del', 'gumb gumb-s')}
          ${loc}${gumb('oklepajZgoraj', '⏞ Nad', 'Oklepaj z oznako nad izbranim', 'gumb gumb-s')}
          ${gumb('oklepajSpodaj', '⏟ Pod', 'Oklepaj z oznako pod izbranim', 'gumb gumb-s')}
          ${loc}${brisi(en ? 'Izbriši del' : 'Izbriši dele')}`;
      } else {
        const o = t.oklepaji[izbor.o];
        v.innerHTML = `
          <input class="vnos bm-oznaka" value="${ubezi(o.oznaka)}" placeholder="Oznaka: 45, ?, 1. dan …">
          ${['zgoraj', 'spodaj', 'desno'].map(st => `<button class="gumb gumb-s${o.stran === st ? ' on' : ''}" data-a="stran" data-stran="${st}">${{ zgoraj: '⏞ Nad', spodaj: '⏟ Pod', desno: '} Ob strani' }[st]}</button>`).join('')}
          ${brisi('Izbriši oklepaj')}
          <span class="namig">Pike na koncih povleci — tudi čez druge trakove</span>`;
      }

      const vnos = v.querySelector('.bm-oznaka');
      if (!vnos) return;
      let zapomnjeno = false;
      vnos.addEventListener('input', () => {
        if (!zapomnjeno) { zapomni(); zapomnjeno = true; }
        if (izbor.tip === 'del') t.deli[izbor.od].oznaka = vnos.value;
        else if (izbor.tip === 'trak') t.ime = vnos.value;
        else t.oklepaji[izbor.o].oznaka = vnos.value;
        shrani(); risi();
      });
      vnos.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === 'Escape') { vnos.blur(); svet.focus({ preventScroll: true }); }
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
      if (fokus && izbor) { const i = $t('.bm-oznaka'); i?.focus({ preventScroll: true }); i?.select(); }
    };

    /* ---------------- dejanja ---------------- */

    /* Ob vstavljanju, brisanju ali združevanju delov oklepaji ostanejo nad pravimi deli. */
    /** k novih delov za delom i; oklepaj, ki se konča pri i, zajame tudi nove (razdelitev). */
    const vstaviOklepaje = (t, i, k) => t.oklepaji.forEach(o => {
      if (o.od > i) o.od += k;
      if (o.do >= i) o.do += k;
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

    /** Del di razdeli na n enakih; njegova oznaka (npr. "? kg") ostane kot oklepaj nad celoto. */
    function razdeliDel(t, di, n) {
      const d = t.deli[di];
      t.deli.splice(di, 1, ...Array.from({ length: n }, () => del(d.w / n, '', d.barva)));
      vstaviOklepaje(t, di, n - 1);
      if (d.oznaka.trim()) t.oklepaji.push(oklepaj(di, di + n - 1, d.oznaka, 'zgoraj'));
    }

    /** Dele od..do vzame iz traku vi kot samostojen kos na istem mestu; kar ostane
        desno, postane svoj trak, da se nič ne premakne. Vrne indeks kosa. */
    function odtrgaj(vi, od, doo) {
      const t = p.trakovi[vi];
      const x = i => t.x + t.deli.slice(0, i).reduce((a, d) => a + d.w, 0);
      // oklepaji gredo s tistim kosom, ki ga v celoti pokrivajo; ki segajo čez rez, odpadejo
      const okl = (a, b) => t.oklepaji.filter(o => o.od >= a && o.do <= b).map(o => ({ ...o, od: o.od - a, do: o.do - a }));
      const n = t.deli.length;
      const kos = { x: x(od), y: t.y, ime: '', deli: t.deli.slice(od, doo + 1), oklepaji: okl(od, doo) };
      const desni = doo < n - 1 ? { x: x(doo + 1), y: t.y, ime: '', deli: t.deli.slice(doo + 1), oklepaji: okl(doo + 1, n - 1) } : null;
      if (od > 0) {
        t.oklepaji = okl(0, od - 1);
        t.deli = t.deli.slice(0, od);
        if (desni) p.trakovi.push(desni);
      } else {
        Object.assign(t, { ...desni, ime: t.ime });   // levo ni ničesar: ostanek desno obdrži ime
      }
      p.trakovi.push(kos);
      return p.trakovi.length - 1;
    }

    /** Kopija traku vi (ali le delov od..do) na istem mestu; vrne indeks kopije. */
    function kopiraj(vi, od = 0, doo = p.trakovi[vi].deli.length - 1) {
      const t = JSON.parse(JSON.stringify(p.trakovi[vi]));
      if (od === 0 && doo === t.deli.length - 1) { p.trakovi.push(t); return p.trakovi.length - 1; }
      p.trakovi.push({
        x: t.x + t.deli.slice(0, od).reduce((a, d) => a + d.w, 0), y: t.y, ime: '',
        deli: t.deli.slice(od, doo + 1),
        oklepaji: t.oklepaji.filter(o => o.stran !== 'desno' && o.x1 === undefined && o.od >= od && o.do <= doo)
                            .map(o => ({ ...o, od: o.od - od, do: o.do - od })),
      });
      return p.trakovi.length - 1;
    }

    const dejanja = {
      razdeli: n => {
        const t = izbraniTrak();
        if (izbor.tip === 'del') { razdeliDel(t, izbor.od, n); izbor = { ...izbor, do: izbor.od + n - 1 }; return; }
        // cel trak: najprej en sam del (oznake in oklepaji ostanejo le, če je bil en del)
        if (t.deli.length > 1) { t.deli = [del(dolzina(t), '', t.deli[0].barva)]; t.oklepaji = []; }
        razdeliDel(t, 0, n);
      },
      zdruzi: () => {
        const t = izbraniTrak();
        for (let k = izbor.do; k > izbor.od; k--) {
          t.deli[k - 1].w += t.deli[k].w;
          if (!t.deli[k - 1].oznaka) t.deli[k - 1].oznaka = t.deli[k].oznaka;
          t.deli.splice(k, 1);
          zlijOklepaje(t, k);
        }
        izbor = { ...izbor, do: izbor.od };
      },
      oklepajZgoraj: () => { const t = izbraniTrak(); t.oklepaji.push(oklepaj(izbor.od ?? 0, izbor.do ?? t.deli.length - 1, '?', 'zgoraj')); izbor = { tip: 'oklepaj', v: izbor.v, o: t.oklepaji.length - 1 }; },
      oklepajOb: () => {
        const t = izbraniTrak(), o = oklepaj(0, t.deli.length - 1, '?', 'desno');
        postaviOb(t, o);
        t.oklepaji.push(o);
        izbor = { tip: 'oklepaj', v: izbor.v, o: t.oklepaji.length - 1 };
      },
      oklepajSpodaj: () => { const t = izbraniTrak(); t.oklepaji.push(oklepaj(izbor.od, izbor.do, '?', 'spodaj')); izbor = { tip: 'oklepaj', v: izbor.v, o: t.oklepaji.length - 1 }; },
      brisi: () => dejanja[{ del: 'brisiDele', trak: 'brisiTrak', oklepaj: 'brisiOklepaj' }[izbor.tip]](),
      brisiDele: () => {
        const t = izbraniTrak();
        if (izbor.do - izbor.od + 1 >= t.deli.length) { p.trakovi.splice(izbor.v, 1); izbor = null; return; }
        for (let k = izbor.do; k >= izbor.od; k--) { t.deli.splice(k, 1); odstraniOklepaje(t, k); }
        izbor = null;
      },
      kopiraj: () => {
        const k = kopiraj(izbor.v);
        p.trakovi[k].y += VISINA_TRAKU;
        izbor = { tip: 'trak', v: k };
      },
      brisiTrak: () => { p.trakovi.splice(izbor.v, 1); izbor = null; },
      stran: st => {
        const t = izbraniTrak(), o = izbranOklepaj();
        if (st === o.stran) return;
        if (st === 'desno') { delete o.x1; delete o.x2; o.stran = st; postaviOb(t, o); return; }
        if (o.stran === 'desno') { ['y1', 'y2', 'xr'].forEach(k => delete o[k]); o.od = 0; o.do = t.deli.length - 1; }
        o.stran = st;
      },
      brisiOklepaj: () => { izbraniTrak().oklepaji.splice(izbor.o, 1); izbor = null; },
      pocisti: () => { p.trakovi = []; izbor = null; },
    };

    function razveljaviZadnje() {
      if (!zgodovina.length) { obvesti('Ni česa razveljaviti.'); return; }
      p.trakovi = JSON.parse(zgodovina.pop());
      shrani(); izberi(null);
    }

    $t('.bm-izbor').addEventListener('click', e => {
      const b = e.target.closest('[data-a], [data-barva], [data-razdeli]');
      if (!b) return;
      if (!izbor && b.dataset.a !== 'pocisti') return;
      zapomni();
      if (b.dataset.barva) {
        const t = izbraniTrak();
        (izbor.tip === 'trak' ? t.deli : t.deli.slice(izbor.od, izbor.do + 1)).forEach(d => d.barva = b.dataset.barva);
      } else if (b.dataset.razdeli) {
        dejanja.razdeli(+b.dataset.razdeli);
      } else {
        dejanja[b.dataset.a](b.dataset.stran);
      }
      // po novem oklepaju ali združitvi takoj vpišeš oznako
      shrani(); izberi(izbor, ['oklepajZgoraj', 'oklepajSpodaj', 'oklepajOb', 'zdruzi'].includes(b.dataset.a));
    });

    /* ---------------- vlečenje in izbira na platnu ---------------- */

    /** Položaj kazalca v enotah platna. */
    const vEnotah = e => {
      const r = svet.getBoundingClientRect();
      return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
    };

    svet.addEventListener('pointerdown', e => {
      if (e.button > 1) return;
      svet.focus({ preventScroll: true });
      const tocka = vEnotah(e);
      if (premikVse || presledek || e.button === 1) {
        if (!p.trakovi.length) return;
        vlecenje = { cx: e.clientX, cy: e.clientY, premaknjen: false, tip: 'vse', zacetki: p.trakovi.map(t => [t.x, t.y]) };
        svet.classList.add('vlecem');
        e.preventDefault();
        try { svet.setPointerCapture(e.pointerId); } catch (_) {}
        return;
      }
      const meja = e.target.closest('.bm-meja');
      const rob = e.target.closest('.bm-ok-rob');
      const d = e.target.closest('.bm-del');
      const ok = e.target.closest('.bm-oklepaj');
      const ime = e.target.closest('.bm-ime');
      const zac = { cx: e.clientX, cy: e.clientY, premaknjen: false };

      if (meja) {
        const vi = +meja.dataset.v, i = +meja.dataset.i, t = p.trakovi[vi];
        vlecenje = { ...zac, tip: 'meja', v: vi, i, x0: t.x, deli0: t.deli.map(x => x.w) };
      } else if (rob) {
        vlecenje = { ...zac, tip: 'rob', v: izbor.v, o: izbor.o, konec: rob.dataset.konec };
      } else if (d) {
        const vi = +d.dataset.v, t = p.trakovi[vi], di = +d.dataset.d;
        // izbran del (ne cel trak) primeš in odneseš iz traku
        const naIzboru = izbor?.tip === 'del' && izbor.v === vi && di >= izbor.od && di <= izbor.do
          && izbor.do - izbor.od + 1 < t.deli.length;
        // Alt: povlečeš kopijo (izbranih delov ali celega traku), sicer izbrane dele odtrgaš
        vlecenje = { ...zac, tip: 'premik', v: vi, di, x0: t.x, y0: t.y, shift: e.shiftKey,
                     odtrgaj: naIzboru && !e.altKey, kopija: e.altKey, kopijaDelov: naIzboru };
      } else if (ok) {
        izberi({ tip: 'oklepaj', v: +ok.dataset.v, o: +ok.dataset.o });
        return;
      } else if (ime) {
        vlecenje = { ...zac, tip: 'premik', v: +ime.dataset.v, di: null, x0: p.trakovi[+ime.dataset.v].x, y0: p.trakovi[+ime.dataset.v].y, kopija: e.altKey };
      } else {
        vlecenje = { ...zac, tip: 'risanje', x0: tocka.x, y0: tocka.y };
      }
      e.preventDefault();
      try { svet.setPointerCapture(e.pointerId); } catch (_) {}
    });

    svet.addEventListener('pointermove', e => {
      if (!vlecenje) svet.classList.toggle('kopija', e.altKey);   // kazalec "kopiraj", ko držiš Alt
      const v = vlecenje;
      if (!v) return;
      if (!v.premaknjen) {
        if (Math.hypot(e.clientX - v.cx, e.clientY - v.cy) < PRAG_PREMIKA) return;
        v.premaknjen = true;
        if (v.tip !== 'risanje') zapomni();
        if (v.odtrgaj) {
          v.v = odtrgaj(v.v, izbor.od, izbor.do);
          v.x0 = p.trakovi[v.v].x; v.y0 = p.trakovi[v.v].y;
          izbor = { tip: 'del', v: v.v, od: 0, do: izbor.do - izbor.od };
          orodja();
        } else if (v.kopija) {
          const n = v.kopijaDelov ? izbor.do - izbor.od : null;
          v.v = v.kopijaDelov ? kopiraj(v.v, izbor.od, izbor.do) : kopiraj(v.v);
          v.x0 = p.trakovi[v.v].x; v.y0 = p.trakovi[v.v].y;
          izbor = n !== null ? { tip: 'del', v: v.v, od: 0, do: n } : { tip: 'trak', v: v.v };
          orodja();
        }
      }
      const dx = (e.clientX - v.cx) / s, dy = (e.clientY - v.cy) / s;
      const t = p.trakovi[v.v];
      vodila = [];

      if (v.tip === 'vse') {
        // nihče ne sme čez levi ali zgornji rob
        const mx = Math.max(dx, -Math.min(...v.zacetki.map(z => z[0])));
        const my = Math.max(dy, -Math.min(...v.zacetki.map(z => z[1])));
        p.trakovi.forEach((tr, i) => { tr.x = zaokrozi(v.zacetki[i][0] + mx); tr.y = zaokrozi(v.zacetki[i][1] + my); });
      } else if (v.tip === 'premik') {
        const L = dolzina(t);
        let x = Math.max(0, v.x0 + dx), y = Math.max(0, v.y0 + dy);
        const meje = mejeX(v.v);
        const cz = najblizje(meje, x), ck = najblizje(meje, x + L);
        if (cz !== null) { x = cz; vodila.push({ x: cz }); }
        else if (ck !== null && ck - L >= 0) { x = ck - L; vodila.push({ x: ck }); }
        const cy = najblizje(vrhoviY(v.v), y);
        if (cy !== null && cy >= 0) { y = cy; vodila.push({ y: cy }, { y: cy + VISINA_TRAKU }); }
        t.x = zaokrozi(x); t.y = zaokrozi(y);
      } else if (v.tip === 'meja') {
        const { i, deli0, x0 } = v, n = deli0.length;
        const meje = mejeX(v.v);
        if (i === -1) {
          // levi rob: premakne se začetek, prvi del se raztegne ali skrči
          let x = Math.min(Math.max(0, x0 + dx), x0 + deli0[0] - NAJMANJ_DEL);
          const c = najblizje(meje, x);
          if (c !== null && c >= 0 && c <= x0 + deli0[0] - NAJMANJ_DEL) { x = c; vodila.push({ x: c }); }
          t.x = zaokrozi(x); t.deli[0].w = zaokrozi(deli0[0] + x0 - x);
        } else {
          const notranja = i < n - 1;
          const zac = x0 + deli0.slice(0, i).reduce((a, b) => a + b, 0);
          const omeji = w => notranja ? Math.min(Math.max(NAJMANJ_DEL, w), deli0[i] + deli0[i + 1] - NAJMANJ_DEL) : Math.max(NAJMANJ_DEL, w);
          let w = omeji(deli0[i] + dx);
          const c = najblizje(meje, zac + w);
          if (c !== null && omeji(c - zac) === c - zac) { w = c - zac; vodila.push({ x: c }); }
          t.deli[i].w = zaokrozi(w);
          if (notranja) t.deli[i + 1].w = zaokrozi(deli0[i] + deli0[i + 1] - w);
        }
      } else if (v.tip === 'rob') {
        // konec oklepaja skoči na najbližji rob ali mejo — katerega koli traku
        const o = t.oklepaji[v.o], tocka = vEnotah(e);
        const najblizji = (kandidati, vr) => kandidati.reduce((naj, c) => Math.abs(c - vr) < Math.abs(naj - vr) ? c : naj);
        if (o.stran === 'desno') {
          const [y1, y2] = konciOb(t, o);
          const robovi = p.trakovi.flatMap(tr => [tr.y, tr.y + VISINA_TRAKU]);
          if (v.konec === 'od') o.y1 = zaokrozi(najblizji(robovi.filter(y => y < y2 - 1), tocka.y) - t.y);
          else o.y2 = zaokrozi(najblizji(robovi.filter(y => y > y1 + 1), tocka.y) - t.y);
          postaviOb(t, o);
        } else {
          let [a, b] = konci(t, o);
          const vse = mejeX(-1);
          if (v.konec === 'od') a = najblizji(vse.filter(x => x < b - 1), tocka.x);
          else b = najblizji(vse.filter(x => x > a + 1), tocka.x);
          vodila.push({ x: v.konec === 'od' ? a : b });
          // oba konca na mejah lastnega traku: spet sledi delom, sicer prosti odmiki
          const m = mejeTraku(t), ia = m.findIndex(x => Math.abs(x - a) < 0.01), ib = m.findIndex(x => Math.abs(x - b) < 0.01);
          if (ia >= 0 && ib > ia) { o.od = ia; o.do = ib - 1; delete o.x1; delete o.x2; }
          else { o.x1 = zaokrozi(a - t.x); o.x2 = zaokrozi(b - t.x); }
        }
      } else if (v.tip === 'risanje') {
        const x1 = vEnotah(e).x;
        let a = Math.max(0, Math.min(v.x0, x1)), b = Math.max(v.x0, x1);
        const meje = mejeX(-1);
        const ca = najblizje(meje, a), cb = najblizje(meje, b);
        if (ca !== null) { a = ca; vodila.push({ x: ca }); }
        if (cb !== null) { b = cb; vodila.push({ x: cb }); }
        let y = Math.max(0, v.y0 - VISINA_TRAKU / 2);
        const cy = najblizje(vrhoviY(-1), y);
        if (cy !== null && cy >= 0) { y = cy; vodila.push({ y: cy }, { y: cy + VISINA_TRAKU }); }
        duh = { x: a, y, w: Math.max(0, b - a) };
      }
      risi();
    });

    const koncajVlecenje = e => {
      const v = vlecenje;
      if (!v) return;
      vlecenje = null; vodila = [];
      svet.classList.remove('vlecem');
      try { svet.releasePointerCapture(e.pointerId); } catch (_) {}

      if (v.tip === 'risanje') {
        const nov = duh;
        duh = null;
        if (v.premaknjen && nov && nov.w * s >= 16) {
          zapomni();
          p.trakovi.push({ x: zaokrozi(nov.x), y: zaokrozi(nov.y), ime: '',
                           deli: [del(zaokrozi(nov.w), '', BARVE_TRAKOV[p.trakovi.length % (BARVE_TRAKOV.length - 1)])], oklepaji: [] });
          shrani();
          // nov trak je izbran, da ga takoj razdeliš
          izberi({ tip: 'trak', v: p.trakovi.length - 1 }, false);
        } else {
          izberi(null);
        }
        return;
      }
      if (v.premaknjen) { shrani(); risi(); return; }

      // klik brez premika
      if (v.tip === 'premik') {
        const vi = v.v, di = v.di;
        if (di === null) izberi({ tip: 'trak', v: vi });
        else if (v.shift && izbor?.tip === 'del' && izbor.v === vi) {
          izberi({ tip: 'del', v: vi, od: Math.min(izbor.od, di), do: Math.max(izbor.do, di) }, false);
        } else if (izbor?.tip === 'del' && izbor.v === vi && izbor.od === di && izbor.do === di) {
          izberi({ tip: 'trak', v: vi }, false);          // drugi klik na isti del izbere cel trak
        } else {
          izberi({ tip: 'del', v: vi, od: di, do: di });
        }
      } else {
        risi();
      }
    };
    svet.addEventListener('pointerup', koncajVlecenje);
    svet.addEventListener('pointercancel', koncajVlecenje);

    svet.addEventListener('dblclick', e => {
      const d = e.target.closest('.bm-del');
      if (d) izberi({ tip: 'del', v: +d.dataset.v, od: +d.dataset.d, do: +d.dataset.d });
    });

    telo.addEventListener('keydown', e => {
      if (e.key === 'Alt') svet.classList.add('kopija');
      if (e.target.matches('input')) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); razveljaviZadnje(); }
      else if (e.key === '+' || e.key === '=') povecaj(1.2);
      else if (e.key === '-') povecaj(1 / 1.2);
      else if (e.key === 'Escape') izberi(null);
      else if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); if (!presledek) { presledek = true; svet.classList.add('roka'); } }
      else if ((e.key === 'Delete' || e.key === 'Backspace') && izbor) {
        e.preventDefault();
        zapomni();
        dejanja.brisi();
        shrani(); izberi(null);
      }
    });

    telo.addEventListener('keyup', e => {
      if (e.key === 'Alt') svet.classList.remove('kopija');
      if (e.key === ' ') { presledek = false; svet.classList.toggle('roka', premikVse); }
    });

    $t('.bm-razveljavi').addEventListener('click', razveljaviZadnje);

    const gumbVse = $t('.bm-vse');
    gumbVse.addEventListener('click', () => {
      premikVse = !premikVse;
      gumbVse.classList.toggle('on', premikVse);
      gumbVse.setAttribute('aria-pressed', premikVse);
      svet.classList.toggle('roka', premikVse);
      obvesti(premikVse ? 'Vleci kjerkoli — premakneš vse trakove.' : 'Premikanje vseh izklopljeno.');
    });

    /** Ves model (z imeni in oklepaji) na sredino vidnega dela platna. */
    $t('.bm-sredina').addEventListener('click', () => {
      const deli = [...svet.querySelectorAll('.bm-trak, .bm-ime, .bm-oklepaj')];
      if (!deli.length) return;
      const r0 = svet.getBoundingClientRect();
      const rob = deli.map(el => el.getBoundingClientRect());
      const L = Math.min(...rob.map(r => r.left)) - r0.left, D = Math.max(...rob.map(r => r.right)) - r0.left;
      const Z = Math.min(...rob.map(r => r.top)) - r0.top, S = Math.max(...rob.map(r => r.bottom)) - r0.top;
      const dx = (Math.max(20, (platno.clientWidth - (D - L)) / 2) - L) / s;
      const dy = (Math.max(20, (platno.clientHeight - (S - Z)) / 2) - Z) / s;
      zapomni();
      p.trakovi.forEach(t => { t.x = zaokrozi(Math.max(0, t.x + dx)); t.y = zaokrozi(Math.max(0, t.y + dy)); });
      shrani(); risi();
      platno.scrollTo(0, 0);
    });

    /** Povečava ostane središčena — kar je bilo na sredini platna, ostane tam. */
    function povecaj(faktor) {
      const prej = p.povecava || 1;
      const nova = Math.min(POVECAVA[1], Math.max(POVECAVA[0], Math.round(prej * faktor * 100) / 100));
      if (nova === prej) return;
      const k = nova / prej;
      const cx = platno.scrollLeft + platno.clientWidth / 2, cy = platno.scrollTop + platno.clientHeight / 2;
      p.povecava = nova;
      shrani(); risi();
      platno.scrollLeft = cx * k - platno.clientWidth / 2;
      platno.scrollTop = cy * k - platno.clientHeight / 2;
    }
    telo.querySelectorAll('[data-povecava]').forEach(b =>
      b.addEventListener('click', () => povecaj(b.dataset.povecava > 0 ? 1.2 : 1 / 1.2)));
    // Ctrl + kolešček ali uščip na sledilni ploščici
    platno.addEventListener('wheel', e => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      povecaj(Math.exp(-e.deltaY / 200));
    }, { passive: false });

    // merilo se prilagodi širini okna
    // Varovalo, če brskalnik ne pozna scrollbar-gutter: širina, ki samo skače
    // nazaj na predprejšnjo (drsnik se pojavi in izgine), ne sproži novega izrisa.
    let zadnjaSirina = 0, predzadnja = 0;
    new ResizeObserver(() => {
      const w = platno.clientWidth;
      if (vlecenje || w === zadnjaSirina) return;
      if (w === predzadnja && Math.abs(w - zadnjaSirina) <= 20) return;
      predzadnja = zadnjaSirina; zadnjaSirina = w;
      risi();
    }).observe(platno);
    risi(); orodja();
  },
});
