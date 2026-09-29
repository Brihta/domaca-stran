/* =====================================================================
   Razredni zaslon — večja orodja
   Anketa · miselni vzorec
   ===================================================================== */
'use strict';

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
    p.pisava = p.pisava || 1;                      // povečava pisave, da se vidi od daleč
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
        <button class="mini a-pisava" data-d="-1" title="Manjša pisava" aria-label="Manjša pisava"><small>A</small>−</button>
        <button class="mini a-pisava" data-d="1"  title="Večja pisava"  aria-label="Večja pisava">A+</button>
        <button class="mini a-nic" aria-label="Ponastavi štetje">0</button>
      </div>`;

    const pisava = () => telo.style.setProperty('--ap', p.pisava);
    pisava();
    telo.querySelectorAll('.a-pisava').forEach(b => b.addEventListener('click', () => {
      p.pisava = Math.round(Math.min(3, Math.max(0.8, p.pisava + b.dataset.d * 0.2)) * 10) / 10;
      pisava(); shraniStanje();
    }));

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
