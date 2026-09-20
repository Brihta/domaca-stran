/* =====================================================================
   Razredni zaslon — večja orodja
   Faza 3: urnik · Faza 4: anketa · Faza 5: miselni vzorec
   ===================================================================== */
'use strict';

/* ==================================================================== *
 * URNIK
 * Ure niso prazna mreža — izhajajo iz šolskega zvonca OŠ Šempeter.
 * ==================================================================== */
const DNEVI_POUK = [
  { k: 'pon', ime: 'Ponedeljek', kratko: 'PON', dan: 1 },
  { k: 'tor', ime: 'Torek',      kratko: 'TOR', dan: 2 },
  { k: 'sre', ime: 'Sreda',      kratko: 'SRE', dan: 3 },
  { k: 'cet', ime: 'Četrtek',    kratko: 'ČET', dan: 4 },
  { k: 'pet', ime: 'Petek',      kratko: 'PET', dan: 5 },
];

/* Slovenske kratice predmetov v OŠ. */
const PREDMETI = [
  '', 'SLJ', 'MAT', 'TJA', 'TJN', 'LUM', 'GUM', 'SPO', 'DRU', 'NAR', 'NIT',
  'GOS', 'TIT', 'ZGO', 'GEO', 'BIO', 'KEM', 'FIZ', 'ŠPO', 'DKE',
  'RU', 'OPB', 'ISP', 'DOD', 'DOP', 'RaP',
];

/* Barva na predmet — da se urnik bere na pogled, ne po črkah. */
const BARVE_PREDMETOV = {
  SLJ:'#E23B26', MAT:'#2266FF', TJA:'#7A4FBF', TJN:'#9C4FBF',
  LUM:'#E09900', GUM:'#C2185B', SPO:'#0FA3A3', DRU:'#5D8A1F',
  NAR:'#55A51C', NIT:'#3E9B1F', GOS:'#B8860B', TIT:'#6B7280',
  ZGO:'#8B5A2B', GEO:'#0E7C7B', BIO:'#2E8B4A', KEM:'#D4700A',
  FIZ:'#1D6FA5', ŠPO:'#D92D20', DKE:'#7C5CBF', RU:'#767C8C',
  OPB:'#767C8C', ISP:'#4A5FC1', DOD:'#2E9CC9', DOP:'#2E9CC9', RaP:'#C2185B',
};

const Urnik = {
  /** { pon: { '1. ura': 'MAT', ... }, ... } */
  podatki: Shramba.beri('urnik', {}),

  /** Ure iz zvonca brez odmorov — urnik ima toliko vrstic, kot je ur. */
  ure() { return ZVONEC.filter(([ime]) => !jeOdmor(ime)); },

  vpis(dan, ura) { return (this.podatki[dan] || {})[ura] || ''; },

  nastavi(dan, ura, predmet) {
    if (!this.podatki[dan]) this.podatki[dan] = {};
    if (predmet) this.podatki[dan][ura] = predmet;
    else delete this.podatki[dan][ura];
    Shramba.pisi('urnik', this.podatki);
    this.oznaciTrenutno();
  },

  /** Kateri stolpec in vrstica sta zdaj — da se učenci znajdejo. */
  trenutno(zdaj = new Date()) {
    const dan = DNEVI_POUK.find(d => d.dan === zdaj.getDay());
    if (!dan) return { dan: null, ura: null };
    const s = stanjeZvonca(zdaj);
    const ura = this.ure().some(([ime]) => ime === s.num) ? s.num : null;
    return { dan: dan.k, ura };
  },

  izris() {
    const ovoj = $('#urnik-mreza');
    const ure = this.ure();

    const glava = '<div class="u-kot"></div>' +
      DNEVI_POUK.map(d => `<div class="u-dan">${d.kratko}</div>`).join('');

    const vrstice = ure.map(([ime, od, doo]) => {
      const celice = DNEVI_POUK.map(d => {
        const v = this.vpis(d.k, ime);
        const barva = BARVE_PREDMETOV[v] || 'transparent';
        return `<div class="u-celica" data-dan="${d.k}" data-ura="${ubezi(ime)}">
          <select class="u-izbira" aria-label="${ubezi(d.ime)}, ${ubezi(ime)}"
                  style="--pb:${barva}">${
            PREDMETI.map(p =>
              `<option value="${p}"${p === v ? ' selected' : ''}>${p || '—'}</option>`).join('')
          }</select>
        </div>`;
      }).join('');
      return `<div class="u-ura"><b>${ubezi(ime)}</b><span>${od.replace(':', '.')}–${doo.replace(':', '.')}</span></div>${celice}`;
    }).join('');

    ovoj.innerHTML = glava + vrstice;
    ovoj.style.gridTemplateColumns = `minmax(92px,auto) repeat(${DNEVI_POUK.length},1fr)`;

    ovoj.querySelectorAll('.u-izbira').forEach(s => {
      s.addEventListener('change', e => {
        const c = e.target.closest('.u-celica');
        e.target.style.setProperty('--pb', BARVE_PREDMETOV[e.target.value] || 'transparent');
        this.nastavi(c.dataset.dan, c.dataset.ura, e.target.value);
      });
    });

    this.oznaciTrenutno();
  },

  oznaciTrenutno() {
    const { dan, ura } = this.trenutno();
    $$('#urnik-mreza .u-celica').forEach(c =>
      c.classList.toggle('zdaj', !!dan && c.dataset.dan === dan && c.dataset.ura === ura));
    $$('#urnik-mreza .u-dan').forEach((el, i) =>
      el.classList.toggle('zdaj', DNEVI_POUK[i].k === dan));

    const { dan: d2, ura: u2 } = this.trenutno();
    const vpis = d2 && u2 ? this.vpis(d2, u2) : '';
    $('#urnik-znacka').textContent = vpis
      ? `Zdaj: ${u2} · ${vpis}`
      : (u2 ? `Zdaj: ${u2}` : 'Trenutno ni pouka');
  },

  pocisti() {
    this.podatki = {};
    Shramba.pisi('urnik', {});
    this.izris();
    obvesti('Urnik počiščen.');
  },
};

/* ==================================================================== *
 * ANKETA (ročna)
 * Brez zaledja: učitelj tapka števce, stolpci rastejo.
 * ==================================================================== */
const BARVE_ANKETE = ['#2266FF', '#55A51C', '#E09900', '#E23B26', '#7A4FBF', '#0FA3A3'];

Platno.registriraj('anketa', {
  naslov: 'Anketa',
  velikost: [340, 300],

  izris(telo, zapis) {
    const p = zapis.podatki;
    if (!p.vprasanje) p.vprasanje = 'Kako vam je šlo?';
    if (!p.moznosti) p.moznosti = [
      { ime: 'Lahko',  st: 0 },
      { ime: 'V redu', st: 0 },
      { ime: 'Težko',  st: 0 },
    ];

    telo.innerHTML = `
      <div class="anketa-vprasanje" contenteditable="true" spellcheck="false"
           data-prazno="Vpiši vprašanje…"></div>
      <div class="anketa-vrstice"></div>
      <div class="anketa-noga">
        <button class="mini a-dodaj" aria-label="Dodaj odgovor">+</button>
        <button class="mini a-manj" aria-label="Odstrani zadnji odgovor">−</button>
        <span style="flex:1"></span>
        <button class="mini a-nic" aria-label="Ponastavi štetje">0</button>
      </div>`;

    const vpr = telo.querySelector('.anketa-vprasanje');
    vpr.textContent = p.vprasanje;
    vpr.addEventListener('input', () => { p.vprasanje = vpr.textContent; shraniStanje(); });

    const risi = () => {
      const najvec = Math.max(1, ...p.moznosti.map(m => m.st));
      telo.querySelector('.anketa-vrstice').innerHTML = p.moznosti.map((m, i) => `
        <div class="anketa-vrstica" data-i="${i}">
          <span class="anketa-ime" contenteditable="true" spellcheck="false">${ubezi(m.ime)}</span>
          <div class="anketa-stolpec">
            <div class="anketa-polnilo" style="width:${(m.st / najvec) * 100}%;
                 background:${BARVE_ANKETE[i % BARVE_ANKETE.length]}"></div>
          </div>
          <span class="anketa-st">${m.st}</span>
          <button class="anketa-manj" aria-label="Odštej pri ${ubezi(m.ime)}">−</button>
        </div>`).join('');

      telo.querySelectorAll('.anketa-vrstica').forEach(v => {
        const i = +v.dataset.i;
        // klik kamorkoli po vrstici prišteje — hitro med uro
        v.addEventListener('click', e => {
          if (e.target.closest('.anketa-manj') || e.target.closest('[contenteditable]')) return;
          p.moznosti[i].st++; shraniStanje(); risi();
        });
        v.querySelector('.anketa-manj').addEventListener('click', () => {
          p.moznosti[i].st = Math.max(0, p.moznosti[i].st - 1); shraniStanje(); risi();
        });
        const ime = v.querySelector('.anketa-ime');
        ime.addEventListener('input', () => { p.moznosti[i].ime = ime.textContent; shraniStanje(); });
      });
    };

    telo.querySelector('.a-dodaj').addEventListener('click', () => {
      if (p.moznosti.length >= 6) { obvesti('Največ šest odgovorov.'); return; }
      p.moznosti.push({ ime: 'Odgovor ' + (p.moznosti.length + 1), st: 0 });
      shraniStanje(); risi();
    });
    telo.querySelector('.a-manj').addEventListener('click', () => {
      if (p.moznosti.length <= 2) { obvesti('Vsaj dva odgovora.'); return; }
      p.moznosti.pop(); shraniStanje(); risi();
    });
    telo.querySelector('.a-nic').addEventListener('click', () => {
      p.moznosti.forEach(m => m.st = 0); shraniStanje(); risi();
    });

    risi();
  },
});

/* ==================================================================== *
 * MISELNI VZOREC
 * Vozlišča + povezave. Vlečenje, urejanje besedila, barve.
 * ==================================================================== */
const BARVE_VOZLISC = ['#2266FF', '#55A51C', '#E09900', '#E23B26', '#7A4FBF', '#0FA3A3', '#C2185B'];

const Miselni = {
  vozlisca: Shramba.beri('miselniVozlisca', []),   // [{id,x,y,besedilo,barva}]
  povezave: Shramba.beri('miselniPovezave', []),   // [[id1,id2]]
  izbran: null,
  povezujem: null,

  shrani() {
    Shramba.pisi('miselniVozlisca', this.vozlisca);
    Shramba.pisi('miselniPovezave', this.povezave);
  },

  dodaj(besedilo = 'Nova ideja', sredisce = false) {
    const p = $('#miselni-polje');
    const st = this.vozlisca.length;
    this.vozlisca.push({
      id: novId(),
      x: sredisce ? p.clientWidth / 2 - 70 : 40 + (st % 6) * 120 + Math.random() * 30,
      y: sredisce ? p.clientHeight / 2 - 26 : 40 + Math.floor(st / 6) * 96 + Math.random() * 20,
      besedilo,
      barva: BARVE_VOZLISC[st % BARVE_VOZLISC.length],
    });
    this.shrani(); this.izris();
  },

  odstrani(id) {
    this.vozlisca = this.vozlisca.filter(v => v.id !== id);
    this.povezave = this.povezave.filter(([a, b]) => a !== id && b !== id);
    if (this.izbran === id) this.izbran = null;
    this.shrani(); this.izris();
  },

  preklopiPovezavo(a, b) {
    const i = this.povezave.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
    if (i >= 0) this.povezave.splice(i, 1);
    else this.povezave.push([a, b]);
    this.shrani(); this.izris();
  },

  pocisti() {
    this.vozlisca = []; this.povezave = []; this.izbran = null;
    this.shrani(); this.izris();
    obvesti('Miselni vzorec počiščen.');
  },

  izris() {
    const polje = $('#miselni-polje');
    const crte = $('#miselni-crte');

    // povezave najprej, da so pod vozlišči
    crte.innerHTML = this.povezave.map(([a, b]) => {
      const va = this.vozlisca.find(v => v.id === a);
      const vb = this.vozlisca.find(v => v.id === b);
      if (!va || !vb) return '';
      return `<line x1="${va.x + 70}" y1="${va.y + 26}" x2="${vb.x + 70}" y2="${vb.y + 26}"
                    stroke="rgba(35,38,47,.28)" stroke-width="2.5" stroke-linecap="round"/>`;
    }).join('');

    polje.querySelectorAll('.mv-vozlisce').forEach(e => e.remove());

    this.vozlisca.forEach(v => {
      const el = document.createElement('div');
      el.className = 'mv-vozlisce' + (this.izbran === v.id ? ' izbran' : '')
                   + (this.povezujem === v.id ? ' povezujem' : '');
      el.dataset.id = v.id;
      el.style.cssText = `left:${v.x}px; top:${v.y}px; --vb:${v.barva}`;
      el.innerHTML = `
        <span class="mv-besedilo" contenteditable="true" spellcheck="false">${ubezi(v.besedilo)}</span>
        <button class="mv-brisi" aria-label="Izbriši vozlišče">×</button>`;
      polje.appendChild(el);

      const bes = el.querySelector('.mv-besedilo');
      bes.addEventListener('input', () => {
        v.besedilo = bes.textContent; this.shrani();
      });
      bes.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); bes.blur(); }
      });

      el.querySelector('.mv-brisi').addEventListener('click', e => {
        e.stopPropagation(); this.odstrani(v.id);
      });

      this._vlecenje(el, v);
    });

    $('#miselni-znacka').textContent =
      `${this.vozlisca.length} vozlišč · ${this.povezave.length} povezav`;
    $('#miselni-namig').textContent = this.povezujem
      ? 'Klikni drugo vozlišče, da ju povežeš (ali isto, da prekličeš).'
      : 'Vleci za premik · klikni besedilo za urejanje · „Poveži" za črto med dvema.';
  },

  _vlecenje(el, v) {
    let zx = 0, zy = 0, sx = 0, sy = 0, vlecem = false, premaknil = false;

    el.addEventListener('pointerdown', e => {
      if (e.target.closest('.mv-brisi')) return;
      if (e.target.closest('.mv-besedilo') && document.activeElement === e.target) return;
      vlecem = true; premaknil = false;
      el.setPointerCapture(e.pointerId);
      zx = e.clientX; zy = e.clientY; sx = v.x; sy = v.y;
    });

    el.addEventListener('pointermove', e => {
      if (!vlecem) return;
      const dx = e.clientX - zx, dy = e.clientY - zy;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) premaknil = true;
      const p = $('#miselni-polje');
      v.x = Math.min(Math.max(0, sx + dx), p.clientWidth - 150);
      v.y = Math.min(Math.max(0, sy + dy), p.clientHeight - 54);
      el.style.left = v.x + 'px'; el.style.top = v.y + 'px';
      this.izrisCrt();
    });

    const konec = e => {
      if (!vlecem) return;
      vlecem = false;
      try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      if (premaknil) { this.shrani(); return; }

      // klik brez premika: izbira ali povezovanje
      if (this.povezujem && this.povezujem !== v.id) {
        this.preklopiPovezavo(this.povezujem, v.id);
        this.povezujem = null;
      } else if (this.povezujem === v.id) {
        this.povezujem = null;
      } else {
        this.izbran = this.izbran === v.id ? null : v.id;
      }
      this.izris();
    };
    el.addEventListener('pointerup', konec);
    el.addEventListener('pointercancel', konec);
  },

  /** Samo črte — med vlečenjem, da ne rišemo vsega znova. */
  izrisCrt() {
    $('#miselni-crte').innerHTML = this.povezave.map(([a, b]) => {
      const va = this.vozlisca.find(v => v.id === a);
      const vb = this.vozlisca.find(v => v.id === b);
      if (!va || !vb) return '';
      return `<line x1="${va.x + 70}" y1="${va.y + 26}" x2="${vb.x + 70}" y2="${vb.y + 26}"
                    stroke="rgba(35,38,47,.28)" stroke-width="2.5" stroke-linecap="round"/>`;
    }).join('');
  },

  zacniPovezovanje() {
    if (!this.izbran) { obvesti('Najprej klikni vozlišče, ki ga želiš povezati.'); return; }
    this.povezujem = this.izbran;
    this.izbran = null;
    this.izris();
  },
};
