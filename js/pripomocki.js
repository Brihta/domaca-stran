/* =====================================================================
   Razredni zaslon — pripomočki
   Faza 1: semafor, simboli dela, kocka, besedilo
   Faza 2: ozadje, žreb, slika
   ===================================================================== */
'use strict';

/* ------------------------------------------------------------------ *
 * SEMAFOR — slovenska pravila, ne le barve
 * ------------------------------------------------------------------ */
const SEMAFOR = {
  rdeca:  { ime: 'Tišina',           pod: 'Brez pogovora' },
  rumena: { ime: 'Šepetanje',        pod: 'Tiho, samo s sosedom' },
  zelena: { ime: 'Pogovor dovoljen', pod: 'Delamo in se pogovarjamo' },
};

const Semafor = {
  nastavi(barva) {
    Stanje.semafor = (Stanje.semafor === barva) ? null : barva;
    this.izris();
    Trak.osvezi();
  },
  ugasni() { Stanje.semafor = null; this.izris(); Trak.osvezi(); },

  izris() {
    const b = Stanje.semafor;
    $$('#t-semafor .luc').forEach(l => l.classList.toggle('on', l.dataset.barva === b));
    $('#t-semafor .napis').textContent = b ? SEMAFOR[b].ime : 'Semafor';

    $$('#prevzem-semafor .veliki-luc').forEach(l => l.classList.toggle('on', l.dataset.barva === b));
    $('#semafor-napis').textContent = b ? SEMAFOR[b].ime : 'Izberi barvo';
    $('#semafor-pod').textContent   = b ? SEMAFOR[b].pod : '';
  },
};

/* ------------------------------------------------------------------ *
 * ČASOVNIK — v traku
 * ------------------------------------------------------------------ */
const Casovnik = {
  skupno: 300, ostalo: 300, tece: false, id: null, aktiven: false, zvok: null,

  vklopi(minute = 5) {
    this.aktiven = true;
    this.nastavi(minute);
    Trak.osvezi();
  },
  ugasni() {
    this.ustavi(); this.aktiven = false; Trak.osvezi();
  },
  nastavi(minute) {
    this.ustavi();
    this.skupno = this.ostalo = Math.round(minute * 60);
    this.izris();
  },
  preklopi() { this.tece ? this.ustavi() : this.zacni(); },

  zacni() {
    if (this.ostalo <= 0) this.ostalo = this.skupno;
    // AudioContext ustvarimo ob kliku — pozneje ga brskalnik ne bi dovolil
    if (!this.zvok) { try { this.zvok = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    this.tece = true;
    clearInterval(this.id);
    this.id = setInterval(() => {
      this.ostalo--;
      if (this.ostalo <= 0) { this.ostalo = 0; this.ustavi(); this.konec(); }
      this.izris();
    }, 1000);
    this.izris();
  },
  ustavi() { this.tece = false; clearInterval(this.id); this.izris(); },
  ponastavi() { this.ustavi(); this.ostalo = this.skupno; this.izris(); },

  konec() {
    obvesti('Čas je potekel!');
    $('#t-cas .stevec').classList.add('konec');
    setTimeout(() => $('#t-cas .stevec')?.classList.remove('konec'), 6000);
    this.piskni();
  },
  piskni() {
    if (!this.zvok) return;
    try {
      [0, 0.25, 0.5].forEach(zamik => {
        const o = this.zvok.createOscillator(), g = this.zvok.createGain();
        o.connect(g); g.connect(this.zvok.destination);
        o.frequency.value = 880; o.type = 'sine';
        const t = this.zvok.currentTime + zamik;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.start(t); o.stop(t + 0.2);
      });
    } catch (e) {}
  },

  zapis(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  },
  izris() {
    const el = $('#t-cas .stevec');
    if (!el) return;
    el.textContent = this.zapis(this.ostalo);
    el.classList.toggle('malo', this.ostalo <= 30 && this.ostalo > 0);
    const g = $('#cas-igraj');
    if (g) {
      g.innerHTML = ikona(this.tece ? 'premor' : 'igraj');
      g.setAttribute('aria-label', this.tece ? 'Premor' : 'Začni');
    }
  },
};

/* ------------------------------------------------------------------ *
 * ŽREB — naključni izbor učenca
 * ------------------------------------------------------------------ */
const Zreb = {
  brezPonavljanja: Shramba.beri('zrebBrez', true),
  koliko: 1,

  /** Kdo je še na voljo v tem krogu. */
  naVoljo() {
    const a = aktivni();
    if (!this.brezPonavljanja) return a;
    const ostali = a.filter(u => !Stanje.zrebani.has(u.id));
    return ostali.length ? ostali : a;   // krog je poln -> začni znova
  },

  zrebaj() {
    const a = aktivni();
    if (!a.length) { obvesti('Ni prisotnih učencev — najprej naloži razred.'); return; }

    // nov krog?
    if (this.brezPonavljanja && a.every(u => Stanje.zrebani.has(u.id))) {
      Stanje.zrebani.clear();
      obvesti('Vsi so bili izbrani — začenjam nov krog.');
    }

    const bazen = this.naVoljo();
    const n = Math.min(this.koliko, bazen.length);
    const mesano = bazen.slice().sort(() => Math.random() - 0.5).slice(0, n);

    if (n === 1) {
      this.animiraj(bazen, mesano[0]);
    } else {
      $('#zreb-ime').classList.add('skrit');
      $('#zreb-vec').classList.remove('skrit');
      $('#zreb-vec').innerHTML = mesano.map((u, i) =>
        `<div class="zreb-kartica" style="animation-delay:${i * 0.07}s">${ubezi(u.ime)}</div>`).join('');
      this.zakljuci(mesano);
    }
  },

  animiraj(bazen, zmagovalec) {
    $('#zreb-vec').classList.add('skrit');
    const el = $('#zreb-ime');
    el.classList.remove('skrit');
    let i = 0;
    const vrti = setInterval(() => {
      el.textContent = bazen[Math.floor(Math.random() * bazen.length)].ime;
      if (++i > 13) {
        clearInterval(vrti);
        el.textContent = zmagovalec.ime;
        this.zakljuci([zmagovalec]);
      }
    }, 70);
  },

  zakljuci(izbrani) {
    if (this.brezPonavljanja) izbrani.forEach(u => Stanje.zrebani.add(u.id));
    shraniStanje();
    this.izrisStanja();
  },

  izrisStanja() {
    const a = aktivni();
    const ze = a.filter(u => Stanje.zrebani.has(u.id)).length;
    $('#zreb-stanje').textContent = this.brezPonavljanja
      ? `${ze} / ${a.length} v tem krogu` + (Stanje.razred ? ` · ${Stanje.razred}` : '')
      : (Stanje.razred ? `${Stanje.razred} · ${a.length} prisotnih` : `${a.length} prisotnih`);
    $('#zreb-brez').classList.toggle('on', this.brezPonavljanja);
    $$('#zreb-koliko .zeton').forEach(z => z.classList.toggle('on', +z.dataset.n === this.koliko));
  },

  ponastaviKrog() {
    Stanje.zrebani.clear(); shraniStanje(); this.izrisStanja();
    obvesti('Krog ponastavljen.');
  },
};

/* ------------------------------------------------------------------ *
 * PRIPOMOČKI NA PLATNU
 * ------------------------------------------------------------------ */

/* --- Besedilo --- */
Platno.registriraj('besedilo', {
  naslov: 'Besedilo',
  velikost: [330, 200],
  izris(telo, zapis) {
    const p = zapis.podatki;
    p.velikost = p.velikost || 22;
    telo.innerHTML = `
      <div class="besedilo-orodja">
        <button class="mini manj" aria-label="Manjša pisava">${ikona('minus')}</button>
        <button class="mini vec"  aria-label="Večja pisava">${ikona('plus')}</button>
      </div>
      <div class="pw-besedilo" contenteditable="true" spellcheck="false"
           data-prazno="Klikni in napiši navodila za uro…"></div>`;

    const bes = telo.querySelector('.pw-besedilo');
    bes.textContent = p.besedilo || '';
    bes.style.fontSize = p.velikost + 'px';

    bes.addEventListener('input', () => { p.besedilo = bes.textContent; shraniStanje(); });
    const spremeni = d => {
      p.velikost = Math.min(72, Math.max(12, p.velikost + d));
      bes.style.fontSize = p.velikost + 'px';
      shraniStanje();
    };
    telo.querySelector('.manj').addEventListener('click', () => spremeni(-3));
    telo.querySelector('.vec').addEventListener('click',  () => spremeni(+3));
  },
});

/* --- Kocka --- */
const PIKE = { 1:[5], 2:[1,9], 3:[1,5,9], 4:[1,3,7,9], 5:[1,3,5,7,9], 6:[1,3,4,6,7,9] };

Platno.registriraj('kocka', {
  naslov: 'Kocka',
  velikost: [310, 320],
  izris(telo, zapis) {
    const p = zapis.podatki;
    p.stevilo = p.stevilo || 1;
    p.strani  = p.strani  || 6;
    p.met     = p.met     || [1];

    telo.innerHTML = `
      <div class="besedilo-orodja kocka-orodja">
        <button class="zeton" data-st="1">1</button>
        <button class="zeton" data-st="2">2</button>
        <button class="zeton" data-st="3">3</button>
        <span class="loc"></span>
        <button class="zeton" data-strani="6">d6</button>
        <button class="zeton" data-strani="10">d10</button>
        <button class="zeton" data-strani="20">d20</button>
      </div>
      <div class="kocke"></div>
      <div class="kocka-vsota skrit"></div>
      <button class="gumb gumb-p" style="justify-content:center;margin-top:10px;">Vrzi</button>`;

    const osveziZetone = () => {
      telo.querySelectorAll('[data-st]').forEach(z => z.classList.toggle('on', +z.dataset.st === p.stevilo));
      telo.querySelectorAll('[data-strani]').forEach(z => z.classList.toggle('on', +z.dataset.strani === p.strani));
    };
    const izrisKock = (animiraj) => {
      telo.querySelector('.kocke').innerHTML = p.met.map(v =>
        p.strani === 6
          ? `<div class="kocka pike${animiraj ? ' kotali' : ''}">${
               PIKE[v].map(poz => `<i style="grid-area:${Math.ceil(poz/3)}/${((poz-1)%3)+1}"></i>`).join('')}</div>`
          : `<div class="kocka${animiraj ? ' kotali' : ''}">${v}</div>`
      ).join('');
      const vsota = telo.querySelector('.kocka-vsota');
      const skupaj = p.met.reduce((a, b) => a + b, 0);
      vsota.classList.toggle('skrit', p.met.length < 2);
      vsota.textContent = 'Skupaj: ' + skupaj;
    };
    const vrzi = () => {
      p.met = Array.from({ length: p.stevilo }, () => 1 + Math.floor(Math.random() * p.strani));
      izrisKock(true); shraniStanje();
    };

    telo.querySelectorAll('[data-st]').forEach(z => z.addEventListener('click', () => {
      p.stevilo = +z.dataset.st; osveziZetone(); vrzi();
    }));
    telo.querySelectorAll('[data-strani]').forEach(z => z.addEventListener('click', () => {
      p.strani = +z.dataset.strani; osveziZetone(); vrzi();
    }));
    telo.querySelector('.gumb').addEventListener('click', vrzi);

    osveziZetone(); izrisKock(false);
  },
});

/* --- Slika --- */
Platno.registriraj('slika', {
  naslov: 'Slika',
  velikost: [340, 260],
  izris(telo, zapis) {
    const p = zapis.podatki;
    telo.innerHTML = `<div class="pw-slika"></div>`;
    const polje = telo.querySelector('.pw-slika');

    const pokazi = blob => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(blob);
      img.alt = 'Slika na platnu';
      polje.innerHTML = ''; polje.appendChild(img);
    };

    if (p.slikaId) {
      Slike.vzemi(p.slikaId).then(b => b ? pokazi(b) : polje.innerHTML =
        `<p class="namig">Slike ni več v shrambi.</p>`);
    } else {
      polje.innerHTML = `
        <label class="gumb gumb-s" style="cursor:pointer;">
          ${ikona('slika')} Izberi sliko
          <input type="file" accept="image/*" hidden>
        </label>`;
      polje.querySelector('input').addEventListener('change', async e => {
        const dat = e.target.files[0];
        if (!dat) return;
        if (dat.size > 8 * 1024 * 1024) { obvesti('Slika je prevelika (največ 8 MB).'); return; }
        p.slikaId = novId();
        await Slike.shrani(p.slikaId, dat);
        shraniStanje(); pokazi(dat);
      });
    }
  },
  obBrisu(zapis) { if (zapis.podatki.slikaId) Slike.brisi(zapis.podatki.slikaId); },
});
