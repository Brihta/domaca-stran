/* =====================================================================
   Razredni zaslon — žreb
   Kolo z imeni, kot Bingo (brihta.github.io/bingo), a v oknu na platnu.
   Izbrani ostane na kolesu (utripa), dokler se kolo ne zavrti znova;
   ko ostaneta dva, je drugi končni zmagovalec.
   ===================================================================== */
'use strict';

const BARVE_KOLESA = ['#6366f1', '#14b8a6', '#f43f5e', '#f59e0b', '#8b5cf6', '#06b6d4',
                      '#ec4899', '#10b981', '#3b82f6', '#f97316', '#a855f7', '#eab308'];
const NAJVEC_IMEN = 60;
const TRAJANJE_VRTENJA = 4000;
const VRH = Math.PI * 1.5;                       // kazalec je na vrhu kolesa

const Zreb = {
  imena:     Shramba.beri('zrebImena', []),
  izzrebani: Shramba.beri('zrebIzzrebani', []),  // [{ime, zmagovalec}]
  izloci:    Shramba.beri('zrebIzloci', true),   // Bingo: izbrani gre s kolesa
  zvok:      Shramba.beri('zrebZvok', true),
  seznam:    Shramba.beri('zrebSeznam', true),   // stranski seznam viden
  izRazreda: Shramba.beri('zrebIzRazreda', false),
  kot: 0,
  vrti: false,
  cakajoci: null,                                // indeks izbranega, ki še utripa
  utrip: null,
  avdio: null,

  shrani() {
    Shramba.pisi('zrebImena', this.imena);
    Shramba.pisi('zrebIzzrebani', this.izzrebani);
    Shramba.pisi('zrebIzRazreda', this.izRazreda);
  },

  /* ---------------- imena ---------------- */

  naloziRazred(tiho = false) {
    const a = aktivni();
    if (!a.length) {
      if (!tiho) { obvesti('Najprej izberi razred.'); Plosca.odpri(); }
      return;
    }
    this._pocistiCakajocega();
    $('#zreb-rezultat').innerHTML = '';
    this.imena = a.map(u => u.ime).slice(0, NAJVEC_IMEN);
    this.izzrebani = [];
    this.izRazreda = true;
    this.shrani(); this.izris();
    if (!tiho) obvesti(`Na kolesu: ${this.imena.length} prisotnih`);
  },

  /** Ob spremembi prisotnosti: odsotni gredo s kolesa, prisotni nazaj — izžrebani ne. */
  obSpremembiRazreda(novRazred) {
    if (novRazred) { this.naloziRazred(true); return; }
    if (!this.izRazreda || this.vrti) return;
    this._pocistiCakajocega();
    const ze = new Set(this.izzrebani.map(i => i.ime));
    this.imena = aktivni().map(u => u.ime).filter(ime => !ze.has(ime));
    this.shrani(); this.izris();
  },

  dodaj(besedilo) {
    const nova = besedilo.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
    if (!nova.length) return;
    this._pocistiCakajocega();
    const prostora = NAJVEC_IMEN - this.imena.length;
    if (prostora <= 0) { obvesti(`Največ ${NAJVEC_IMEN} imen.`); return; }
    this.imena.push(...nova.slice(0, prostora));
    this.izRazreda = false;                      // seznam je zdaj ročni — razred ga ne povozi
    this.shrani(); this.izris();
  },

  odstrani(i) {
    if (this.vrti) return;
    this._pocistiCakajocega();
    this.imena.splice(i, 1);
    this.shrani(); this.izris();
  },

  pocisti() {
    if (this.vrti) return;
    $('#zreb-rezultat').innerHTML = '';
    this.cakajoci = null;
    this.imena = []; this.izzrebani = []; this.izRazreda = false;
    this.shrani(); this.izris();
  },

  /** Vse izžrebane vrne na kolo. */
  novKrog() {
    if (this.vrti) return;
    this._pocistiCakajocega();
    const nazaj = this.izzrebani.map(i => i.ime).filter(ime => !this.imena.includes(ime));
    this.imena.push(...nazaj);
    $('#zreb-rezultat').innerHTML = '';
    this.izzrebani = [];
    this.shrani(); this.izris();
  },

  /* ---------------- vrtenje ---------------- */

  zavrti() {
    if (this.vrti) return;
    this._pocistiCakajocega();
    if (!this.imena.length) {
      obvesti(this.izzrebani.length ? 'Kolo je prazno — „Vrni vse na kolo" za nov krog.'
                                    : 'Dodaj imena ali naloži razred.');
      return;
    }
    if (!this.avdio) { try { this.avdio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }

    this.vrti = true;
    $('#zreb-rezultat').innerHTML = '';
    this._osveziGumb();

    const n = this.imena.length, rezina = Math.PI * 2 / n;
    // Najprej naključno izberemo zmagovalca, nato izračunamo, kam naj se kolo ustavi.
    const cilj = Math.floor(Math.random() * n);
    const ciljniKot = VRH - (cilj * rezina + rezina * (0.15 + Math.random() * 0.7));
    const zacetek = this.kot;
    const normalno = ((ciljniKot - zacetek) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const skupaj = (7 + Math.random() * 3) * Math.PI * 2 + normalno;

    const t0 = performance.now();
    let zadnjiTik = zacetek;
    const korak = t => {
      const napredek = Math.min((t - t0) / TRAJANJE_VRTENJA, 1);
      const upocasni = 1 - Math.pow(1 - napredek, 3);
      this.kot = zacetek + upocasni * skupaj;
      if (this.kot - zadnjiTik >= rezina) { zadnjiTik = this.kot; this._tik(1 - upocasni); }
      this.izrisKolesa();
      if (napredek < 1) requestAnimationFrame(korak);
      else this._izberi();
    };
    requestAnimationFrame(korak);
  },

  _izberi() {
    const n = this.imena.length, rezina = Math.PI * 2 / n;
    const kot = ((VRH - this.kot) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    const i = Math.floor(kot / rezina) % n;
    const ime = this.imena[i];

    this.vrti = false;
    this.izzrebani.push({ ime, zmagovalec: false });
    this.cakajoci = i;
    this._zacniUtrip();
    this._pokaziRezultat(ime);

    // Bingo: ko sta ostala dva in je eden izbran, je drugi končni zmagovalec.
    if (this.izloci && n === 2) {
      this.vrti = true;                          // med razkritjem se ne vrti
      setTimeout(() => {
        this.vrti = false;
        this._pocistiCakajocega();
        const zmagovalec = this.imena[0];
        if (!zmagovalec) return;
        this.izzrebani.push({ ime: zmagovalec, zmagovalec: true });
        this.imena = [];
        this.shrani(); this.izris();
        $('#zreb-rezultat').innerHTML =
          `<span class="zr-rez-napis">Končni zmagovalec</span><span class="zr-rez-ime zlato">${ubezi(zmagovalec)}</span>`;
        this._fanfara();
        ognjemet();
      }, 2000);
    }
    this.shrani(); this.izris();
  },

  _pokaziRezultat(ime) {
    $('#zreb-rezultat').innerHTML =
      `<span class="zr-rez-napis">Izbran je</span><span class="zr-rez-ime">${ubezi(ime)}</span>`;
  },

  /** Izbrani, ki je utripal, gre s kolesa (če je izločanje vklopljeno). */
  _pocistiCakajocega() {
    if (this.cakajoci === null) return;
    if (this.izloci && this.cakajoci < this.imena.length) this.imena.splice(this.cakajoci, 1);
    this.cakajoci = null;
    cancelAnimationFrame(this.utrip); this.utrip = null;
    $('#zreb-rezultat').innerHTML = '';
    this.shrani();
  },

  _zacniUtrip() {
    cancelAnimationFrame(this.utrip);
    const zanka = () => {
      if (this.cakajoci === null) return;
      this.izrisKolesa();
      this.utrip = requestAnimationFrame(zanka);
    };
    this.utrip = requestAnimationFrame(zanka);
  },

  /* ---------------- zvok ---------------- */

  _tik(hitrost) {
    if (!this.zvok || !this.avdio) return;
    const a = this.avdio, o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(800, a.currentTime);
    g.gain.setValueAtTime(0.08 * Math.max(0.15, hitrost), a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.05);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + 0.05);
  },

  _fanfara() {
    if (!this.zvok || !this.avdio) return;
    const a = this.avdio;
    [[0, 523.25], [0.15, 659.25], [0.3, 783.99]].forEach(([t, f]) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f, a.currentTime + t);
      g.gain.setValueAtTime(0, a.currentTime + t);
      g.gain.linearRampToValueAtTime(0.15, a.currentTime + t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + t + 0.5);
      o.connect(g); g.connect(a.destination);
      o.start(a.currentTime + t); o.stop(a.currentTime + t + 0.5);
    });
  },

  /* ---------------- izris ---------------- */

  /** Kolo zapolni ves prostor, ki ga ima v oknu — ob vsaki spremembi velikosti. */
  izrisKolesa() {
    const ovoj = $('#zreb-kolo'), platno = $('#zreb-platno');
    if (!ovoj.offsetParent) return;              // okno je zaprto
    const vel = Math.floor(Math.min(ovoj.clientWidth, ovoj.clientHeight));
    if (vel < 40) return;
    ovoj.style.setProperty('--kolo', vel + 'px');   // kazalec sede na rob kolesa
    const dpr = window.devicePixelRatio || 1;
    if (platno.width !== vel * dpr) {
      platno.width = platno.height = vel * dpr;
      platno.style.width = platno.style.height = vel + 'px';
    }
    const c = platno.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = vel / 2;
    c.clearRect(0, 0, vel, vel);

    const n = this.imena.length;
    if (!n) {
      c.fillStyle = '#EEF1F7';
      c.beginPath(); c.arc(r, r, r - 1, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#767C8C';
      c.font = `700 ${Math.max(13, r * 0.09)}px "Open Sans", sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(this.izzrebani.length ? 'Vsi so izžrebani' : 'Dodaj imena', r, r);
      return;
    }

    const rezina = Math.PI * 2 / n;
    for (let i = 0; i < n; i++) {
      const od = i * rezina + this.kot;
      c.fillStyle = BARVE_KOLESA[i % BARVE_KOLESA.length];
      c.beginPath(); c.moveTo(r, r); c.arc(r, r, r - 1, od, od + rezina); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 1.25; c.stroke();

      if (this.cakajoci === i) {
        const utrip = 0.5 + 0.5 * Math.sin(Date.now() / 250);
        c.save();
        c.shadowColor = '#fbbf24'; c.shadowBlur = 20 + utrip * 20;
        c.strokeStyle = '#fbbf24'; c.lineWidth = 5 + utrip * 4;
        c.stroke();
        c.restore();
      }
      this._napis(c, i, od, rezina, r, n);
    }

    // rob za globino
    const senca = c.createRadialGradient(r, r, r * 0.78, r, r, r);
    senca.addColorStop(0, 'rgba(0,0,0,0)'); senca.addColorStop(1, 'rgba(0,0,0,.22)');
    c.fillStyle = senca; c.beginPath(); c.arc(r, r, r - 1, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = 2;
    c.beginPath(); c.arc(r, r, r - 2, 0, Math.PI * 2); c.stroke();

    // pesto na sredini
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(r, r, Math.max(10, r * 0.09), 0, Math.PI * 2); c.fill();
  },

  _napis(c, i, od, rezina, r, n) {
    const ime = this.imena[i];
    const sredina = od + rezina / 2;
    // na levi polovici kolesa napis obrnemo, da ni na glavo
    const obrni = Math.cos(sredina) < 0;
    c.save();
    c.translate(r, r);
    c.rotate(obrni ? sredina + Math.PI : sredina);
    c.textAlign = obrni ? 'left' : 'right'; c.textBaseline = 'middle';
    c.fillStyle = '#fff';
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 5; c.shadowOffsetY = 1;
    // velikost pisave glede na kolo, število rezin in dolžino imena
    const visinaRezine = 2 * r * 0.62 * Math.sin(rezina / 2);
    let pisava = Math.min(r * 0.085, visinaRezine * 0.62, 34);
    const sirina = r * 0.66;
    c.font = `700 ${pisava}px "Open Sans", sans-serif`;
    const w = c.measureText(ime).width;
    if (w > sirina) pisava = Math.max(8, pisava * sirina / w);
    c.font = `700 ${pisava}px "Open Sans", sans-serif`;
    c.fillText(ime, obrni ? -r * 0.9 : r * 0.9, 0);
    c.restore();
  },

  _osveziGumb() {
    $('#zreb-gumb').disabled = this.vrti;
    $('#zreb-gumb').textContent = this.vrti ? 'Vrti se …' : 'Zavrti!';
  },

  izris() {
    $('#zreb-st-imena').textContent = this.imena.length;
    $('#zreb-st-izzrebani').textContent = this.izzrebani.length;
    $('#zreb-stanje').textContent = this.imena.length || this.izzrebani.length
      ? `${this.imena.length} na kolesu · ${this.izzrebani.length} izžrebanih`
      : 'Kolo je prazno';

    $('#zreb-imena').innerHTML = this.imena.length
      ? this.imena.map((ime, i) => `
          <span class="zr-ime${this.cakajoci === i ? ' izbran' : ''}" style="--b:${BARVE_KOLESA[i % BARVE_KOLESA.length]}">
            ${ubezi(ime)}<button data-i="${i}" aria-label="Odstrani ${ubezi(ime)}">×</button>
          </span>`).join('')
      : `<p class="namig">${Stanje.razred ? 'Klikni „Naloži razred" ali vpiši imena.' : 'Vpiši imena ali v nastavitvah izberi razred.'}</p>`;

    $('#zreb-izzrebani').innerHTML = this.izzrebani.map(p =>
      `<li class="${p.zmagovalec ? 'zmagovalec' : ''}">${ubezi(p.ime)}${p.zmagovalec ? ' 🏆' : ''}</li>`).join('')
      || '<p class="namig">Še nihče ni bil izžreban.</p>';

    $('#zreb-izloci').checked = this.izloci;
    $('#zreb-zvok').innerHTML = ikona(this.zvok ? 'zvok' : 'tiho');
    $('#zreb-zvok').title = this.zvok ? 'Izklopi zvok' : 'Vklopi zvok';
    $('#zreb-seznam-gumb').innerHTML = ikona('seznam');
    $('#zreb-seznam-gumb').classList.toggle('on', this.seznam);
    $('#prevzem-zreb').classList.toggle('brez-seznama', !this.seznam);
    this._osveziGumb();
    this.izrisKolesa();
  },

  povezi() {
    $('#zreb-gumb').addEventListener('click', () => this.zavrti());
    $('#zreb-dodaj').addEventListener('click', () => { this.dodaj($('#zreb-vnos').value); $('#zreb-vnos').value = ''; });
    $('#zreb-vnos').addEventListener('keydown', e => {
      if (e.key === 'Enter') { this.dodaj(e.target.value); e.target.value = ''; }
    });
    $('#zreb-imena').addEventListener('click', e => {
      const b = e.target.closest('button[data-i]');
      if (b) this.odstrani(+b.dataset.i);
    });
    $('#zreb-razred').addEventListener('click', () => this.naloziRazred());
    $('#zreb-pocisti').addEventListener('click', () => this.pocisti());
    $('#zreb-nov-krog').addEventListener('click', () => this.novKrog());
    $('#zreb-izloci').addEventListener('change', e => {
      this._pocistiCakajocega();
      this.izloci = e.target.checked;
      Shramba.pisi('zrebIzloci', this.izloci);
      this.izris();
    });
    $('#zreb-zvok').addEventListener('click', () => {
      this.zvok = !this.zvok; Shramba.pisi('zrebZvok', this.zvok); this.izris();
    });
    $('#zreb-seznam-gumb').addEventListener('click', () => {
      this.seznam = !this.seznam; Shramba.pisi('zrebSeznam', this.seznam); this.izris();
    });
    $$('.zr-zavihek').forEach(z => z.addEventListener('click', () => {
      $$('.zr-zavihek').forEach(x => x.classList.toggle('on', x === z));
      $$('[data-plosca-zreb]').forEach(p => p.classList.toggle('skrit', p.dataset.ploscaZreb !== z.dataset.zavihek));
    }));

    // Prvič odprt žreb brez imen: vzemi prisotne iz izbranega razreda.
    if (!this.imena.length && !this.izzrebani.length) this.naloziRazred(true);
    this.izris();
  },
};

/* ------------------------------------------------------------------ *
 * OGNJEMET — za končnega zmagovalca
 * ------------------------------------------------------------------ */
function ognjemet() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ovoj = document.createElement('div');
  ovoj.className = 'ognjemet';
  document.body.appendChild(ovoj);
  const barve = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffa07a', '#f7dc6f', '#bb8fce', '#85c1e2'];

  for (let k = 0; k < 15; k++) {
    setTimeout(() => {
      const x = Math.random() * innerWidth;
      const y = innerHeight * (0.1 + Math.random() * 0.6);
      const barva = barve[Math.floor(Math.random() * barve.length)];
      for (let i = 0; i < 30; i++) {
        const d = document.createElement('i');
        d.style.cssText = `left:${x}px;top:${y}px;background:${barva};box-shadow:0 0 10px ${barva}`;
        ovoj.appendChild(d);
        const kot = Math.PI * 2 * i / 30, hitrost = 100 + Math.random() * 100;
        const vx = Math.cos(kot) * hitrost, vy = Math.sin(kot) * hitrost;
        let px = x, py = y;
        const t0 = performance.now();
        const let_ = t => {
          const s = (t - t0) / 1000, zivljenje = Math.max(0, 1 - s / 1.5);
          if (!zivljenje) { d.remove(); return; }
          px += vx * 0.016; py += vy * 0.016 + 100 * s;
          d.style.transform = `translate(${px - x}px,${py - y}px) scale(${zivljenje})`;
          d.style.opacity = zivljenje;
          requestAnimationFrame(let_);
        };
        requestAnimationFrame(let_);
      }
    }, k * 200);
  }
  setTimeout(() => ovoj.remove(), 4200);
}
