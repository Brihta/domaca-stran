/* =====================================================================
   Razredna pustolovščina — točke in napredovanje junakov
   Vsak učenec izbere svojo pot; točke ga vodijo skozi šest nivojev.
   ===================================================================== */
'use strict';

/** Pragovi so enaki za vse poti. */
const PRAGOVI = [0, 10, 25, 50, 100, 150];

const POTI = {
  zmaj: {
    ime: 'Vodni zmaj', barva: '#2E9CC9',
    nivoji: ['Mladič globin', 'Potočni mladiček', 'Vajenec toka',
             'Pevec plimovanja', 'Vladar voda', 'Nebeški leviatan'],
  },
  feniks: {
    ime: 'Ognjeni feniks', barva: '#E0700A',
    nivoji: ['Iskrica iz jajca', 'Mladi plamen', 'Vajenec ognja',
             'Plameno srce', 'Gospodar žara', 'Veliki ognjeni ptič'],
  },
  skrat: {
    ime: 'Škratji bojevnik', barva: '#8B5A2B',
    nivoji: ['Novinec', 'Vajenec', 'Vojak', 'Veteran', 'Prvak', 'Veliki mojster'],
  },
  alkimist: {
    ime: 'Alkimist', barva: '#7A4FBF',
    nivoji: ['Novinec', 'Pomočnik', 'Izvajalec', 'Poznavalec', 'Mojster', 'Veliki mojster'],
  },
  narava: {
    ime: 'Varuh narave', barva: '#55A51C',
    nivoji: ['Novinec', 'Vajenec', 'Učenec', 'Adept', 'Mojster varuh', 'Nadduhovnik'],
  },
  tat: {
    ime: 'Senčni tat', barva: '#4A5FC1',
    nivoji: ['Novinec', 'Vajenec', 'Učenec', 'Operativec', 'Mojster', 'Veliki mojster'],
  },
  vitez: {
    ime: 'Vitez', barva: '#C2185B',
    nivoji: ['Novinec', 'Pešak', 'Vitez popotnik', 'Stražar', 'Vzorni vitez', 'Veliki paladin'],
  },
  lokostrelka: {
    ime: 'Lokostrelec', barva: '#0FA3A3',
    nivoji: ['Novinec', 'Gozdni vajenec', 'Izvidnik', 'Ostrostrelec',
             'Mojster lokostrelec', 'Veliki lokostrelec'],
  },
  carovnik: {
    ime: 'Čarovnik', barva: '#2266FF',
    nivoji: ['Učenec', 'Vajenec', 'Čarovnikov pomočnik', 'Čarovnik', 'Čarodej', 'Veliki mag'],
  },
};

const slikaPoti = (pot, nivo) => `assets/junaki/${pot}/nivo_${nivo}.jpg`;

/** Nivo (1–6) iz točk. */
function nivoIzTock(tocke) {
  let n = 1;
  for (let i = 0; i < PRAGOVI.length; i++) if (tocke >= PRAGOVI[i]) n = i + 1;
  return n;
}
/** Koliko do naslednjega nivoja in kolikšen delež je že prehojen. */
function napredek(tocke) {
  const n = nivoIzTock(tocke);
  if (n >= PRAGOVI.length) return { nivo: n, delez: 100, doNaslednjega: 0, naslednjiPrag: null };
  const od = PRAGOVI[n - 1], do_ = PRAGOVI[n];
  return {
    nivo: n,
    delez: Math.round(((tocke - od) / (do_ - od)) * 100),
    doNaslednjega: do_ - tocke,
    naslednjiPrag: do_,
  };
}

const Pustolovscina = {
  /** { "7. A": { "Ana": { pot:'zmaj', tocke:35 } } } */
  podatki: Shramba.beri('pustolovscina', {}),
  izbiramZa: null,          // ime učenca, ki mu izbiramo pot

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
    z.tocke = Math.max(0, z.tocke + koliko);
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
    this.zapis(ime).pot = pot;
    this.shrani();
    this.izbiramZa = null;
    this.izris();
    obvesti(`${ime} je izbral pot: ${POTI[pot].ime}`);
  },

  ponastavi(ime) {
    const z = this.zapis(ime);
    z.tocke = 0;
    this.shrani(); this.izris();
  },

  ponastaviVse() {
    const r = Stanje.razred;
    if (!r) return;
    Object.values(this.podatki[r] || {}).forEach(z => z.tocke = 0);
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
        <img class="q-slavje-slika" src="${slikaPoti(pot, nivo)}" alt="">
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
      mreza.innerHTML = `<p class="namig">Najprej odkleni in izberi razred v „Razred".</p>`;
      $('#q-znacka').textContent = '';
      return;
    }

    const ucenci = aktivni();
    mreza.innerHTML = ucenci.map(u => this._kartica(u.ime)).join('');
    this._poveziKartice();

    const skupaj = ucenci.reduce((s, u) => s + this.zapis(u.ime).tocke, 0);
    $('#q-znacka').textContent = `${Stanje.razred} · ${ucenci.length} učencev · ${skupaj} točk skupaj`;
  },

  _kartica(ime) {
    const z = this.zapis(ime);
    if (!z.pot) {
      return `
        <div class="q-kartica brez" data-ime="${ubezi(ime)}">
          <button class="q-izberi" data-izberi="${ubezi(ime)}">
            <span class="q-vprasaj">?</span>
            <span>Izberi junaka</span>
          </button>
          <div class="q-ime">${ubezi(ime)}</div>
        </div>`;
    }

    const p = POTI[z.pot];
    const n = napredek(z.tocke);
    const maks = n.nivo >= 6;
    return `
      <div class="q-kartica" data-ime="${ubezi(ime)}" style="--pb:${p.barva}">
        <div class="q-slika-ovoj">
          <img class="q-slika" src="${slikaPoti(z.pot, n.nivo)}" alt="${ubezi(p.nivoji[n.nivo-1])}" loading="lazy">
          <span class="q-nivo">${n.nivo}</span>
        </div>
        <div class="q-ime">${ubezi(ime)}</div>
        <div class="q-naziv">${ubezi(p.nivoji[n.nivo - 1])}</div>
        <div class="q-crta"><div class="q-polnilo" style="width:${n.delez}%"></div></div>
        <div class="q-tocke">
          <b>${z.tocke}</b>
          <span>${maks ? 'najvišji nivo' : `še ${n.doNaslednjega} do nivoja ${n.nivo + 1}`}</span>
        </div>
        <div class="q-gumbi">
          <button class="q-pt" data-tocke="1"  data-ime="${ubezi(ime)}">+1</button>
          <button class="q-pt" data-tocke="5"  data-ime="${ubezi(ime)}">+5</button>
          <button class="q-pt" data-tocke="10" data-ime="${ubezi(ime)}">+10</button>
          <button class="q-pt manj" data-tocke="-1" data-ime="${ubezi(ime)}" aria-label="Odštej točko">−</button>
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

  /* ---------------- izbira poti ---------------- */
  odpriIzbiro(ime) {
    this.izbiramZa = ime;
    const trenutna = this.zapis(ime).pot;
    $('#q-izbira-ime').textContent = ime;
    $('#q-izbira-mreza').innerHTML = Object.entries(POTI).map(([k, p]) => `
      <button class="q-pot${k === trenutna ? ' on' : ''}" data-pot="${k}" style="--pb:${p.barva}">
        <img src="${slikaPoti(k, 6)}" alt="" loading="lazy">
        <span class="q-pot-ime">${ubezi(p.ime)}</span>
      </button>`).join('');

    $$('#q-izbira-mreza .q-pot').forEach(b =>
      b.addEventListener('click', () => this.izberiPot(this.izbiramZa, b.dataset.pot)));

    $('#q-izbira').classList.add('vidno');
  },
  zapriIzbiro() { $('#q-izbira').classList.remove('vidno'); this.izbiramZa = null; },
};
