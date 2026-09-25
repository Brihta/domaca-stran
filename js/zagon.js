/* =====================================================================
   Razredni zaslon — zagon in povezave
   ===================================================================== */
'use strict';

/* ------------------------------------------------------------------ *
 * IKONE V RAZDELKIH
 * ------------------------------------------------------------------ */
function napolniIkone() {
  const ploscicaIkone = {
    quest:'quest', skupine:'skupine', zreb:'zreb', semafor:'semafor',
    urnik:'urnik', miselni:'miselni', besedilo:'besedilo', kocka:'kocka',
    slika:'slika', anketa:'anketa',
  };
  $$('.ploscica').forEach(p => {
    const k = p.dataset.odpri || p.dataset.dodaj
            || (p.hasAttribute('data-cas') ? 'casovnik' : 'nastavi');
    p.querySelector('.i').innerHTML = ikona(ploscicaIkone[k] || k);
  });

  $('#cas-ponastavi').innerHTML = ikona('ponastavi');
  Casovnik.izris();
}

/* ------------------------------------------------------------------ *
 * PLOŠČA — razred, prisotnost, velikost, ozadje, tema
 * ------------------------------------------------------------------ */
function izrisiRazrede() {
  const odklenjeno = Razredi.jeOdklenjeno();
  $('#polje-geslo').classList.toggle('skrit', odklenjeno);
  $('#polje-razred').classList.toggle('skrit', !odklenjeno);
  if (!odklenjeno) return;

  const sel = $('#razred');
  sel.innerHTML = '<option value="">Izberi razred…</option>' +
    Razredi.imena().map(c => `<option${c === Stanje.razred ? ' selected' : ''}>${ubezi(c)}</option>`).join('');
}

function izrisiPrisotnost() {
  const ovoj = $('#seznam-imen');
  if (!Stanje.seznam.length) {
    ovoj.innerHTML = '';
    $('#prisotnost-namig').textContent = Razredi.jeOdklenjeno()
      ? 'Izberi razred zgoraj.' : 'Najprej odkleni in izberi razred.';
    return;
  }
  ovoj.innerHTML = Stanje.seznam.map(u =>
    `<span class="znacka-ime${Stanje.odsotni.has(u.id) ? ' odsoten' : ''}" data-id="${u.id}">${ubezi(u.ime)}</span>`
  ).join('');

  const ods = Stanje.odsotni.size;
  $('#prisotnost-namig').textContent = ods
    ? `${ods} odsotnih · ${aktivni().length} bo razporejenih`
    : 'Vsi prisotni.';
}

function izrisiVelikosti() {
  $$('#velikosti .zeton').forEach(z => z.classList.toggle('on', +z.dataset.v === Stanje.velikost));
}

function izrisiOzadja() {
  $('#ozadja').innerHTML = OZADJA.map((o, i) => {
    const slog = o.tip === 'barva' ? `background:${o.vrednost}` : `background:${o.vrednost}`;
    const izbran = Stanje.ozadje.tip === o.tip && Stanje.ozadje.vrednost === o.vrednost;
    return `<button class="ozadje-gumb${izbran ? ' on' : ''}" data-i="${i}" style="${slog}" title="${ubezi(o.ime)}" aria-label="${ubezi(o.ime)}"></button>`;
  }).join('');
  $$('#ozadja .ozadje-gumb').forEach(g =>
    g.addEventListener('click', () => { uporabiOzadje(OZADJA[+g.dataset.i]); izrisiOzadja(); }));
}

function izrisiTeme() {
  $('#tema').innerHTML = Object.entries(TEME).map(([k, t]) =>
    `<option value="${k}"${k === Skupine.tema ? ' selected' : ''}>${ubezi(t.ime)}</option>`).join('');
}

function izrisiPozdrav() {
  const u = new Date().getHours();
  const del = u < 10 ? 'Dobro jutro' : u < 18 ? 'Dober dan' : 'Dober večer';
  $('#pozdrav').textContent = Stanje.razred ? `${del}, ${Stanje.razred}` : 'Razredni zaslon';
  $('#sola-pod').textContent = Stanje.razred
    ? `${Stanje.razred} · ${aktivni().length} prisotnih` : 'Razredni zaslon';
}

/* ------------------------------------------------------------------ *
 * POVEZAVE
 * ------------------------------------------------------------------ */
function poveziPlosco() {
  $('#plosca-zapri').addEventListener('click', () => Plosca.zapri());
  $('#zastor').addEventListener('click', () => Plosca.zapri());

  const odkleni = () => {
    const g = $('#geslo').value;
    if (!g) { obvesti('Vpiši geslo.'); return; }
    if (!Razredi.odkleni(g)) { obvesti('Napačno geslo.'); return; }
    $('#geslo').value = '';
    izrisiRazrede();
    obvesti('Sezname sem odklenil do konca seje.');
  };
  $('#odkleni').addEventListener('click', odkleni);
  $('#geslo').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); odkleni(); } });

  $('#razred').addEventListener('change', e => {
    if (!e.target.value) return;
    if (!Razredi.nalozi(e.target.value)) { obvesti('Tega razreda ni v podatkih.'); return; }
    izrisiPrisotnost(); izrisiPozdrav(); Zreb.izrisStanja(); Pustolovscina.izris();
    obvesti(`Naložen ${Stanje.razred} — ${Stanje.seznam.length} učencev`);
  });

  $('#seznam-imen').addEventListener('click', e => {
    const z = e.target.closest('.znacka-ime');
    if (!z) return;
    const id = z.dataset.id;
    Stanje.odsotni.has(id) ? Stanje.odsotni.delete(id) : Stanje.odsotni.add(id);
    shraniStanje(); izrisiPrisotnost(); izrisiPozdrav(); Zreb.izrisStanja(); Pustolovscina.izris();
  });

  $$('#velikosti .zeton').forEach(z => z.addEventListener('click', () => {
    Stanje.velikost = +z.dataset.v; shraniStanje(); izrisiVelikosti();
  }));

  $('#tema').addEventListener('change', e => {
    Skupine.tema = e.target.value;
    Shramba.pisi('tema', Skupine.tema);
    Skupine.izris();
  });

  $('#ozadje-datoteka').addEventListener('change', async e => {
    const dat = e.target.files[0];
    if (!dat) return;
    if (dat.size > 8 * 1024 * 1024) { obvesti('Slika je prevelika (največ 8 MB).'); return; }
    const id = novId();
    await Slike.shrani(id, dat);
    await uporabiOzadje({ tip: 'slika', vrednost: id, ime: 'Lastna slika' });
    izrisiOzadja();
    obvesti('Ozadje nastavljeno.');
  });

  $('#ustvari').addEventListener('click', () => { Skupine.ustvari(); Plosca.zapri(); });
}

function poveziPloscice() {
  // Ploščice na domačem zaslonu so edina navigacija — doka ni več.
  $$('.ploscica').forEach(p => p.addEventListener('click', () => {
    if (p.dataset.odpri) {
      if (p.dataset.odpri === 'semafor' && Stanje.semafor === null) Semafor.nastavi('zelena');
      Prevzem.odpri(p.dataset.odpri);
    }
    if (p.dataset.dodaj) Platno.dodaj(p.dataset.dodaj);
    if (p.hasAttribute('data-cas')) Casovnik.aktiven ? Casovnik.ugasni() : Casovnik.vklopi(5);
    if (p.hasAttribute('data-plosca')) Plosca.odpri();
  }));

  $$('[data-zapri-prevzem]').forEach(b => b.addEventListener('click', () => Prevzem.zapri()));
  $$('[data-ponastavi-okvir]').forEach(b => b.addEventListener('click', () => Prevzem.ponastaviGeo()));
  $$('[data-cel-zaslon]').forEach(b => b.addEventListener('click', () => Prevzem.preklopiCelZaslon()));
}


function poveziTrak() {
  $$('#t-semafor .luc').forEach(l =>
    l.addEventListener('click', () => Semafor.nastavi(l.dataset.barva)));
  $$('#prevzem-semafor .veliki-luc').forEach(l =>
    l.addEventListener('click', () => Semafor.nastavi(l.dataset.barva)));
  $('#semafor-ugasni').addEventListener('click', () => { Semafor.ugasni(); Prevzem.zapri(); });


  $$('#t-cas .mini[data-min]').forEach(m =>
    m.addEventListener('click', () => { Casovnik.nastavi(+m.dataset.min); Casovnik.zacni(); }));
  $('#cas-igraj').addEventListener('click', () => Casovnik.preklopi());
  $('#cas-ponastavi').addEventListener('click', () => Casovnik.ponastavi());

  $('#trak-pocisti').addEventListener('click', () => {
    Semafor.ugasni(); Casovnik.ugasni();
  });
}

function poveziSkupineInZreb() {
  $('#skupine-mesaj').addEventListener('click', () => Skupine.ustvari());
  $('#skupine-nastavi').addEventListener('click', () => Plosca.odpri());

  $('#zreb-gumb').addEventListener('click', () => Zreb.zrebaj());
  $('#zreb-ponastavi').addEventListener('click', () => Zreb.ponastaviKrog());
  $('#zreb-brez').addEventListener('click', () => {
    Zreb.brezPonavljanja = !Zreb.brezPonavljanja;
    Shramba.pisi('zrebBrez', Zreb.brezPonavljanja);
    Zreb.izrisStanja();
  });
  $$('#zreb-koliko .zeton').forEach(z => z.addEventListener('click', () => {
    Zreb.koliko = +z.dataset.n; Zreb.izrisStanja();
  }));
}


function poveziOrodja() {
  // urnik
  $('#urnik-pocisti').addEventListener('click', () => Urnik.pocisti());

  // pustolovščina
  $('#q-ponastavi').addEventListener('click', () => Pustolovscina.ponastaviVse());
  $('#q-dodeli').addEventListener('click', () => Pustolovscina.odpriDodelitev());
  $('#q-izbira-zapri').addEventListener('click', () => Pustolovscina.zapriIzbiro());
  $('#q-ogled').addEventListener('click', () => Pustolovscina.preklopiOgled());
  $('#q-izhod').addEventListener('click', () => Pustolovscina.preklopiOgled());

  // Izbirnik junakov je premakljiv. Skupnega pripomočka ne uporabimo, ker
  // omejuje na pozitivne odmike, tu pa je treba okno znati dvigniti navzgor.
  poveziPremikIzbirnika();

  // Ob spremembi velikosti okna je treba mrežo junakov znova razporediti.
  let cas = null;
  window.addEventListener('resize', () => {
    clearTimeout(cas);
    cas = setTimeout(() => Pustolovscina._razporedi(), 120);
  });
  $('#q-izbira').addEventListener('click', e => {
    if (e.target.id === 'q-izbira') Pustolovscina.zapriIzbiro();
  });

  // miselni vzorec
  $('#miselni-dodaj').addEventListener('click', () => Miselni.dodaj('Nova ideja', Miselni.vozlisca.length === 0));
  $('#miselni-povezi').addEventListener('click', () => Miselni.zacniPovezovanje());
  $('#miselni-pocisti').addEventListener('click', () => Miselni.pocisti());
  // klik na prazno polje razveljavi izbiro
  $('#miselni-polje').addEventListener('pointerdown', e => {
    if (e.target.id !== 'miselni-polje' && e.target.id !== 'miselni-crte') return;
    Miselni.izbran = null; Miselni.povezujem = null; Miselni.izris();
  });
}

/** Premikanje izbirnika junakov; dovoljen je tudi odmik navzgor. */
function poveziPremikIzbirnika() {
  const okno = $('.q-izbira-box');
  const rocaj = $('.q-izbira-glava');
  let zx = 0, zy = 0, sx = 0, sy = 0, dx = 0, dy = 0, vlecem = false;

  rocaj.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    vlecem = true;
    try { rocaj.setPointerCapture(e.pointerId); } catch (_) {}
    zx = e.clientX; zy = e.clientY; sx = dx; sy = dy;
  });
  rocaj.addEventListener('pointermove', e => {
    if (!vlecem) return;
    const p = $('#platno');
    dx = Math.min(Math.max(sx + e.clientX - zx, -p.clientWidth  / 2), p.clientWidth  / 2);
    dy = Math.min(Math.max(sy + e.clientY - zy, -p.clientHeight + 60), p.clientHeight - 80);
    okno.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  const konec = e => {
    if (!vlecem) return;
    vlecem = false;
    try { rocaj.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  rocaj.addEventListener('pointerup', konec);
  rocaj.addEventListener('pointercancel', konec);
}

function poveziTipke() {
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, [contenteditable]')) return;
    if (e.key === 'Escape') {
      if ($('#plosca').classList.contains('odprt')) Plosca.zapri();
      else if (Prevzem.trenutni) Prevzem.zapri();
    }
  });
}

/* ------------------------------------------------------------------ *
 * ZAGON
 * ------------------------------------------------------------------ */
function zagon() {
  napolniIkone();

  Razredi.obnovi();
  // seznam učencev obnovimo, če je razred še odklenjen v tej seji
  if (Razredi.jeOdklenjeno() && Stanje.razred && Razredi.podatki[Stanje.razred]) {
    const odsotniPrej = Shramba.beri('odsotniImena', []);
    Stanje.seznam = Razredi.podatki[Stanje.razred].map(ime => ({ id: novId(), ime }));
    Stanje.odsotni = new Set(Stanje.seznam.filter(u => odsotniPrej.includes(u.ime)).map(u => u.id));
  }

  izrisiRazrede();
  izrisiPrisotnost();
  izrisiVelikosti();
  izrisiOzadja();
  izrisiTeme();
  izrisiPozdrav();

  Semafor.izris();
  Trak.osvezi();
  Zreb.izrisStanja();
  Skupine.izris();
  Urnik.izris();
  Miselni.izris();
  Pustolovscina.preseli();
  Pustolovscina.izris();

  uporabiOzadje(Stanje.ozadje);
  Platno.obnoviVse();

  poveziPlosco();
  poveziPloscice();
  poveziTrak();
  poveziSkupineInZreb();
  poveziOrodja();
  poveziTipke();

  osveziGlavo();
  setInterval(() => { osveziGlavo(); Urnik.oznaciTrenutno(); }, 15000);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', zagon);
