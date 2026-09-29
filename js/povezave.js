/* =====================================================================
   Razredni zaslon — aktualne povezave
   Povezava, dodana na eni napravi, se v živo pokaže na vseh drugih.
   Isti Firebase kot stara stran brihta.github.io/sola — seznam je skupen.
   ===================================================================== */
'use strict';

const Povezave = (() => {
  const DB = 'https://brihta-455eb-default-rtdb.europe-west1.firebasedatabase.app/brihta_feed';

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
    $('#pov-url').focus();
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
      if (!brisi) return;
      e.preventDefault(); e.stopPropagation();
      try { await fetch(`${DB}/${brisi.dataset.kljuc}.json`, { method: 'DELETE' }); }
      catch (_) { obvesti('Brisanje ni uspelo.'); }
    });

    naloziEnkrat();   // da pika na gumbu pove, ali so povezave
  }

  return { povezi, odpri, zapri };
})();
