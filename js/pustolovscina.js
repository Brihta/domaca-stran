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
    nivoji: ['Mladič globin', 'Potočni mladiček', 'Vajenec toka',
             'Pevec plimovanja', 'Vladar voda', 'Nebeški leviatan'],
  },
  feniks: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Feniks', barva: '#E0700A',
    nivoji: ['Iskrica iz jajca', 'Mladi plamen', 'Vajenec ognja',
             'Plameno srce', 'Gospodar žara', 'Veliki ognjeni ptič'],
  },
  vitez: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Kralj Artur', barva: '#C2185B',
    nivoji: ['Novinec', 'Pešak', 'Vitez popotnik', 'Stražar', 'Vzorni vitez', 'Veliki paladin'],
  },
  skrat: {
    ime: 'Bojevnik Škrat', barva: '#8B5A2B',
    nivoji: ['Novinec', 'Vajenec', 'Vojak', 'Veteran', 'Prvak', 'Veliki mojster'],
  },
  tat: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Hattori Hanzō', barva: '#4A5FC1',
    nivoji: ['Novinec', 'Vajenec', 'Učenec', 'Operativec', 'Mojster', 'Veliki mojster'],
  },
  lokostrelka: {
    ime: 'Strelka Elara', barva: '#0FA3A3',
    nivoji: ['Novinka', 'Gozdna vajenka', 'Izvidnica', 'Ostrostrelka',
             'Mojstrica lokostrelka', 'Velika lokostrelka'],
  },
  narava: {
    ime: 'Varuhinja gozda', barva: '#55A51C',
    nivoji: ['Novinka', 'Vajenka', 'Učenka', 'Adeptka', 'Mojstrica varuhinja', 'Nadduhovnica'],
  },
  vilinec: {
    ime: 'Vilinec Fae', barva: '#2E8B4A',
    nivoji: ['Vilinski otrok', 'Vajenec', 'Gozdni popotnik',
             'Čuvaj logov', 'Vilinski plemič', 'Svetli vilinec'],
  },
  znanstvenica: {
    ime: 'Znanstvenica Elza', barva: '#7A4FBF',
    nivoji: ['Radovednica', 'Pomočnica', 'Raziskovalka',
             'Izumiteljica', 'Mojstrica', 'Velika znanstvenica'],
  },
  carovnik: {
    svojeOzadje: true, pripona: 'jpg',   // slike so celi prizori, ne izrezani liki
    ime: 'Čarovnik Homer', barva: '#2266FF',
    nivoji: ['Učenec', 'Vajenec', 'Čarovnikov pomočnik', 'Čarovnik', 'Čarodej', 'Veliki mag'],
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

    // Brez te poti junaka ne bi bilo mogoče nikomur dodeliti.
    const g = $('#q-dodeli');
    g.classList.toggle('skrit', brezJunaka === 0);
    g.textContent = `Dodeli junaka (${brezJunaka})`;

    $('#q-znacka').textContent =
      `${Stanje.razred} · ${zJunakom.length} junakov` +
      (brezJunaka ? ` · ${brezJunaka} brez` : '');
  },

  _kartica(ime) {
    const z = this.zapis(ime);
    const p = POTI[z.pot];
    const nivo = nivoIzTock(z.tocke);
    const maks = nivo >= NAJVEC_NIVO;
    const JE_BREZ = p.svojeOzadje ? ' ima-ozadje' : ' brez-ozadja';

    const stopnice = Array.from({ length: NAJVEC_NIVO }, (_, i) =>
      `<i class="${i < nivo ? 'on' : ''}"></i>`).join('');

    return `
      <div class="q-kartica" data-ime="${ubezi(ime)}" style="--pb:${p.barva}">
        <div class="q-slika-ovoj${JE_BREZ}">
          <img class="q-slika" src="${slikaPoti(z.pot, nivo)}"
               alt="${ubezi(p.nivoji[nivo - 1])}" loading="lazy">
          <span class="q-nivo">${nivo}</span>
        </div>
        <div class="q-ime">${ubezi(ime)}</div>
        <div class="q-naziv">${ubezi(p.nivoji[nivo - 1])}</div>
        <div class="q-stopnice">${stopnice}</div>
        <div class="q-gumbi">
          <button class="q-pt manj" data-tocke="-1" data-ime="${ubezi(ime)}"
                  ${nivo <= 1 ? 'disabled' : ''} aria-label="Nivo nazaj">−</button>
          <button class="q-pt plus" data-tocke="1" data-ime="${ubezi(ime)}"
                  ${maks ? 'disabled' : ''} aria-label="Nivo naprej">+1</button>
          <button class="q-pt menjaj" data-izberi="${ubezi(ime)}" aria-label="Zamenjaj junaka">⤾</button>
        </div>
      </div>`;
  },

  _poveziKartice() {
    $$('#q-mreza .q-pt[data-tocke]').forEach(b =>
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
};
