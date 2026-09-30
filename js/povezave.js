/* =====================================================================
   Razredni zaslon — aktualne povezave
   Povezava, dodana na eni napravi, se v živo pokaže na vseh drugih.
   Isti Firebase kot stara stran brihta.github.io/sola — seznam je skupen.
   Datoteke (PDF, slike …) so shranjene posebej, v seznamu je le njihov opis,
   da se seznam naloži takoj; vsebina se prenese šele ob kliku.
   ===================================================================== */
'use strict';

const Povezave = (() => {
  const BAZA = 'https://brihta-455eb-default-rtdb.europe-west1.firebasedatabase.app';
  const DB = `${BAZA}/brihta_feed`;
  const DATOTEKE = `${BAZA}/brihta_datoteke`;
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
  let urejam = false;
  let tok = null;       // EventSource, odprt le, ko je plošča odprta

  const vSeznam = podatki => podatki
    ? Object.entries(podatki).map(([k, v]) => ({ _key: k, ...v })).sort((a, b) => a.ts - b.ts)
    : [];

  function izris() {
    const seznam = $('#pov-seznam');
    seznam.classList.toggle('urejam', urejam);
    $('#pov-pika').classList.toggle('skrit', !postavke.length);
    $('#pov-prazno').classList.toggle('skrit', postavke.length > 0);

    seznam.innerHTML = [...postavke].reverse().map(p => {
      if (p.datoteka) return `
        <a class="pov-postavka pov-datoteka" href="#" data-datoteka="${ubezi(p.datoteka)}"
           data-ime="${ubezi(p.ime || 'datoteka')}" data-tip="${ubezi(p.tip || '')}">
          <span class="pov-ikona">${ikona('sponka')}</span>
          <span class="pov-besedilo">
            <span class="pov-opis">${ubezi(p.desc || p.ime || '')}</span>
            <span class="pov-url">${ubezi(opisDatoteke(p))}</span>
          </span>
          <span class="pov-puscica">›</span>
          <button class="pov-brisi" data-kljuc="${ubezi(p._key)}" aria-label="Izbriši">${ikona('zapri')}</button>
        </a>`;
      let gostitelj = p.url;
      try { gostitelj = new URL(p.url).hostname.replace(/^www\./, ''); } catch (_) {}
      return `
        <a class="pov-postavka" href="${ubezi(p.url)}" target="_blank" rel="noopener noreferrer">
          <span class="pov-besedilo">
            <span class="pov-opis">${ubezi(p.desc || '')}</span>
            <span class="pov-url">${ubezi(gostitelj)}</span>
          </span>
          <span class="pov-puscica">›</span>
          <button class="pov-brisi" data-kljuc="${ubezi(p._key)}" aria-label="Izbriši">${ikona('zapri')}</button>
        </a>`;
    }).join('');
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
        body: JSON.stringify({ url: TA_STRAN, desc: opis, ts: Date.now(),
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
    if (!matchMedia('(pointer:coarse)').matches) $('#pov-url').focus();
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

  async function dodaj() {
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
        body: JSON.stringify({ url, desc, ts: Date.now() }),
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
        if (dat) { e.preventDefault(); odpriDatoteko(dat); }
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

    naloziEnkrat();   // da pika na gumbu pove, ali so povezave
  }

  return { povezi, odpri, zapri };
})();
