/* =====================================================================
   Razredni zaslon — aktualne povezave
   Povezava, dodana na eni napravi, se v živo pokaže na vseh drugih.
   Isti Firebase kot stara stran brihta.github.io/sola — seznam je skupen.
   Datoteke (PDF, slike …) so shranjene posebej, v seznamu je le njihov opis,
   da se seznam naloži takoj; vsebina se prenese šele ob kliku.
   Pošlješ lahko tudi samo besedilo — ob kliku se kopira v odložišče.
   ===================================================================== */
'use strict';

const Povezave = (() => {
  const BAZA = 'https://brihta-455eb-default-rtdb.europe-west1.firebasedatabase.app';
  const DB = `${BAZA}/brihta_feed`;
  const DATOTEKE = `${BAZA}/brihta_datoteke`;
  const MAPE = `${BAZA}/brihta_mape`;          // skupni seznam map, enak na vseh napravah
  const RAZNO = 'Razno';                        // vedno obstaja; sem gre vse brez mape
  const NAJVEC_MB = 8;
  /** Dovoljene vrste. PDF in slike se odprejo v zavihku, Word in Excel se prenesejo. */
  const VRSTE = {
    pdf:  { tip: 'application/pdf', zavihek: true },
    jpg:  { tip: 'image/jpeg', zavihek: true },
    jpeg: { tip: 'image/jpeg', zavihek: true },
    png:  { tip: 'image/png', zavihek: true },
    doc:  { tip: 'application/msword' },
    docx: { tip: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    xls:  { tip: 'application/vnd.ms-excel' },
    xlsx: { tip: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  };
  // vrsto prepoznamo po končnici — Windows pri Wordu in Excelu včasih ne pove tipa
  const koncnica = ime => (ime.match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
  // stara stran (/sola) pozna le povezave — tam datoteka odpre to stran
  const TA_STRAN = 'https://brihta.github.io/domaca-stran/';

  let postavke = [];
  let mape = ['Sv. pop', 'Rač', RAZNO];
  let izbranaMapa = Shramba.beri('povMapa', 'vse');   // filter, zapomni si ga vsaka naprava
  /** Postavka brez mape ali v izbrisani mapi spada v Razno. */
  const mapaOd = p => mape.includes(p.mapa) ? p.mapa : RAZNO;
  let urejam = false;
  let samoBesedilo = false;   // način vnosa: povezava ali golo besedilo
  let tok = null;       // EventSource, odprt le, ko je plošča odprta

  const vSeznam = podatki => podatki
    ? Object.entries(podatki).map(([k, v]) => ({ _key: k, ...v })).sort((a, b) => a.ts - b.ts)
    : [];

  function postavkaHtml(p) {
    // med urejanjem postavka ni povezava — da klik na izbiro mape ne odpre strani
    const oznaka = urejam ? 'div' : 'a';
    const premakni = urejam
      ? `<select class="izbirnik pov-premakni" data-kljuc="${ubezi(p._key)}" aria-label="Premakni v mapo">
           ${mape.map(m => `<option${m === mapaOd(p) ? ' selected' : ''}>${ubezi(m)}</option>`).join('')}</select>` : '';
    const brisi = `<button class="pov-brisi" data-kljuc="${ubezi(p._key)}" aria-label="Izbriši">${ikona('zapri')}</button>`;
    if (p.besedilo != null) return `
      <div class="pov-postavka pov-zapis" data-besedilo="${ubezi(p._key)}" ${urejam ? '' : 'title="Klikni za kopiranje"'}>
        <span class="pov-ikona">${ikona('besedilo')}</span>
        <span class="pov-besedilo"><span class="pov-besedilo-vsebina">${ubezi(p.besedilo)}</span></span>
        <span class="pov-puscica">${ikona('kopiraj')}</span>${premakni}${brisi}
      </div>`;
    if (p.datoteka) return `
      <${oznaka} class="pov-postavka pov-datoteka" ${urejam ? '' : 'href="#"'} data-datoteka="${ubezi(p.datoteka)}"
         data-ime="${ubezi(p.ime || 'datoteka')}" data-tip="${ubezi(p.tip || '')}">
        <span class="pov-ikona">${ikona('sponka')}</span>
        <span class="pov-besedilo">
          <span class="pov-opis">${ubezi(p.desc || p.ime || '')}</span>
          <span class="pov-url">${ubezi(opisDatoteke(p))}</span>
        </span>
        <span class="pov-puscica">›</span>${premakni}${brisi}
      </${oznaka}>`;
    let gostitelj = p.url;
    try { gostitelj = new URL(p.url).hostname.replace(/^www\./, ''); } catch (_) {}
    return `
      <${oznaka} class="pov-postavka" ${urejam ? '' : `href="${ubezi(p.url)}" target="_blank" rel="noopener noreferrer"`}>
        <span class="pov-besedilo">
          <span class="pov-opis">${ubezi(p.desc || '')}</span>
          <span class="pov-url">${ubezi(gostitelj)}</span>
        </span>
        <span class="pov-puscica">›</span>${premakni}${brisi}
      </${oznaka}>`;
  }

  function izris() {
    if (izbranaMapa !== 'vse' && !mape.includes(izbranaMapa)) izbranaMapa = 'vse';
    const seznam = $('#pov-seznam');
    seznam.classList.toggle('urejam', urejam);
    $('#pov-pika').classList.toggle('skrit', !postavke.length);

    // gumbi map s številom postavk; med urejanjem še × in + Mapa
    const koliko = m => postavke.filter(p => mapaOd(p) === m).length;
    $('#pov-mape').innerHTML =
      `<button class="pov-mapa${izbranaMapa === 'vse' ? ' on' : ''}" data-mapa="vse">Vse <b>${postavke.length}</b></button>` +
      mape.map(m => `
        <button class="pov-mapa${izbranaMapa === m ? ' on' : ''}" data-mapa="${ubezi(m)}">${ubezi(m)} <b>${koliko(m)}</b>${
          urejam && m !== RAZNO ? `<span class="pov-mapa-brisi" data-brisi-mapo="${ubezi(m)}" aria-label="Izbriši mapo">×</span>` : ''}</button>`).join('') +
      (urejam ? '<button class="pov-mapa pov-nova-mapa" id="pov-nova-mapa">+ Mapa</button>' : '');

    // mapa, v katero gre nova povezava: odprta mapa, sicer Razno
    const cilj = $('#pov-cilj');
    cilj.innerHTML = mape.map(m => `<option>${ubezi(m)}</option>`).join('');
    cilj.value = izbranaMapa !== 'vse' ? izbranaMapa : RAZNO;

    const novejsePrej = [...postavke].reverse();
    if (izbranaMapa === 'vse') {
      seznam.innerHTML = mape.map(m => {
        const v = novejsePrej.filter(p => mapaOd(p) === m);
        return v.length ? `<h4 class="pov-naslov">${ubezi(m)}</h4>` + v.map(postavkaHtml).join('') : '';
      }).join('');
    } else {
      seznam.innerHTML = novejsePrej.filter(p => mapaOd(p) === izbranaMapa).map(postavkaHtml).join('');
    }
    const prazno = $('#pov-prazno');
    prazno.classList.toggle('skrit', !!seznam.innerHTML.trim());
    prazno.textContent = postavke.length
      ? 'V tej mapi še ni ničesar. Dodaj povezavo, besedilo (Aa) ali datoteko (📎) spodaj.'
      : 'Še ni povezav. Dodaj povezavo, besedilo (Aa) ali datoteko (📎) spodaj — takoj se pokaže na vseh napravah.';
  }

  async function naloziMape() {
    try {
      const m = await (await fetch(`${MAPE}.json`, { cache: 'no-store' })).json();
      if (Array.isArray(m) && m.length) mape = m.includes(RAZNO) ? m : [...m, RAZNO];
      izris();
    } catch (_) {}
  }
  async function shraniMape() {
    try {
      await fetch(`${MAPE}.json`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(mape) });
    } catch (_) { obvesti('Map ni bilo mogoče shraniti.'); }
  }

  function opisDatoteke(p) {
    const k = koncnica(p.ime || '');
    const vrsta = { doc: 'Word', docx: 'Word', xls: 'Excel', xlsx: 'Excel', jpeg: 'JPG' }[k] || k.toUpperCase() || 'Datoteka';
    const kb = (p.velikost || 0) / 1024;
    const vel = kb >= 1024 ? (kb / 1024).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(kb)) + ' KB';
    return `${vrsta} · ${vel}`;
  }

  /** PDF in slike se odprejo v novem zavihku (od tam natisneš), drugo se prenese. */
  async function odpriDatoteko(el) {
    const { datoteka: kljuc, ime } = el.dataset;
    const vrsta = VRSTE[koncnica(ime)];
    const vZavihku = !!vrsta?.zavihek;
    // okno odpremo takoj ob kliku — pozneje bi ga brskalnik zavrnil kot pojavno okno
    const okno = vZavihku ? window.open('', '_blank') : null;
    okno?.document.write('<p style="font:16px sans-serif;padding:24px">Nalagam datoteko …</p>');
    try {
      const odziv = await fetch(`${DATOTEKE}/${kljuc}.json`, { cache: 'no-store' });
      const zapis = await odziv.json();
      if (!zapis?.podatki) throw new Error('ni podatkov');
      let blob = await (await fetch(zapis.podatki)).blob();
      if (vrsta && blob.type !== vrsta.tip) blob = new Blob([blob], { type: vrsta.tip });
      const url = URL.createObjectURL(blob);
      if (okno) okno.location.href = url;
      else {
        const a = document.createElement('a');
        a.href = url; a.download = ime;
        document.body.appendChild(a); a.click(); a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (_) {
      okno?.close();
      obvesti('Datoteke ni bilo mogoče odpreti.');
    }
  }

  async function naloziDatoteko(dat) {
    if (!dat) return;
    if (!VRSTE[koncnica(dat.name)]) { obvesti('Dodaš lahko PDF, Word, Excel, JPG ali PNG.'); return; }
    if (dat.size > NAJVEC_MB * 1024 * 1024) { obvesti(`Datoteka je prevelika (največ ${NAJVEC_MB} MB).`); return; }
    const gumb = $('#pov-priloga');
    gumb.disabled = true; gumb.classList.add('nalagam');
    obvesti('Nalagam datoteko …');
    try {
      const podatki = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result); r.onerror = () => rej(r.error);
        r.readAsDataURL(dat);
      });
      const o1 = await fetch(`${DATOTEKE}.json`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ime: dat.name, tip: VRSTE[koncnica(dat.name)].tip, podatki }),
      });
      if (!o1.ok) throw new Error(o1.status);
      const { name: kljuc } = await o1.json();
      const opis = $('#pov-opis').value.trim() || dat.name.replace(/\.[^.]+$/, '');
      const o2 = await fetch(`${DB}.json`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: TA_STRAN, desc: opis, ts: Date.now(), mapa: $('#pov-cilj').value,
                               datoteka: kljuc, ime: dat.name, tip: VRSTE[koncnica(dat.name)].tip, velikost: dat.size }),
      });
      if (!o2.ok) throw new Error(o2.status);
      $('#pov-opis').value = '';
      obvesti('Datoteka dodana — odpreš jo na kateremkoli računalniku.');
    } catch (_) {
      obvesti('Datoteke ni bilo mogoče naložiti.');
    }
    gumb.disabled = false; gumb.classList.remove('nalagam');
    $('#pov-datoteka').value = '';
  }

  async function naloziEnkrat() {
    try {
      const odziv = await fetch(`${DB}.json`, { cache: 'no-store' });
      postavke = vSeznam(await odziv.json());
      izris();
    } catch (_) {}
  }

  function vZivo() {
    if (tok) tok.close();
    tok = new EventSource(`${DB}.json`);
    tok.addEventListener('put', e => {
      try {
        const { path, data } = JSON.parse(e.data);
        if (path === '/') postavke = vSeznam(data);
        else {
          const kljuc = path.slice(1);
          postavke = postavke.filter(p => p._key !== kljuc);
          if (data !== null) postavke.push({ _key: kljuc, ...data });
          postavke.sort((a, b) => a.ts - b.ts);
        }
        izris();
      } catch (_) {}
    });
    tok.addEventListener('patch', naloziEnkrat);
    tok.onerror = () => {
      tok.close(); tok = null;
      setTimeout(() => { if (jeOdprta()) vZivo(); }, 3000);
    };
  }

  const jeOdprta = () => $('#povezave').classList.contains('odprt');

  function odpri() {
    $('#povezave').classList.add('odprt');
    $('#pov-zastor').classList.add('odprt');
    // na dotik ne skočimo v polje — sicer se odpre tipkovnica in zakrije seznam
    if (!matchMedia('(pointer:coarse)').matches) $(samoBesedilo ? '#pov-tekst' : '#pov-url').focus();
    naloziMape();
    vZivo();
  }

  function zapri() {
    $('#povezave').classList.remove('odprt');
    $('#pov-zastor').classList.remove('odprt');
    if (tok) { tok.close(); tok = null; }
    urejam = false;
    $('#pov-uredi').textContent = 'Uredi';
    izris();
  }

  function nastaviNacin(besedilo) {
    samoBesedilo = besedilo;
    $('.pov-vnosi').classList.toggle('tekst', besedilo);
    const g = $('#pov-nacin');
    g.classList.toggle('on', besedilo);
    g.setAttribute('aria-pressed', besedilo);
    g.title = besedilo ? 'Nazaj na povezavo' : 'Pošlji samo besedilo';
    $('#pov-dodaj').setAttribute('aria-label', besedilo ? 'Pošlji besedilo' : 'Dodaj povezavo');
    $(besedilo ? '#pov-tekst' : '#pov-url').focus();
  }

  async function dodajBesedilo() {
    const besedilo = $('#pov-tekst').value.trim();
    if (!besedilo) { obvesti('Vpiši besedilo.'); return; }
    const gumb = $('#pov-dodaj');
    gumb.disabled = true;
    try {
      // url in desc ostaneta, da stara stran (/sola) zapis pokaže kot povezavo sem
      const odziv = await fetch(`${DB}.json`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: TA_STRAN, desc: besedilo.split('\n')[0].slice(0, 80), besedilo,
                               ts: Date.now(), mapa: $('#pov-cilj').value }),
      });
      if (!odziv.ok) throw new Error(odziv.status);
      $('#pov-tekst').value = '';
      obvesti('Besedilo poslano.');
    } catch (_) {
      obvesti('Besedila ni bilo mogoče poslati.');
    }
    gumb.disabled = false;
  }

  async function kopiraj(el) {
    const p = postavke.find(x => x._key === el.dataset.besedilo);
    if (!p) return;
    try {
      await navigator.clipboard.writeText(p.besedilo);
      obvesti('Besedilo kopirano.');
    } catch (_) {
      // brez dovoljenja za odložišče besedilo vsaj označimo
      const r = document.createRange();
      r.selectNodeContents(el.querySelector('.pov-besedilo-vsebina'));
      const izbor = getSelection(); izbor.removeAllRanges(); izbor.addRange(r);
      obvesti('Besedilo je označeno — kopiraj ga s Ctrl+C.');
    }
  }

  async function dodaj() {
    if (samoBesedilo) return dodajBesedilo();
    let url = $('#pov-url').value.trim();
    const desc = $('#pov-opis').value.trim();
    if (!url || !desc) { obvesti('Vpiši povezavo in opis.'); return; }
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const gumb = $('#pov-dodaj');
    gumb.disabled = true;
    try {
      const odziv = await fetch(`${DB}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, desc, ts: Date.now(), mapa: $('#pov-cilj').value }),
      });
      if (!odziv.ok) throw new Error(odziv.status);
      $('#pov-url').value = '';
      $('#pov-opis').value = '';
      obvesti('Povezava dodana.');
    } catch (_) {
      obvesti('Povezave ni bilo mogoče dodati.');
    }
    gumb.disabled = false;
  }

  function povezi() {
    $('#pov-gumb').insertAdjacentHTML('beforeend', '<span class="pov-pika skrit" id="pov-pika"></span>');
    $('#pov-dodaj').innerHTML = ikona('poslji');
    $('#pov-priloga').innerHTML = ikona('sponka');
    $('#pov-nacin').innerHTML = ikona('besedilo');
    $('#pov-nacin').addEventListener('click', () => nastaviNacin(!samoBesedilo));
    $('#pov-tekst').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); dodaj(); }
    });
    $('#pov-priloga').addEventListener('click', () => $('#pov-datoteka').click());
    $('#pov-datoteka').addEventListener('change', e => naloziDatoteko(e.target.files[0]));

    // datoteko lahko tudi povlečeš v ploščo
    const plosca = $('#povezave');
    plosca.addEventListener('dragover', e => { e.preventDefault(); plosca.classList.add('spusti'); });
    plosca.addEventListener('dragleave', e => { if (!plosca.contains(e.relatedTarget)) plosca.classList.remove('spusti'); });
    plosca.addEventListener('drop', e => {
      e.preventDefault(); plosca.classList.remove('spusti');
      naloziDatoteko(e.dataTransfer.files[0]);
    });

    $('#pov-gumb').addEventListener('click', odpri);
    $('#pov-zapri').addEventListener('click', zapri);
    $('#pov-zastor').addEventListener('click', zapri);
    $('#pov-dodaj').addEventListener('click', dodaj);
    $('#pov-opis').addEventListener('keydown', e => { if (e.key === 'Enter') dodaj(); });
    $('#pov-url').addEventListener('keydown', e => { if (e.key === 'Enter') $('#pov-opis').focus(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && jeOdprta()) zapri(); });

    $('#pov-uredi').addEventListener('click', () => {
      urejam = !urejam;
      $('#pov-uredi').textContent = urejam ? 'Končano' : 'Uredi';
      izris();
    });

    $('#pov-seznam').addEventListener('click', async e => {
      const brisi = e.target.closest('.pov-brisi');
      if (!brisi) {
        const dat = e.target.closest('.pov-datoteka');
        if (dat && !urejam) { e.preventDefault(); odpriDatoteko(dat); }
        const zapis = e.target.closest('.pov-zapis');
        // izbiro mape ali označevanje dela besedila pustimo pri miru
        if (zapis && !urejam && !getSelection().toString()) kopiraj(zapis);
        return;
      }
      e.preventDefault(); e.stopPropagation();
      const postavka = postavke.find(p => p._key === brisi.dataset.kljuc);
      try {
        await fetch(`${DB}/${brisi.dataset.kljuc}.json`, { method: 'DELETE' });
        // izbrisana datoteka ne ostane v bazi
        if (postavka?.datoteka) await fetch(`${DATOTEKE}/${postavka.datoteka}.json`, { method: 'DELETE' });
      } catch (_) { obvesti('Brisanje ni uspelo.'); }
    });

    // premik postavke v drugo mapo
    $('#pov-seznam').addEventListener('change', async e => {
      const s = e.target.closest('.pov-premakni');
      if (!s) return;
      try {
        await fetch(`${DB}/${s.dataset.kljuc}.json`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mapa: s.value }),
        });
      } catch (_) { obvesti('Premik ni uspel.'); }
    });

    // mape: izbira, brisanje, nova
    $('#pov-mape').addEventListener('click', async e => {
      const brisiMapo = e.target.closest('[data-brisi-mapo]');
      if (brisiMapo) {
        const m = brisiMapo.dataset.brisiMapo;
        if (!confirm(`Izbrišem mapo „${m}"? Njena vsebina gre v „${RAZNO}".`)) return;
        mape = mape.filter(x => x !== m);
        if (izbranaMapa === m) izbranaMapa = 'vse';
        izris(); await shraniMape();
        return;
      }
      if (e.target.closest('#pov-nova-mapa')) {
        const ime = (prompt('Ime nove mape (npr. Sv. pop, Rač, SLJ):') || '').trim();
        if (!ime) return;
        if (mape.includes(ime)) { obvesti('Ta mapa že obstaja.'); return; }
        mape.splice(mape.indexOf(RAZNO), 0, ime);   // Razno ostane zadnja
        izbranaMapa = ime;
        Shramba.pisi('povMapa', izbranaMapa);
        izris(); await shraniMape();
        return;
      }
      const g = e.target.closest('[data-mapa]');
      if (!g) return;
      izbranaMapa = g.dataset.mapa;
      Shramba.pisi('povMapa', izbranaMapa);
      izris();
    });

    naloziMape();
    naloziEnkrat();   // da pika na gumbu pove, ali so povezave
  }

  return { povezi, odpri, zapri };
})();
