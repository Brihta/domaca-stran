/* =====================================================================
   Razredni zaslon — razporejevalnik skupin
   Logika je prenesena iz index.html, da se obnašanje ujema:
   Fisher–Yates mešanje, razporeditev po ostanku, pravila "ne skupaj".
   ===================================================================== */
'use strict';

const BARVE_SKUPIN = ['#2266FF','#55A51C','#E09900','#E23B26','#7A4FBF','#0FA3A3','#C2185B','#5D8A1F'];

const TEME = {
  stevilke: { ime: '🔢 Številke',        imena: null },
  vrhovi:   { ime: '🏔️ Slovenski vrhovi', imena: ['Triglav','Stol','Krn','Grintovec','Škrlatica','Storžič','Mangart','Kanin','Porezen','Blegoš','Golica','Snežnik'] },
  reke:     { ime: '🏞️ Slovenske reke',   imena: ['Sava','Soča','Drava','Mura','Krka','Kolpa','Savinja','Idrijca','Vipava','Ljubljanica','Reka','Pesnica'] },
  barve:    { ime: '🎨 Barve',           imena: ['Rdeča','Modra','Zelena','Rumena','Vijolična','Oranžna','Turkizna','Roza'] },
  zivali:   { ime: '🦁 Živali',          imena: ['Levi','Tigri','Medvedi','Volkovi','Orli','Sokoli','Risi','Jeleni'] },
};

const Skupine = {
  tema: Shramba.beri('tema', 'stevilke'),
  neSkupaj: Shramba.beri('neSkupaj', []),   // [[id1,id2], ...]
  zadnje: [],

  mesaj(polje) {
    const a = [...polje];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  /** Poskusi razdružiti pare, ki ne smejo biti skupaj. */
  razdruzi(skupine) {
    if (!this.neSkupaj.length || skupine.length < 2) return skupine;
    const idIme = new Map(Stanje.seznam.map(u => [u.id, u.ime]));
    const pari = this.neSkupaj
      .map(([a, b]) => [idIme.get(a), idIme.get(b)])
      .filter(([a, b]) => a && b);
    if (!pari.length) return skupine;

    for (let poskus = 0; poskus < 60; poskus++) {
      let krsitev = false;
      for (const [n1, n2] of pari) {
        const i = skupine.findIndex(g => g.includes(n1) && g.includes(n2));
        if (i === -1) continue;
        krsitev = true;
        const vrstniRed = this.mesaj(skupine.map((_, k) => k).filter(k => k !== i));
        let cilj = vrstniRed.find(k => !skupine[k].includes(n1) && !skupine[k].includes(n2));
        if (cilj === undefined) cilj = vrstniRed[0];
        if (cilj === undefined) break;
        const odKod = skupine[i].indexOf(n2);
        const kam   = Math.floor(Math.random() * skupine[cilj].length);
        [skupine[i][odKod], skupine[cilj][kam]] = [skupine[cilj][kam], skupine[i][odKod]];
      }
      if (!krsitev) return skupine;
    }
    return skupine;
  },

  ustvari() {
    const a = aktivni();
    if (a.length < 2) { obvesti('Potrebujem vsaj 2 prisotna učenca.'); return; }

    const mesano = this.mesaj(a.map(u => u.ime));
    const velikost = Math.max(2, Math.min(Stanje.velikost, mesano.length));
    const stSkupin = Math.max(1, Math.round(mesano.length / velikost));

    let skupine = Array.from({ length: stSkupin }, () => []);
    mesano.forEach((ime, i) => skupine[i % stSkupin].push(ime));
    skupine = this.razdruzi(skupine);

    this.zadnje = skupine;
    this.izris();
    Prevzem.odpri('skupine');
  },

  imeSkupine(i) {
    const t = TEME[this.tema];
    if (!t || !t.imena) return 'Skupina ' + (i + 1);
    return t.imena[i % t.imena.length];
  },

  izris() {
    const mreza = $('#skupine-mreza');
    if (!this.zadnje.length) {
      mreza.innerHTML = `<p class="namig">Še ni skupin — klikni „Ustvari skupine".</p>`;
      $('#skupine-znacka').textContent = '';
      return;
    }
    mreza.innerHTML = this.zadnje.map((g, i) => `
      <div class="skupina" style="--sk:${BARVE_SKUPIN[i % BARVE_SKUPIN.length]};animation-delay:${i * 0.04}s">
        <h3><span class="pika"></span>${ubezi(this.imeSkupine(i))}</h3>
        <ul>${g.map(n => `<li>${ubezi(n)}</li>`).join('')}</ul>
      </div>`).join('');

    const povp = (this.zadnje.reduce((s, g) => s + g.length, 0) / this.zadnje.length).toFixed(1).replace('.0', '');
    $('#skupine-znacka').textContent =
      `${Stanje.razred ? Stanje.razred + ' · ' : ''}${this.zadnje.length} skupin po ~${povp}`;
  },
};
