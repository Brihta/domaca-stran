/* =====================================================================
   Razredni zaslon — zagon in povezave
   ===================================================================== */
'use strict';

/* ------------------------------------------------------------------ *
 * IKONE V RAZDELKIH
 * ------------------------------------------------------------------ */
function napolniIkone() {
  /* Dok: ikona gre v okrogli .ico, napis ostane pod njo. */
  const dokIkone = {
    'dok-domov': 'domov', 'dok-vec': 'vec', 'dok-plosca': 'nastavi',
  };
  Object.entries(dokIkone).forEach(([id, k]) => {
    const el = document.getElementById(id);
    if (el) el.querySelector('.ico').innerHTML = ikona(k);
  });
  $$('.dok-gumb[data-prevzem]').forEach(g =>
    g.querySelector('.ico').innerHTML = ikona(g.dataset.prevzem === 'zreb' ? 'zreb' : 'skupine'));
  $$('.dok-gumb[data-trak]').forEach(g =>
    g.querySelector('.ico').innerHTML = ikona(g.dataset.trak));

  const meniIkone = { kocka:'kocka', besedilo:'besedilo', slika:'slika', zreb:'zreb',
                      anketa:'anketa', urnik:'urnik', miselni:'miselni', quest:'quest' };
  $$('.vec-meni button').forEach(b => {
    const k = b.dataset.dodaj || b.dataset.prevzem;
    b.insertAdjacentHTML('afterbegin', ikona(meniIkone[k] || 'skupine'));
  });

  const ploscicaIkone = { skupine:'skupine', zreb:'zreb', semafor:'semafor',
                          besedilo:'besedilo', urnik:'urnik', quest:'quest' };
  $$('.ploscica').forEach(p => {
    const k = p.dataset.odpri || p.dataset.dodaj;
    p.querySelector('.i').innerHTML = ikona(ploscicaIkone[k] || 'besedilo');
  });

  $('#cas-ponastavi').innerHTML = ikona('ponastavi');
  $('#t-simbol .ikona').innerHTML = ikona('simbol');
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
  $('#dok-plosca').addEventListener('click', () => Plosca.odpri());
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

function poveziDok() {
  $('#dok-domov').addEventListener('click', () => { Prevzem.zapri(); zapriMeni(); });

  $$('.dok-gumb[data-prevzem]').forEach(g =>
    g.addEventListener('click', () => Prevzem.preklopi(g.dataset.prevzem)));

  // Semafor in Simbol: klik vklopi v traku, drugi klik odpre velik pogled
  $$('.dok-gumb[data-trak]').forEach(g => g.addEventListener('click', () => {
    const k = g.dataset.trak;
    if (k === 'casovnik') {
      Casovnik.aktiven ? Casovnik.ugasni() : Casovnik.vklopi(5);
      return;
    }
    const vklopljen = k === 'semafor' ? Stanje.semafor !== null : Stanje.simbol !== null;
    if (!vklopljen) {
      k === 'semafor' ? Semafor.nastavi('zelena') : Simboli.nastavi('sam');
      Prevzem.odpri(g.dataset.prevzemTudi);
    } else {
      Prevzem.preklopi(g.dataset.prevzemTudi);
    }
  }));

  $$('[data-zapri-prevzem]').forEach(b => b.addEventListener('click', () => Prevzem.zapri()));
  $$('[data-ponastavi-okvir]').forEach(b => b.addEventListener('click', () => Prevzem.ponastaviGeo()));
  $$('[data-cel-zaslon]').forEach(b => b.addEventListener('click', () => Prevzem.preklopiCelZaslon()));

  $$('.ploscica').forEach(p => p.addEventListener('click', () => {
    if (p.dataset.odpri) {
      if (p.dataset.odpri === 'semafor' && Stanje.semafor === null) Semafor.nastavi('zelena');
      Prevzem.odpri(p.dataset.odpri);
    }
    if (p.dataset.dodaj) Platno.dodaj(p.dataset.dodaj);
  }));

  // meni "Več orodij"
  const meni = $('#vec-meni');
  $('#dok-vec').addEventListener('click', e => { e.stopPropagation(); meni.classList.toggle('odprt'); });
  document.addEventListener('click', () => meni.classList.remove('odprt'));
  meni.addEventListener('click', e => e.stopPropagation());

  $$('#vec-meni [data-dodaj]').forEach(b => b.addEventListener('click', () => {
    Platno.dodaj(b.dataset.dodaj); zapriMeni();
  }));
  $$('#vec-meni [data-prevzem]').forEach(b => b.addEventListener('click', () => {
    Prevzem.odpri(b.dataset.prevzem); zapriMeni();
  }));
  $('#meni-razporejevalnik').addEventListener('click', () => { location.href = 'skupine.html'; });
}
function zapriMeni() { $('#vec-meni').classList.remove('odprt'); }

function poveziTrak() {
  $$('#t-semafor .luc').forEach(l =>
    l.addEventListener('click', () => Semafor.nastavi(l.dataset.barva)));
  $$('#prevzem-semafor .veliki-luc').forEach(l =>
    l.addEventListener('click', () => Semafor.nastavi(l.dataset.barva)));
  $('#semafor-ugasni').addEventListener('click', () => { Semafor.ugasni(); Prevzem.zapri(); });

  $('#t-simbol').addEventListener('click', () => Prevzem.preklopi('simbol'));
  $('#simbol-ugasni').addEventListener('click', () => { Simboli.ugasni(); Prevzem.zapri(); });

  $$('#t-cas .mini[data-min]').forEach(m =>
    m.addEventListener('click', () => { Casovnik.nastavi(+m.dataset.min); Casovnik.zacni(); }));
  $('#cas-igraj').addEventListener('click', () => Casovnik.preklopi());
  $('#cas-ponastavi').addEventListener('click', () => Casovnik.ponastavi());

  $('#trak-pocisti').addEventListener('click', () => {
    Semafor.ugasni(); Simboli.ugasni(); Casovnik.ugasni();
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

function poveziTipke() {
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, [contenteditable]')) return;
    if (e.key === 'Escape') {
      if ($('#plosca').classList.contains('odprt')) Plosca.zapri();
      else if (Prevzem.trenutni) Prevzem.zapri();
      else zapriMeni();
    }
  });
}

/* ------------------------------------------------------------------ *
 * ZAGON
 * ------------------------------------------------------------------ */
function zagon() {
  napolniIkone();
  Simboli.napolniIzbiro();

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
  Simboli.izris();
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
  poveziDok();
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
