/* =====================================================================
   Razredni zaslon — jedro
   Stanje, shramba, šolski zvonec, ikone, ogrodje lebdečih pripomočkov.
   Brez zunanjih knjižnic. Klasična skripta (ne modul), da deluje tudi s file://.
   ===================================================================== */
'use strict';

/* ------------------------------------------------------------------ *
 * IKONE — vgrajene, da PWA ostane samozadosten brez interneta.
 * ------------------------------------------------------------------ */
const IKONE = {
  domov:    '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  skupine:  '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M15.5 20c0-2.3 1.6-3.6 4-3.6"/>',
  semafor:  '<rect x="8" y="2" width="8" height="20" rx="4"/><circle cx="12" cy="7" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="17" r="1.6"/>',
  simbol:   '<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M12 11V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M15 11V6.5a1.5 1.5 0 0 1 3 0V13c0 4.4-2.6 8-7 8s-7-3.1-7-6.5c0-1.4 1-2.3 2-2.3.7 0 1.3.4 1.6 1L9 14"/>',
  casovnik: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2"/><path d="M9 2h6"/>',
  kocka:    '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.4"/><circle cx="15.5" cy="15.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/>',
  besedilo: '<path d="M4 6V4h16v2"/><path d="M12 4v16"/><path d="M9 20h6"/>',
  zreb:     '<path d="M3 12a9 9 0 1 0 9-9"/><path d="M12 3v9l6 4"/>',
  slika:    '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>',
  ozadje:   '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 14l4-4 4 4"/><path d="M14 12l3-3 4 4"/>',
  anketa:   '<path d="M5 20V10"/><path d="M12 20V4"/><path d="M19 20v-7"/>',
  urnik:    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/>',
  miselni:  '<circle cx="12" cy="5" r="2.6"/><circle cx="5" cy="18" r="2.6"/><circle cx="19" cy="18" r="2.6"/><path d="M12 7.6 6.6 15.8"/><path d="M12 7.6l5.4 8.2"/><path d="M7.6 18h8.8"/>',
  vec:      '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  nastavi:  '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  zapri:    '<path d="M18 6 6 18M6 6l12 12"/>',
  igraj:    '<path d="M7 4v16l13-8z"/>',
  premor:   '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  ponastavi:'<path d="M3 12a9 9 0 1 0 2.6-6.4"/><path d="M3 4v5h5"/>',
  plus:     '<path d="M12 5v14M5 12h14"/>',
  minus:    '<path d="M5 12h14"/>',
  mesaj:    '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="M4 4l5 5"/>',
  // simboli dela
  tisina:   '<path d="M9 9v6a3 3 0 0 0 6 0V6a3 3 0 0 0-6 0"/><path d="M4 4l16 16"/>',
  sam:      '<path d="m16 3 5 5L8 21H3v-5z"/><path d="m14 5 5 5"/>',
  par:      '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3 2.4-5 6-5s6 2 6 5"/><path d="M14 20c0-3 2-5 5-5s3 2 3 5"/>',
  skupina:  '<circle cx="12" cy="6" r="2.6"/><circle cx="5" cy="13" r="2.6"/><circle cx="19" cy="13" r="2.6"/><path d="M12 9v4"/><path d="M7.4 13.8 12 13l4.6.8"/><path d="M3 21c0-2.2 1.2-3.4 4-3.4"/><path d="M21 21c0-2.2-1.2-3.4-4-3.4"/><path d="M8 21c0-2.5 1.6-4 4-4s4 1.5 4 4"/>',
  vprasaj:  '<circle cx="9" cy="7" r="3"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M17 4.5a2 2 0 1 1 2.6 1.9c-.7.3-1.1.9-1.1 1.6v.5"/><circle cx="18.5" cy="11.5" r=".9" fill="currentColor" stroke="none"/>',
  pomagaj:  '<path d="M7 12.5 10 15l4-4.5"/><path d="M12 21s-7-4.4-7-9.5A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 7 3.5C19 16.6 12 21 12 21z"/>',
  sepet:    '<path d="M4 11a8 8 0 0 1 16 0v3a3 3 0 0 1-3 3h-1v-6h4"/><path d="M4 11v3a3 3 0 0 0 3 3h1v-6H4"/>',
  slusalke: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2" y="13" width="5" height="8" rx="2"/><rect x="17" y="13" width="5" height="8" rx="2"/>',
};
function ikona(ime, atrib = '') {
  const d = IKONE[ime] || '';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${atrib}>${d}</svg>`;
}

/* ------------------------------------------------------------------ *
 * ŠOLSKI ZVONEC — OŠ Šempeter v Sav. dol., Publikacija 5.2
 * ------------------------------------------------------------------ */
const ZVONEC = [
  ['Predura',         '07:30', '08:15'],
  ['1. ura',          '08:20', '09:05'],
  ['2. ura',          '09:10', '09:55'],
  ['odmor za malico', '09:55', '10:15'],
  ['3. ura',          '10:15', '11:00'],
  ['4. ura',          '11:05', '11:50'],
  ['5. ura',          '11:55', '12:40'],
  ['6. ura',          '12:45', '13:30'],
  ['odmor za kosilo', '13:30', '13:50'],
  ['7. ura',          '13:50', '14:35'],
  ['8. ura',          '14:40', '15:25'],
];
const vMinute = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const jeOdmor = ime => ime.startsWith('odmor');
/** "1. ura" -> "1. ure"  (rodilnik za predlog "do") */
const rodilnik = ime => ime.replace(/ura$/i, 'ure').replace(/^Predura$/, 'predure');

function stanjeZvonca(zdaj = new Date()) {
  const n = zdaj.getHours() * 60 + zdaj.getMinutes();
  const dan = zdaj.getDay();
  if (dan === 0 || dan === 6) return { num: 'Vikend', rest: '', prikazi: false };

  for (let i = 0; i < ZVONEC.length; i++) {
    const [ime, od, doo] = ZVONEC[i];
    const a = vMinute(od), b = vMinute(doo);

    if (n >= a && n < b) {
      const ostalo = b - n;
      if (jeOdmor(ime)) return { num: 'Odmor', rest: `še ${ostalo} min`, prikazi: true, odmor: true };
      const nasl = ZVONEC[i + 1];
      const kam = nasl && jeOdmor(nasl[0]) ? 'do odmora'
                : nasl ? `do ${rodilnik(nasl[0])}` : 'do konca pouka';
      return { num: ime, rest: `še ${ostalo} min ${kam}`, prikazi: true };
    }
    // 5-minutni premor med urama (ni v tabeli, a obstaja)
    if (i > 0) {
      const prej = vMinute(ZVONEC[i - 1][2]);
      if (n >= prej && n < a) return { num: 'Premor', rest: `${a - n} min do ${rodilnik(ime)}`, prikazi: true, odmor: true };
    }
  }
  if (n < vMinute(ZVONEC[0][1]))
    return { num: 'Pred poukom', rest: `začetek ob ${ZVONEC[0][1].replace(':', '.')}`, prikazi: true };
  return { num: 'Pouk je končan', rest: '', prikazi: true };
}

/* ------------------------------------------------------------------ *
 * SHRAMBA
 * localStorage za majhno stanje (zaslon_*), IndexedDB za slike.
 * ------------------------------------------------------------------ */
const Shramba = {
  beri(kljuc, privzeto) {
    try {
      const v = localStorage.getItem('zaslon_' + kljuc);
      return v === null ? privzeto : JSON.parse(v);
    } catch (e) { return privzeto; }
  },
  pisi(kljuc, vrednost) {
    try { localStorage.setItem('zaslon_' + kljuc, JSON.stringify(vrednost)); }
    catch (e) { obvesti('Shramba je polna — slike shranjujem drugam.'); }
  },
  brisi(kljuc) { try { localStorage.removeItem('zaslon_' + kljuc); } catch (e) {} },
};

/** Slike so lahko večMB — localStorage ima ~5 MB, zato IndexedDB. */
const Slike = {
  _db: null,
  async odpri() {
    if (this._db) return this._db;
    this._db = await new Promise((res, rej) => {
      const z = indexedDB.open('zaslon-slike', 1);
      z.onupgradeneeded = () => z.result.createObjectStore('slike');
      z.onsuccess = () => res(z.result);
      z.onerror = () => rej(z.error);
    });
    return this._db;
  },
  async shrani(id, blob) {
    const db = await this.odpri();
    return new Promise((res, rej) => {
      const t = db.transaction('slike', 'readwrite');
      t.objectStore('slike').put(blob, id);
      t.oncomplete = res; t.onerror = () => rej(t.error);
    });
  },
  async vzemi(id) {
    const db = await this.odpri();
    return new Promise((res, rej) => {
      const t = db.transaction('slike', 'readonly');
      const z = t.objectStore('slike').get(id);
      z.onsuccess = () => res(z.result || null);
      z.onerror = () => rej(z.error);
    });
  },
  async brisi(id) {
    const db = await this.odpri();
    return new Promise(res => {
      const t = db.transaction('slike', 'readwrite');
      t.objectStore('slike').delete(id);
      t.oncomplete = res;
    });
  },
};

/* ------------------------------------------------------------------ *
 * OZADJA
 * ------------------------------------------------------------------ */
const VESOLJE =
  'radial-gradient(ellipse at 22% 28%, #35296B 0%, transparent 55%),' +
  'radial-gradient(ellipse at 78% 72%, #4A2F6E 0%, transparent 52%),' +
  'linear-gradient(160deg,#0E0C24 0%,#1A1440 46%,#241A4D 100%)';

const OZADJA = [
  { tip:'preliv', vrednost:VESOLJE, ime:'Vesolje', vesolje:true, temno:true },
  { tip:'preliv', vrednost:'linear-gradient(160deg,#0B3C5D,#1D6FA5 55%,#2E9CC9)', ime:'Globina',  temno:true },
  { tip:'preliv', vrednost:'linear-gradient(160deg,#134E2A,#2E8B4A 60%,#6BC17E)', ime:'Gozd',     temno:true },
  { tip:'preliv', vrednost:'linear-gradient(160deg,#5B2333,#A8334C 60%,#E0697F)', ime:'Zarja',    temno:true },
  { tip:'barva',  vrednost:'#2B3040', ime:'Temno sivo', temno:true },
  { tip:'preliv', vrednost:'linear-gradient(135deg,#EFE337,#EDC92D)', ime:'Šolsko rumeno', temno:false },
  { tip:'barva',  vrednost:'#F6F8FC', ime:'Svetlo', temno:false },
  { tip:'barva',  vrednost:'#FFFFFF', ime:'Belo',   temno:false },
];
const OZADJE_PRIVZETO = OZADJA[0];

/** Besedilo nad ozadjem mora ostati berljivo — na svetlem preklopimo na temno. */
function nastaviBesediloNadOzadjem(temno) {
  const k = document.documentElement.style;
  k.setProperty('--na-ozadju', temno ? '#FFFFFF' : '#23262F');
  k.setProperty('--na-ozadju-senca',
    temno ? '0 2px 10px rgba(0,0,0,.5)' : '0 1px 3px rgba(255,255,255,.75)');
}

/* ------------------------------------------------------------------ *
 * STANJE
 * ------------------------------------------------------------------ */
const Stanje = {
  razred:   Shramba.beri('razred', null),
  seznam:   [],                                   // [{id, ime}]
  odsotni:  new Set(),                            // napolni se ob nalaganju razreda
  velikost: Shramba.beri('velikost', 4),
  ozadje:   Shramba.beri('ozadje', OZADJE_PRIVZETO),
  semafor:  null,                                 // 'rdeca'|'rumena'|'zelena'|null
  simbol:   null,                                 // ključ iz SIMBOLI
  platno:   Shramba.beri('platno', []),
  zrebani:  new Set(Shramba.beri('zrebani', [])), // za "brez ponavljanja"
};

function aktivni() { return Stanje.seznam.filter(u => !Stanje.odsotni.has(u.id)); }

function shraniStanje() {
  Shramba.pisi('razred', Stanje.razred);
  // Odsotne hranimo po IMENIH — id-ji se ob vsakem nalaganju ustvarijo na novo.
  Shramba.pisi('odsotniImena',
    Stanje.seznam.filter(u => Stanje.odsotni.has(u.id)).map(u => u.ime));
  Shramba.pisi('velikost', Stanje.velikost);
  Shramba.pisi('ozadje', Stanje.ozadje);
  Shramba.pisi('zrebani', [...Stanje.zrebani]);
  Shramba.pisi('platno', Stanje.platno.map(p => ({ ...p, el: undefined })));
}

/* ------------------------------------------------------------------ *
 * POMOŽNO
 * ------------------------------------------------------------------ */
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const novId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function ubezi(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

let obvestiloCas = null;
function obvesti(sporocilo) {
  const el = $('#obvestilo');
  el.textContent = sporocilo;
  el.classList.add('vidno');
  clearTimeout(obvestiloCas);
  obvestiloCas = setTimeout(() => el.classList.remove('vidno'), 2200);
}

/** Enako kot v obstoječi aplikaciji: XOR s ponovljenim geslom + base64. */
function odkodiraj(base64, geslo) {
  try {
    const podatki = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const kljuc = new TextEncoder().encode(geslo);
    const rez = new Uint8Array(podatki.length);
    for (let i = 0; i < podatki.length; i++) rez[i] = podatki[i] ^ kljuc[i % kljuc.length];
    return JSON.parse(new TextDecoder().decode(rez));
  } catch (e) { return null; }
}

/* Razredi ostanejo odklenjeni do konca seje — geslo se ne vpisuje vsako uro. */
const Razredi = {
  podatki: null,
  odkleni(geslo) {
    const d = odkodiraj(ENCRYPTED_CLASSES, geslo);
    if (!d) return false;
    this.podatki = d;
    try { sessionStorage.setItem('zaslon_razredi', JSON.stringify(d)); } catch (e) {}
    return true;
  },
  obnovi() {
    try {
      const d = JSON.parse(sessionStorage.getItem('zaslon_razredi'));
      if (d) { this.podatki = d; return true; }
    } catch (e) {}
    return false;
  },
  jeOdklenjeno() { return this.podatki !== null; },
  imena() { return this.podatki ? Object.keys(this.podatki) : []; },
  nalozi(razred) {
    if (!this.podatki || !this.podatki[razred]) return false;
    Stanje.razred = razred;
    Stanje.seznam = this.podatki[razred].map(ime => ({ id: novId(), ime }));
    Stanje.odsotni.clear();
    Stanje.zrebani.clear();
    shraniStanje();
    return true;
  },
};

/* ------------------------------------------------------------------ *
 * VLEČENJE IN VELIKOST — skupno za lebdeče pripomočke in prevzeme
 * ------------------------------------------------------------------ */
const Vleci = {
  /** geo je objekt z x/y; ob koncu pokličemo obKoncu(). */
  premik(rocaj, el, geo, obKoncu, prezri = '') {
    let zx = 0, zy = 0, sx = 0, sy = 0, vlecem = false;
    rocaj.addEventListener('pointerdown', e => {
      if (prezri && e.target.closest(prezri)) return;
      vlecem = true;
      try { rocaj.setPointerCapture(e.pointerId); } catch (_) {}
      zx = e.clientX; zy = e.clientY; sx = geo.x; sy = geo.y;
    });
    rocaj.addEventListener('pointermove', e => {
      if (!vlecem) return;
      const p = $('#platno');
      geo.x = Math.min(Math.max(0, sx + e.clientX - zx), p.clientWidth  - 60);
      geo.y = Math.min(Math.max(0, sy + e.clientY - zy), p.clientHeight - 40);
      el.style.left = geo.x + 'px'; el.style.top = geo.y + 'px';
    });
    const konec = e => {
      if (!vlecem) return;
      vlecem = false;
      try { rocaj.releasePointerCapture(e.pointerId); } catch (_) {}
      obKoncu?.();
    };
    rocaj.addEventListener('pointerup', konec);
    rocaj.addEventListener('pointercancel', konec);
  },

  /** geo je objekt z w/h. */
  velikost(rocaj, el, geo, obKoncu, najmanjW = 180, najmanjH = 120, obSpremembi) {
    let zx = 0, zy = 0, sw = 0, sh = 0, vlecem = false;
    rocaj.addEventListener('pointerdown', e => {
      vlecem = true; e.stopPropagation();
      try { rocaj.setPointerCapture(e.pointerId); } catch (_) {}
      zx = e.clientX; zy = e.clientY; sw = geo.w; sh = geo.h;
    });
    rocaj.addEventListener('pointermove', e => {
      if (!vlecem) return;
      geo.w = Math.max(najmanjW, sw + e.clientX - zx);
      geo.h = Math.max(najmanjH, sh + e.clientY - zy);
      el.style.width = geo.w + 'px'; el.style.height = geo.h + 'px';
      obSpremembi?.();
    });
    const konec = e => {
      if (!vlecem) return;
      vlecem = false;
      try { rocaj.releasePointerCapture(e.pointerId); } catch (_) {}
      obKoncu?.();
    };
    rocaj.addEventListener('pointerup', konec);
    rocaj.addEventListener('pointercancel', konec);
  },
};

/* ------------------------------------------------------------------ *
 * OGRODJE LEBDEČIH PRIPOMOČKOV (platno)
 * ------------------------------------------------------------------ */
const Platno = {
  /** Registrirani tipi: { naslov, privzetaVelikost, izris(telo, pw), obnovi(pw) } */
  tipi: {},

  registriraj(tip, opis) { this.tipi[tip] = opis; },

  dodaj(tip, podatki = {}, polozaj = null) {
    const opis = this.tipi[tip];
    if (!opis) return null;
    const platno = $('#platno');
    const sirina  = polozaj?.w ?? opis.velikost?.[0] ?? 280;
    const visina  = polozaj?.h ?? opis.velikost?.[1] ?? 200;
    const zapis = {
      id: polozaj?.id ?? novId(),
      tip,
      // kaskada: vsak naslednji nekoliko zamaknjen, da se ne zlagajo na kup
      x: polozaj?.x ?? this._prostX(platno, sirina),
      y: polozaj?.y ?? this._prostY(platno, visina),
      w: sirina, h: visina,
      podatki,
    };
    // Obnova obstoječih gre skozi _ustvari(), zato tu vedno dodamo nov zapis.
    this._ustvari(zapis);
    Stanje.platno.push(zapis);
    shraniStanje();
    this._posodobiNamig();
    return zapis;
  },

  _prostX(platno, sirina) {
    const n = Stanje.platno.length;
    const zac = Math.max(16, (platno.clientWidth - sirina) / 2 - 130);
    return Math.min(zac + (n % 5) * 46, Math.max(16, platno.clientWidth - sirina - 16));
  },
  _prostY(platno, visina) {
    const n = Stanje.platno.length;
    const zac = Math.max(96, (platno.clientHeight - visina) / 2 - 70);
    return Math.min(zac + (n % 5) * 38, Math.max(96, platno.clientHeight - visina - 96));
  },

  _ustvari(zapis) {
    const opis = this.tipi[zapis.tip];
    const el = document.createElement('div');
    el.className = 'pw';
    el.dataset.id = zapis.id;
    el.style.cssText = `left:${zapis.x}px;top:${zapis.y}px;width:${zapis.w}px;height:${zapis.h}px`;
    el.innerHTML = `
      <div class="pw-glava">
        <span class="pw-naslov">${ubezi(opis.naslov)}</span>
        <div class="pw-gumbi">
          <button class="pw-gumb zapri" aria-label="Zapri ${ubezi(opis.naslov)}">${ikona('zapri')}</button>
        </div>
      </div>
      <div class="pw-telo"></div>
      <div class="pw-rocaj" aria-hidden="true"></div>`;
    $('#platno').appendChild(el);
    zapis.el = el;

    opis.izris(el.querySelector('.pw-telo'), zapis);

    el.querySelector('.zapri').addEventListener('click', () => this.odstrani(zapis.id));
    el.addEventListener('pointerdown', () => this._vOspredje(el));
    this._omogociVlecenje(el, zapis);
    this._omogociVelikost(el, zapis);
    return el;
  },

  _vOspredje(el) {
    $$('.pw').forEach(p => p.classList.remove('izbran'));
    el.classList.add('izbran');
    const najvisji = Math.max(0, ...$$('.pw').map(p => +p.style.zIndex || 0));
    el.style.zIndex = najvisji + 1;
  },

  _omogociVlecenje(el, zapis) {
    Vleci.premik(el.querySelector('.pw-glava'), el, zapis, () => shraniStanje(), '.pw-gumb');
  },

  _omogociVelikost(el, zapis) {
    Vleci.velikost(el.querySelector('.pw-rocaj'), el, zapis, () => shraniStanje(),
                   180, 120, () => this.tipi[zapis.tip].obVelikosti?.(zapis));
  },

  odstrani(id) {
    const i = Stanje.platno.findIndex(p => p.id === id);
    if (i < 0) return;
    const zapis = Stanje.platno[i];
    this.tipi[zapis.tip].obBrisu?.(zapis);
    zapis.el?.remove();
    Stanje.platno.splice(i, 1);
    shraniStanje();
    this._posodobiNamig();
  },

  obnoviVse() {
    Stanje.platno.forEach(z => this._ustvari(z));
    this._posodobiNamig();
  },

  _posodobiNamig() {
    $('#platno-namig').classList.toggle('skrit', Stanje.platno.length > 0);
  },
};

/* ------------------------------------------------------------------ *
 * TRAK — majhni pripomočki, vedno vidni
 * ------------------------------------------------------------------ */
const Trak = {
  osvezi() {
    const trak = $('#trak');
    const karkoli = Stanje.semafor !== null || Stanje.simbol !== null || Casovnik.aktiven;
    trak.classList.toggle('vklopljen', karkoli);
    $('#t-semafor').classList.toggle('skrit', Stanje.semafor === null);
    $('#t-simbol').classList.toggle('skrit', Stanje.simbol === null);
    $('#t-cas').classList.toggle('skrit', !Casovnik.aktiven);
    $$('.dok-gumb[data-trak]').forEach(g => {
      const k = g.dataset.trak;
      const on = k === 'semafor' ? Stanje.semafor !== null
               : k === 'simbol'  ? Stanje.simbol !== null
               : Casovnik.aktiven;
      g.classList.toggle('on', on);
    });
  },
};

/* ------------------------------------------------------------------ *
 * PREVZEM — orodja, ki potrebujejo cel zaslon
 * ------------------------------------------------------------------ */
const Prevzem = {
  trenutni: null,
  geo: Shramba.beri('prevzemGeo', {}),   // { skupine:{x,y,w,h}, semafor:{...}, … }
  pripravljeni: new Set(),

  /** Velik, na sredini, a tako da pusti glavo zgoraj in dok spodaj. */
  privzetaGeo() {
    const p = $('#platno');
    const w = Math.min(1120, p.clientWidth  - 36);
    const h = Math.min(660,  p.clientHeight - 130);
    return { x: Math.max(18, (p.clientWidth - w) / 2), y: 18, w, h };
  },

  shraniGeo() { Shramba.pisi('prevzemGeo', this.geo); },

  odpri(ime) {
    $$('.prevzem').forEach(p => p.classList.remove('odprt'));
    const el = document.getElementById('prevzem-' + ime);
    if (!el) return;

    if (!this.geo[ime]) this.geo[ime] = this.privzetaGeo();
    this._uporabiGeo(el, this.geo[ime]);
    if (!this.pripravljeni.has(ime)) { this._omogoci(el, ime); this.pripravljeni.add(ime); }

    el.classList.add('odprt');
    this.trenutni = ime;
    $$('.dok-gumb[data-prevzem]').forEach(g => g.classList.toggle('on', g.dataset.prevzem === ime));
  },

  _uporabiGeo(el, g) {
    const p = $('#platno');
    // po spremembi velikosti okna lahko okvir pade izven zaslona — potegnimo ga nazaj
    g.w = Math.min(g.w, p.clientWidth  - 24);
    g.h = Math.min(g.h, p.clientHeight - 24);
    g.x = Math.min(Math.max(0, g.x), Math.max(0, p.clientWidth  - 120));
    g.y = Math.min(Math.max(0, g.y), Math.max(0, p.clientHeight - 80));
    el.style.cssText = `left:${g.x}px; top:${g.y}px; width:${g.w}px; height:${g.h}px`;
  },

  _omogoci(el, ime) {
    const g = this.geo[ime];
    Vleci.premik(el.querySelector('.prevzem-glava'), el, g, () => this.shraniGeo(),
                 'button, .zetoni, select, input');
    const rocaj = el.querySelector('.prevzem-rocaj');
    if (rocaj) Vleci.velikost(rocaj, el, g, () => this.shraniGeo(), 320, 240);
  },

  zapri() {
    $$('.prevzem').forEach(p => p.classList.remove('odprt'));
    this.trenutni = null;
    $$('.dok-gumb[data-prevzem]').forEach(g => g.classList.remove('on'));
  },
  preklopi(ime) { this.trenutni === ime ? this.zapri() : this.odpri(ime); },

  /** Nazaj na privzeto velikost — če uporabnik okvir "zgubi". */
  ponastaviGeo() {
    if (!this.trenutni) return;
    this.geo[this.trenutni] = this.privzetaGeo();
    this._uporabiGeo(document.getElementById('prevzem-' + this.trenutni), this.geo[this.trenutni]);
    this.shraniGeo();
  },
};

/* ------------------------------------------------------------------ *
 * PLOŠČA (nastavitve)
 * ------------------------------------------------------------------ */
const Plosca = {
  odpri() { $('#plosca').classList.add('odprt'); $('#zastor').classList.add('odprt'); },
  zapri() { $('#plosca').classList.remove('odprt'); $('#zastor').classList.remove('odprt'); },
};

/* ------------------------------------------------------------------ *
 * GLAVA — ura in šolski zvonec
 * ------------------------------------------------------------------ */
const DNEVI  = ['nedelja','ponedeljek','torek','sreda','četrtek','petek','sobota'];
const MESECI = ['januar','februar','marec','april','maj','junij','julij','avgust',
                'september','oktober','november','december'];

function osveziGlavo() {
  const d = new Date();
  $('#ura-t').textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  $('#ura-d').textContent = `${DNEVI[d.getDay()]}, ${d.getDate()}. ${MESECI[d.getMonth()]}`;

  const s = stanjeZvonca(d);
  const chip = $('#ura-chip');
  chip.classList.toggle('skrit', !s.prikazi);
  $('#ura-num').textContent  = s.num;
  $('#ura-rest').textContent = s.rest;
  $('#ura-num').style.color = s.odmor ? 'var(--brand-orange)' : 'var(--brand-blue-dk)';
}

/* ------------------------------------------------------------------ *
 * OZADJE
 * ------------------------------------------------------------------ */
async function uporabiOzadje(oz) {
  Stanje.ozadje = oz;
  const p = $('#platno');
  p.style.background = '';
  p.style.backgroundImage = '';
  p.classList.remove('vesolje');

  if (oz.tip === 'barva' || oz.tip === 'preliv') {
    p.style.background = oz.vrednost;
    if (oz.vesolje) p.classList.add('vesolje');
    nastaviBesediloNadOzadjem(oz.temno !== false);
  }

  if (oz.tip === 'slika') {
    const blob = await Slike.vzemi(oz.vrednost);
    if (blob) {
      p.style.backgroundImage = `url(${URL.createObjectURL(blob)})`;
      nastaviBesediloNadOzadjem(true);   // fotografije so praviloma temnejše od besedila
    } else {
      p.style.background = VESOLJE;      // slika je izginila iz shrambe
      p.classList.add('vesolje');
      nastaviBesediloNadOzadjem(true);
    }
  }
  shraniStanje();
}
