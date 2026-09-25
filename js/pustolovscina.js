/* =====================================================================
   Razredna pustolovščina — točke in napredovanje junakov
   Vsak učenec izbere svojo pot; točke ga vodijo skozi šest nivojev.
   ===================================================================== */
'use strict';

/** Ena točka = en nivo. Šest je največ. */
const NAJVEC_NIVO = 6;

const POTI = {
  zmaj: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Zmaj Aqua', barva: '#2E9CC9',
    nivoji: ['Biserni mladič',
             'Potočni zmajček',
             'Čuvaj tolmuna',
             'Gospodar valov',
             'Kralj plimovanja',
             'Zvezdni leviatan'],
  },
  feniks: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Feniks', barva: '#E0700A',
    nivoji: ['Ognjeno jajce',
             'Ognjeni puhek',
             'Žerjavica',
             'Krila ognja',
             'Sončni plamen',
             'Modri feniks'],
  },
  vitez: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Kralj Artur', barva: '#C2185B',
    nivoji: ['Vaški fant',
             'Ščitonoša',
             'Levji vitez',
             'Turnirski vitez',
             'Zlati paladin',
             'Krilati Artur'],
  },
  skrat: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Bojevnik Škrat', barva: '#8B5A2B',
    nivoji: ['Kovačev pomočnik',
             'Bradati stražar',
             'Verižni bojevnik',
             'Oklepni borec',
             'Runski kovač',
             'Gromsko kladivo'],
  },
  tat: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Hattori Hanzō', barva: '#4A5FC1',
    nivoji: ['Bosonogi tat',
             'Tihi korak',
             'Senčni tekač',
             'Shinobi',
             'Mojster senc',
             'Veliki Hanzō'],
  },
  lokostrelka: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Vixen', barva: '#0FA3A3',
    nivoji: ['Prva puščica',
             'Gozdna sledilka',
             'Tiha lovka',
             'Ostrostrelka',
             'Jantarni lok',
             'Lunina strelka'],
  },
  narava: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Kalisto', barva: '#55A51C',
    nivoji: ['Seme gozda',
             'Zeliščarka',
             'Varuhinja studenca',
             'Gozdna bojevnica',
             'Vladarica gaja',
             'Duh pragozda'],
  },
  vilinec: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Frodo', barva: '#2E8B4A',
    nivoji: ['Bosi popotnik',
             'Nosilec kristala',
             'Zeleni plašč',
             'Vilinski stražar',
             'Temni plemič',
             'Kronani vilinec'],
  },
  znanstvenica: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Aurelia', barva: '#7A4FBF',
    nivoji: ['Prva bučka',
             'Dvojni napoj',
             'Lekarnarica',
             'Modra raziskovalka',
             'Zbirateljica eliksirjev',
             'Zlata Aurelia'],
  },
  carovnik: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Čarovnik Homer', barva: '#2266FF',
    nivoji: ['Lesena palica',
             'Prvi urok',
             'Kristalna palica',
             'Čarovniški klobuk',
             'Bralec urokov',
             'Arhimag'],
  },
};

/* Večina poti ima izrezane like (PNG s prozornim ozadjem),
   nekatere pa cele prizore s svojim ozadjem (JPEG). */
const slikaPoti = (pot, nivo) =>
  `assets/junaki/${pot}/nivo_${nivo}.` + (POTI[pot]?.pripona || 'png');

/* Poti, ki jih je nadomestil nov nabor slik. */
const STARE_POTI = { alkimist: 'znanstvenica' };

/** Nivo je kar število točk, omejeno na 1–6. */
function nivoIzTock(tocke) {
  return Math.min(NAJVEC_NIVO, Math.max(1, Math.round(tocke)));
}

/**
 * Staro štetje (pragovi 0/10/25/50/100/150) pretvorimo v nove nivoje,
 * da učenci ne izgubijo napredka ob prehodu.
 */
const STARI_PRAGOVI = [0, 10, 25, 50, 100, 150];
function pretvoriStaro(tocke) {
  let n = 1;
  for (let i = 0; i < STARI_PRAGOVI.length; i++) if (tocke >= STARI_PRAGOVI[i]) n = i + 1;
  return n;
}

const Pustolovscina = {
  /** { "7. A": { "Ana": { pot:'zmaj', tocke:35 } } } */
  podatki: Shramba.beri('pustolovscina', {}),
  izbiramZa: null,          // ime učenca, ki mu izbiramo pot

  /** Selitve shranjenih podatkov ob spremembah pravil ali nabora poti. */
  preseli() {
    const r = Shramba.beri('pustolovscinaRazlicica', 1);

    // v2: staro štetje (0/10/25/50/100/150) -> "1 točka = 1 nivo"
    if (r < 2) {
      Object.values(this.podatki).forEach(razred =>
        Object.values(razred).forEach(z => { z.tocke = pretvoriStaro(z.tocke); }));
    }
    // v3: opuščeni poti prenesemo na njuni nadomestni, da učenci ne ostanejo brez junaka
    if (r < 3) {
      Object.values(this.podatki).forEach(razred =>
        Object.values(razred).forEach(z => {
          if (z.pot && STARE_POTI[z.pot]) z.pot = STARE_POTI[z.pot];
          if (z.pot && !POTI[z.pot]) z.pot = null;      // neznane poti raje počistimo
        }));
    }
    if (r < 3) { Shramba.pisi('pustolovscinaRazlicica', 3); this.shrani(); }
  },

  shrani() { Shramba.pisi('pustolovscina', this.podatki); },

  zaRazred() {
    const r = Stanje.razred;
    if (!r) return {};
    if (!this.podatki[r]) this.podatki[r] = {};
    return this.podatki[r];
  },

  zapis(ime) {
    const r = this.zaRazred();
    if (!r[ime]) r[ime] = { pot: null, tocke: 0 };
    return r[ime];
  },

  /** Doda točke in po potrebi sproži slavje. Vrne nov nivo, če je napredoval. */
  dodaj(ime, koliko) {
    const z = this.zapis(ime);
    const prejNivo = nivoIzTock(z.tocke);
    z.tocke = Math.min(NAJVEC_NIVO, Math.max(1, z.tocke + koliko));
    const zdajNivo = nivoIzTock(z.tocke);
    this.shrani();
    this.izris();

    if (zdajNivo > prejNivo && z.pot) {
      const ovoj = $(`.q-kartica[data-ime="${CSS.escape(ime)}"] .q-slika-ovoj`);
      if (ovoj) { ovoj.classList.add('napreduj'); setTimeout(() => ovoj.classList.remove('napreduj'), 900); }
      this.praznuj(ime, z.pot, zdajNivo);
      return zdajNivo;
    }
    // ob napredovanju navzdol ali brez spremembe le poudarimo kartico
    const kartica = $(`.q-kartica[data-ime="${CSS.escape(ime)}"]`);
    kartica?.classList.add('utripni');
    setTimeout(() => kartica?.classList.remove('utripni'), 500);
    return null;
  },

  izberiPot(ime, pot) {
    const z = this.zapis(ime);
    z.pot = pot;
    if (!z.tocke) z.tocke = 1;          // izbran junak začne na nivoju 1
    this.shrani();
    this.izbiramZa = null;
    this.izris();
    obvesti(`${ime} je izbral pot: ${POTI[pot].ime}`);

    // Razred se dodeljuje po vrsti, zato takoj ponudimo naslednjega brez junaka.
    const nasl = this.naslednjiBrezJunaka();
    if (nasl) this.odpriIzbiro(nasl);
    else this.zapriIzbiro();
  },

  /** Prvi prisotni učenec, ki junaka še nima. */
  naslednjiBrezJunaka() {
    return aktivni().find(u => !this.zapis(u.ime).pot)?.ime || null;
  },

  ponastavi(ime) {
    this.zapis(ime).tocke = 1;
    this.shrani(); this.izris();
  },

  ponastaviVse() {
    const r = Stanje.razred;
    if (!r) return;
    Object.values(this.podatki[r] || {}).forEach(z => z.tocke = 1);
    this.shrani(); this.izris();
    obvesti('Točke celega razreda ponastavljene.');
  },

  /* ---------------- slavje ob napredovanju ---------------- */
  praznuj(ime, pot, nivo) {
    const o = $('#q-slavje');
    const p = POTI[pot];
    o.innerHTML = `
      <div class="q-slavje-box" style="--pb:${p.barva}">
        <div class="q-slavje-nivo">Nivo ${nivo}</div>
        <img class="q-slavje-slika ${p.svojeOzadje ? '' : 'brez-ozadja'}" src="${slikaPoti(pot, nivo)}" alt="">
        <div class="q-slavje-ime">${ubezi(ime)}</div>
        <div class="q-slavje-naziv">${ubezi(p.nivoji[nivo - 1])}</div>
        <div class="q-slavje-pot">${ubezi(p.ime)}</div>
      </div>`;
    o.classList.add('vidno');
    this.zazveni();

    clearTimeout(this._slavjeCas);
    this._slavjeCas = setTimeout(() => o.classList.remove('vidno'), 4200);
    o.onclick = () => o.classList.remove('vidno');
  },

  /** Kratka vesela fanfara — isti pristop kot pri časovniku. */
  zazveni() {
    try {
      const ac = Casovnik.zvok || new (window.AudioContext || window.webkitAudioContext)();
      Casovnik.zvok = ac;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'triangle'; o.frequency.value = f;
        const t = ac.currentTime + i * 0.11;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        o.start(t); o.stop(t + 0.34);
      });
    } catch (e) {}
  },

  /* ---------------- izris ---------------- */
  izris() {
    const mreza = $('#q-mreza');
    if (!mreza) return;

    if (!Stanje.razred || !Stanje.seznam.length) {
      mreza.innerHTML = `
        <div class="q-prazno">
          ${ikona('quest')}
          <h3>Najprej izberi razred</h3>
          <p>Pustolovščina potrebuje seznam učencev. Odkleni ga z geslom
             in izberi razred — nato tu dobiš kartico za vsakega učenca.</p>
          <button class="gumb gumb-p gumb-xl" id="q-odpri-razred">Odpri „Razred"</button>
        </div>`;
      $('#q-odpri-razred').addEventListener('click', () => Plosca.odpri());
      $('#q-mreza').style.gridTemplateColumns = '';
      $('#q-znacka').textContent = '';
      $('#q-dodeli').classList.add('skrit');
      return;
    }

    // Na zaslonu so samo tisti, ki junaka že imajo — prazne kartice ne zasedajo prostora.
    const ucenci = aktivni();
    const zJunakom = ucenci.filter(u => this.zapis(u.ime).pot);
    const brezJunaka = ucenci.length - zJunakom.length;

    mreza.innerHTML = zJunakom.length
      ? zJunakom.map(u => this._kartica(u.ime)).join('')
      : `<div class="q-prazno">
           ${ikona('quest')}
           <h3>Nihče še nima junaka</h3>
           <p>Vsak učenec si izbere svojo pot in z zbranimi točkami
              napreduje skozi šest nivojev.</p>
           <button class="gumb gumb-p gumb-xl" id="q-zacni">Dodeli junaka</button>
         </div>`;
    this._poveziKartice();
    $('#q-zacni')?.addEventListener('click', () => this.odpriDodelitev());
    if (!zJunakom.length) mreza.style.gridTemplateColumns = '';

    // Brez te poti junaka ne bi bilo mogoče nikomur dodeliti.
    const g = $('#q-dodeli');
    g.classList.toggle('skrit', brezJunaka === 0);
    g.textContent = `Dodeli junaka (${brezJunaka})`;

    $('#q-znacka').textContent =
      `${Stanje.razred} · ${zJunakom.length} junakov` +
      (brezJunaka ? ` · ${brezJunaka} brez` : '');

    this._razporedi();
  },

  _kartica(ime) {
    const z = this.zapis(ime);
    const p = POTI[z.pot];
    const nivo = nivoIzTock(z.tocke);
    const ovojRazred = p.svojeOzadje ? 'ima-ozadje' : 'brez-ozadja';

    return `
      <div class="q-kartica" data-ime="${ubezi(ime)}" style="--pb:${p.barva}">
        <div class="q-slika-ovoj ${ovojRazred}">
          <img class="q-slika" src="${slikaPoti(z.pot, nivo)}"
               alt="${ubezi(p.nivoji[nivo - 1])}" loading="lazy">
          <span class="q-nivo">${nivo}</span>
          <button class="q-menjaj" data-izberi="${ubezi(ime)}" title="Zamenjaj junaka">⤾</button>
          <button class="q-manj" data-tocke="-1" data-ime="${ubezi(ime)}"
                  ${nivo <= 1 ? 'disabled' : ''} title="Nivo nazaj">−</button>
          <button class="q-vec" data-tocke="1" data-ime="${ubezi(ime)}"
                  ${nivo >= NAJVEC_NIVO ? 'disabled' : ''} title="Nivo naprej">+</button>
        </div>
        <div class="q-ime">${ubezi(ime)}</div>
        <div class="q-naziv">${ubezi(p.nivoji[nivo - 1])}</div>
      </div>`;
  },

  /**
   * Velikost celic izračunamo tako, da gredo vsi junaki na zaslon brez drsenja.
   * Preizkusimo vsako število stolpcev in obdržimo tisto z največjo celico.
   */
  _razporedi() {
    const mreza = $('#q-mreza');
    const n = mreza.querySelectorAll('.q-kartica').length;
    if (!n) { mreza.style.gridTemplateColumns = ''; return; }

    const razmik = 8;
    const W = mreza.clientWidth, H = mreza.clientHeight;
    if (W < 40 || H < 40) return;

    const samoJunaki = $('#prevzem-quest').classList.contains('samo-junaki');
    const podNapisi = samoJunaki ? 26 : 34;     // višina imena in naziva
    const razmerje = 1;                          // slika je kvadratna

    let naj = { w: 0, st: 1 };
    for (let st = 1; st <= n; st++) {
      const vrst = Math.ceil(n / st);
      const w = (W - razmik * (st - 1)) / st;
      const h = (H - razmik * (vrst - 1)) / vrst;
      const sirina = Math.min(w, (h - podNapisi) * razmerje);
      if (sirina > naj.w) naj = { w: sirina, st };
    }
    if (naj.w <= 0) return;
    mreza.style.gridTemplateColumns = `repeat(${naj.st}, ${Math.floor(naj.w)}px)`;
    mreza.style.gridAutoRows = `${Math.floor(naj.w / razmerje + podNapisi)}px`;
  },

  _poveziKartice() {
    $$('#q-mreza [data-tocke]').forEach(b =>
      b.addEventListener('click', () => this.dodaj(b.dataset.ime, +b.dataset.tocke)));
    $$('#q-mreza [data-izberi]').forEach(b =>
      b.addEventListener('click', () => this.odpriIzbiro(b.dataset.izberi)));
  },

  /** Seznam tistih brez junaka — edina pot do dodelitve, odkar so prazne kartice skrite. */
  odpriDodelitev() {
    const brez = aktivni().filter(u => !this.zapis(u.ime).pot);
    if (!brez.length) { obvesti('Vsi prisotni že imajo junaka.'); return; }
    $('#q-izbira-ime').textContent = '';
    $('#q-izbira-naslov').textContent = 'Kdo dobi junaka?';
    $('#q-izbira-mreza').innerHTML = brez.map(u =>
      `<button class="q-ucenec" data-ucenec="${ubezi(u.ime)}">${ubezi(u.ime)}</button>`).join('');
    $$('#q-izbira-mreza .q-ucenec').forEach(b =>
      b.addEventListener('click', () => this.odpriIzbiro(b.dataset.ucenec)));
    $('#q-izbira').classList.add('vidno');
  },

  /* ---------------- izbira poti ---------------- */
  odpriIzbiro(ime) {
    this.izbiramZa = ime;
    const trenutna = this.zapis(ime).pot;
    $('#q-izbira-naslov').textContent = 'Izberi junaka —';
    $('#q-izbira-ime').textContent = ime;
    $('#q-izbira-mreza').innerHTML = Object.entries(POTI).map(([k, p]) => `
      <button class="q-pot${k === trenutna ? ' on' : ''}" data-pot="${k}" style="--pb:${p.barva}">
        <img class="${p.svojeOzadje ? 'ima-ozadje' : 'brez-ozadja'}" src="${slikaPoti(k, 6)}" alt="" loading="lazy">
        <span class="q-pot-ime">${ubezi(p.ime)}</span>
      </button>`).join('');

    $$('#q-izbira-mreza .q-pot').forEach(b =>
      b.addEventListener('click', () => this.izberiPot(this.izbiramZa, b.dataset.pot)));

    $('#q-izbira').classList.add('vidno');
  },
  zapriIzbiro() { $('#q-izbira').classList.remove('vidno'); this.izbiramZa = null; },

  /** Ogled brez kromiranja: samo junaki in imena, čim večji. */
  preklopiOgled() {
    const el = $('#prevzem-quest');
    const vklop = !el.classList.contains('samo-junaki');
    el.classList.toggle('samo-junaki', vklop);
    if (vklop && !Prevzem.geo.quest?.cel) Prevzem.preklopiCelZaslon();
    this._razporedi();
  },
};
