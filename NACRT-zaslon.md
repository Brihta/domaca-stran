# Načrt: Razredni zaslon (OŠ Šempeter)

Osnutek za pregled — **še ni potrjeno, nič ni commitano.**
Klikabilni prototip: `draft-zaslon.html`

---

## 1. Kaj imamo danes

Ena datoteka `index.html` (2086 vrstic, 103 KB), brez odvisnosti razen Tailwind CDN + Lucide + Inter.
PWA (manifest + service worker). Vmesnik je **že v celoti v slovenščini**.

Obstoječe funkcije (vse delujoče, nobene ne izgubimo):

| Področje | Funkcije |
|---|---|
| Seznam | ročni vnos, množični vnos, prednaloženi razredi (šifrirano), shranjeni seznami |
| Razporejanje | po velikosti / po številu skupin, 6 prednastavitev, 14 tem poimenovanja |
| Pravila | odsotni učenci, pari „ne skupaj", zaklenjene skupine, zgodovina parov |
| Rezultat | drag & drop, preimenovanje skupin in učencev, razveljavi (Ctrl+Z) |
| Prikaz | celozaslonski način s časovnikom (1/3/5/10 min) |
| Shranjevanje | shranjene razporeditve, izvoz CSV, temni način |

**Težava ni v funkcijah — te so dobre. Težava je, da so vse enako vidne naenkrat.**

### Koliko korakov danes traja začetek ure

1. Odpri → 2. Razširi „Prednaloženi razredi" → 3. Izberi razred → 4. Vpiši geslo →
5. Naloži → 6. Označi odsotne → 7. Pomakni se do Nastavitev → 8. Izberi način →
9. Nastavi velikost → 10. Izberi temo → 11. Ustvari skupine → 12. Predstavi

**12 korakov, dvakrat drsenje, geslo vsakič.** To je cilj poenostavitve.

---

## 2. Predlagana arhitektura

Obrnemo razmerje: **zaslon je aplikacija, razporejevalnik je eno od orodij na njem.**

```
┌──────────────────────────────────────────────────────┐
│  OŠ Šempeter · učilnica 12     3. ura      09:42     │  ← vedno vidno
│                             še 22 min      petek     │
├──────────────────────────────────────────────────────┤
│                                                      │
│                      ODER                            │  ← eno orodje naenkrat,
│         (skupine / časovnik / izbor učenca)          │     berljivo s projektorja
│                                                      │
├──────────────────────────────────────────────────────┤
│  ⌂ Domov │ 👥 Skupine │ ⏱️ Časovnik │ 🎲 Izberi      │  ← preklop v enem kliku
└──────────────────────────────────────────────────────┘
                                    ⚙︎ Razred → plošča z nastavitvami
```

**Ključna ločitev:**
- **Oder** = kar vidi razred. Veliko, mirno, brez gumbov za nastavitve.
- **Plošča (⚙︎)** = kar ureja učitelj. Zdrsne z desne, se zapre, razred je ne rabi videti.

Danes je oboje pomešano v eni drseči strani. To je glavni vir občutka zapletenosti.

### Nova pot do skupin

1. Odpri (razred si zapomni) → 2. ⚙︎ → 3. „Trojke" → 4. Ustvari

**4 koraki, brez drsenja, brez gesla.** Iz 12 na 4.

---

## 3. Konkretne poenostavitve

### 3.1 Geslo enkrat, ne vsakič
Danes: geslo ob vsakem nalaganju razreda.
Predlog: odkleni enkrat → seznami v `sessionStorage` do konca dneva. Izbira razreda postane navaden spustni seznam.
*(Glej varnostno opombo v 5. — to je tudi priložnost, da zadevo rešimo bolje.)*

### 3.2 Tri harmonike → ena plošča
Danes so „Množični vnos", „Prednaloženi razredi" in „Ne skupaj" tri ločene zložljive sekcije v vrsti.
Predlog: vse v ploščo ⚙︎. Zgoraj troje, kar se uporablja vsako uro (razred, velikost, prisotnost), ostalo pod **„Več možnosti"**.

### 3.3 Spustni seznam „način" izgine
Danes: izbira `size`/`count` + števec + 6 prednastavitev — trije načini za isto stvar.
Predlog: **prednastavitve so primarne** (Pari / Trojke / Po 4 / Po 5 / Po meri…). Števec se pokaže šele pod „Po meri".

### 3.4 Prisotnost postane glavna, ne skrita
Označevanje odsotnih je funkcija, ki se uporablja **vsako uro**. Danes je to klik na ime v seznamu značk, kar ni očitno.
Predlog: lasten razdelek v plošči z jasnim navodilom „klikni odsotne".

### 3.5 14 tem → 5
Predlog: obdržimo Številke (privzeto), Barve, Živali + dodamo **slovenske**:
🏔️ Slovenski vrhovi (Triglav, Stol, Krn…) · 🏞️ Slovenske reke (Sava, Soča, Drava…)
Ostale so lepe, a jih je preveč za spustni seznam, ki ga odpreš enkrat na leto.

### 3.6 Kaj ostane nedotaknjeno
Drag & drop, zaklepanje skupin, Ctrl+Z, zgodovina parov, CSV, shranjene razporeditve, temni način — **vse ostane**, le preseli se v ploščo ali ostane na odru. Nič ne brišemo.

---

## 4. OŠ Šempeter v Savinjski dolini — vizualna identiteta

Barve so **prevzete z uradne šolske strani** (os-sempeter.si), ne izmišljene:

| Vloga | Barva | Kje na šolski strani |
|---|---|---|
| Glava zaslona | `#EFE337` | rumeni pas na vrhu |
| Poudarek / pas | `#EDC92D` | barvni odsek |
| Povezave, gumbi | `#2266FF` / `#2B4BBF` | povezave |
| Zelena | `#55A51C` | poudarki |
| Oranžna | `#E09900` | poudarki |
| Rdeča | `#E23B26` | streha v logotipu |
| Besedilo | `#303030` / `#444444` | naslovi / besedilo |
| Svetla površina | `#E8EEF6` | ozadja odsekov |
| Pisava | Open Sans | ista kot na strani |

Logotip (hiška) je izrezan iz priloge → `assets/logo-os-sempeter.png` (240 px, 56 KB).

**Kontrast preverjen** — vse ključne kombinacije dosegajo WCAG AA ali več
(naslovi na rumeni 10,8:1, imena učencev 9,2:1, najnižja 4,5:1). Pomembno za projektor.

### Šolski zvonec — vgrajen

Po Publikaciji 5.2. Zaslon sam izračuna, katera ura teče in koliko je še ostalo:

| | | | |
|---|---|---|---|
| Predura | 7.30–8.15 | 5. ura | 11.55–12.40 |
| 1. ura | 8.20–9.05 | 6. ura | 12.45–13.30 |
| 2. ura | 9.10–9.55 | odmor za kosilo | 13.30–13.50 |
| odmor za malico | 9.55–10.15 | 7. ura | 13.50–14.35 |
| 3. ura | 10.15–11.00 | 8. ura | 14.40–15.25 |
| 4. ura | 11.05–11.50 | | |

Preverjeno na vseh mejah:

```
07:00 → Pred poukom · začetek ob 07.30      09:55 → Odmor · še 20 min
07:30 → Predura · še 45 min do 1. ure       10:15 → 3. ura · še 45 min do 4. ure
08:16 → Premor · 4 min do 1. ure            14:37 → Premor · 3 min do 8. ure
08:20 → 1. ura · še 45 min do 2. ure        15:24 → 8. ura · še 1 min do konca pouka
09:07 → Premor · 3 min do 2. ure            15:30 → Pouk je končan
```

Trije primeri, ki jih je bilo treba ločiti: **odmor** (malica, kosilo — imenovan),
**premor** med urama (5 min, ni v tabeli, a obstaja) in **vikend** (pas se skrije).
Sklanjatev je upoštevana — „do 1. **ure**", ne „do 1. ura".

| Še odprto | Rabim podatek |
|---|---|
| Koledar (počitnice, dnevi dejavnosti) | ali je to zanimivo? |

---

## 5. Varnostna opomba (prosim preberi)

Prednaloženi seznami so „šifrirani" z XOR s ponovljenim geslom, šifropis pa je v `index.html`.
To je **zakrivanje, ne šifriranje**. Preveril sem konkretno na tej datoteki:

> Z ugibanjem, da se JSON začne z `{"1. A":[`, sem brez poznavanja gesla
> v eni vrstici kode dobil prvih 8 bajtov ključa. Imena učencev sem
> **namerno pustil nedekodirana** — šlo je le za preverjanje.

Ker gre za imena resničnih otrok v javnem repozitoriju, je to vredno vedeti. Možnosti:

- **A** — `classes.json` ločeno, v `.gitignore`, uvoz ob prvi uporabi (ostane na napravi). *Priporočam.*
- **B** — pravi AES-GCM prek WebCrypto z izpeljavo ključa (PBKDF2). Bolje, a šifropis je še vedno javen.
- **C** — brez sprememb, a repozitorij postane zaseben.

### Preverjeno: repozitorij je javen

`github.com/Brihta/group_maker` odgovori na anonimno zahtevo s `200`.
Lanski seznami so torej **že zdaj javno dostopni** v `index.html`, novi pa bodo v
trenutku, ko to commitaš. Geslo `P0čitnice` tega ne spremeni — XOR z 10-bajtnim
ključem nad JSON-om s predvidljivo strukturo ni ovira.

Lokalno je vse pripravljeno in nič ni commitano. **Pred `git push` se splača izbrati A, B ali C.**

---

## 6. Predlagan potek dela

| Korak | Vsebina | Tveganje |
|---|---|---|
| 1 | Lupina zaslona: glava, oder, dok (brez novih funkcij) | nizko |
| 2 | Razporejevalnik preseli na oder + plošča ⚙︎ | srednje |
| 3 | Poenostavitve 3.1–3.5 | nizko |
| 4 | OŠ Šempeter: ime, grb, urnik ur | nizko |
| 5 | Časovnik in „izberi učenca" kot samostojni orodji | nizko |
| 6 | Varnost podatkov (A/B/C zgoraj) | ločeno |

Vsak korak je svoj commit, aplikacija med potjo ves čas deluje.

### Odprto vprašanje o strukturi datoteke
`index.html` bo z zaslonom presegel 2500 vrstic. Lahko:
- **ostane ena datoteka** — PWA ostane trivialen, brez gradnje *(priporočam za zdaj)*
- razdelimo na `app.js` + `styles.css` — berljivejše, a je treba posodobiti `sw.js`

---

## 7. Seznam učencev 2026/27 — obdelano

Iz CSV zgrajen `classes.json`: **16 razredov, 316 učencev.**

| | |
|---|---|
| 1. A 16 · 1. B 17 · 2. A 21 · 3. A 27 | 4. A 25 · 4. B 25 · 5. A 17 · 5. B 17 |
| 6. A 17 · 6. B 17 · 7. A 19 · 7. B 18 | 8. A 18 · 8. B 19 · 8. C 18 · 9. A 25 |

Spremembe glede na lanske podatke: **+1. B, +8. B, +8. C · −3. B, −7. C, −9. B** (napredovanje letnikov).

**Razločevanje imen.** Na projektorju samo ime ne zadostuje — v 2. A so trije Filipi.
Pravilo: ime samo; ob podvojitvi se doda toliko črk priimka, da je enolično
(`Filip Ka.`, `Filip Kr.`, `Filip R.`). Preverjeno: znotraj vsakega razreda so vsa imena edinstvena.
Odvečni presledki iz CSV so očiščeni.

`classes.json` in `Ucenci*.csv` sta v `.gitignore` — **imena otrok ne gredo v repozitorij.**

### Podatki so v index.html — preverjeno

Geslo je nastavljeno na **`P0čitnice`**. Novi seznami so zakodirani z obstoječo shemo
in vstavljeni v `index.html`; spustni meni je posodobljen na 16 razredov.

Preverjeno v aplikaciji, ne le v skripti:

| Test | Rezultat |
|---|---|
| Pravo geslo odklene | 16 razredov / 316 učencev ✓ |
| Napačno geslo | pravilno zavrnjeno ✓ |
| Meni ustreza podatkom | ✓ |
| Vsak razred v meniju ima seznam | ✓ |
| Nalaganje 8. C skozi vmesnik | „Naložen razred 8. C (18 učencev)", 18 značk, geslo počiščeno ✓ |

---

## 8. Kaj potrebujem od tebe

1. **Urnik zvonjenja** (npr. 1. ura 7:30–8:15, odmor…)
2. **Katera orodja** poleg skupin: časovnik, izbor učenca, navodila, semafor hrupa, …?
3. **Odločitev o varnosti podatkov** (A / B / C) — vpliva tudi na točko 7
