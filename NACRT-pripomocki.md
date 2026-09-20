# Načrt: pripomočki na razrednem zaslonu

**Status: faze 0–2 izvedene in preverjene. Nič commitano.**
Potrjeno: kombinirani model · ročna anketa zadošča · brez mikrofona.
Navezuje se na `NACRT-zaslon.md` (lupina zaslona).

---

## 1. Ena odločitev, ki določa vse ostalo

Tvoj referenčni zaslon (Classroomscreen) in moj dosedanji osnutek stojita na
**nasprotnih predpostavkah**. To je treba razrešiti, preden karkoli napišem.

| | Moj osnutek — **Oder** | Classroomscreen — **Platno** |
|---|---|---|
| Koliko orodij hkrati | eno, čez cel zaslon | več hkrati, lebdijo |
| Semafor + časovnik + navodila skupaj | ne gre | to je bistvo |
| Premikanje, velikost | ni potrebno | vleci, spreminjaj velikost |
| Zahtevnost | nizka | srednja–visoka |

Semafor, simboli dela in časovnik so **majhni in vedno prisotni** — če so na odru,
izpodrinejo vse drugo. Skupine, miselni vzorec in anketa pa **potrebujejo cel zaslon**.
Noben model sam ne pokrije obojega.

### Predlog: kombinirano

```
┌────────────────────────────────────────────────────────┐
│  OŠ Šempeter        3. ura · še 22 min         10:17   │
├────────────────────────────────────────────────────────┤
│  🔴  ✏️  ⏱ 04:32          ← trak: majhni pripomočki,   │
├────────────────────────────────────────────────────────┤     vedno vidni
│                                                        │
│              PLATNO (ozadje + lebdeči)                 │
│        besedilo · slika · kocka · anketa               │
│                                                        │
│      [ Skupine / Miselni vzorec prevzamejo vse ]       │
├────────────────────────────────────────────────────────┤
│  ⌂ │ 👥 Skupine │ 🚦 Semafor │ ⏱ │ 🎲 │ … Več orodij  │
└────────────────────────────────────────────────────────┘
```

- **Trak** — semafor, simbol dela, časovnik. Majhni, vedno vidni, en klik.
- **Platno** — besedilo, slika, kocka, anketa. Lebdijo, premakljivi.
- **Prevzem** — skupine, miselni vzorec, urnik. Prekrijejo platno, `Esc` nazaj.

To je moje priporočilo. Če hočeš čisto Classroomscreen (vse na platnu, brez traku),
je to manj dela pri lupini, a semafor je potem nekaj, kar je treba vsakič postaviti.

---

## 2. Iskrena opomba o „poenostavitvi"

Prva naloga je bila **zmanjšati zapletenost**. Zdaj dodajamo deset pripomočkov.
To ni protislovje, če se držimo dveh pravil — a brez njiju se vse skupaj podre:

1. **Osnovna pot ostane 4 koraki.** Odpri → ⚙︎ → „Trojke" → Ustvari.
   Noben nov pripomoček ne sme dodati koraka tej poti.
2. **Dok ima največ 6 mest.** Vse ostalo je pod „Več orodij".
   Vsak pripomoček ima **svoje majhne nastavitve** ob sebi — ne rastemo v eno orjaško ploščo.

Če kdaj predlagam kaj, kar krši to, me opozori.

---

## 3. Pripomočki — kaj konkretno pomeni vsak

### 🚦 Semafor
Tri luči, klik menja. Slovenska pravila, ne le barve:

| | Pomen |
|---|---|
| 🔴 Rdeča | Tišina — brez pogovora |
| 🟡 Rumena | Šepetanje — tiho, s sosedom |
| 🟢 Zelena | Pogovor dovoljen |

Velik prikaz, berljiv z zadnje klopi. *Zahtevnost: zelo nizka.*

### ✋ Simboli dela
Velika ikona + napis, kaj naj učenci zdaj počnejo:

`Tišina` · `Samostojno delo` · `Delo v paru` · `Delo v skupini`
`Vprašaj sošolca` · `Pomagaj sosedu` · `Šepetanje` · `Slušalke`

Ikone narišem kot vgrajene SVG (brez zunanjih knjižnic, PWA ostane samozadosten).
*Zahtevnost: nizka.* Predlagam, da nabor potrdiš — to je stvar tvoje prakse, ne moje.

### 🎲 Kocka
Ena ali dve kocki, animirano kotaljenje, velik rezultat. Izbira 6/10/20 strani.
*Zahtevnost: nizka.*

### 📝 Besedilo
Veliko besedilo na platnu — navodila za uro. Urejanje na mestu, nastavljiva velikost,
nekaj barv. Ostane shranjeno do naslednjič. *Zahtevnost: nizka.*

### 🎨 Ozadje
Enobarvna, prelivi, šolske barve + **lastna slika z naprave**.
Dve pasti, ki ju je treba rešiti takoj:
- kontrast — pripomočki morajo ostati berljivi tudi na pisani sliki
  (rešitev: samodejna poltransparentna podlaga pod pripomočki),
- shramba — slike so lahko več MB, `localStorage` ima ~5 MB.
  Zato **IndexedDB**, ne `localStorage`.

*Zahtevnost: nizka–srednja.*

### 🎯 Žreb (naključni izbor)
Razširitev obstoječega „Izberi učenca":
- izberi 1 ali več naenkrat,
- **brez ponavljanja** — dokler ne pridejo vsi na vrsto (to je tisto, kar učitelji res rabijo),
- kolo sreče kot alternativa seznamu.

Uporablja isti seznam in prisotnost kot skupine. *Zahtevnost: nizka.*

### 🖼️ Slika
Slika z naprave na platno — shema, fotografija, naloga. Premakljiva, povečljiva.
Ista shramba kot ozadje (IndexedDB). *Zahtevnost: srednja.*

### 📅 Urnik
**Tu imamo prednost pred Classroomscreenom:** šolski zvonec OŠ Šempeter je že vgrajen.
Urnik zato ni prazna mreža — ure so že pravilne (Predura 7.30, 1. ura 8.20 …),
ti le vpišeš predmet. Trenutna ura se sama označi.

Predmeti iz spustnega seznama s slovenskimi kraticami:
`SLJ MAT TJA TJN LUM GUM SPO DRU NAR NIT GOS TIT ZGO GEO BIO KEM FIZ ŠPO DKE RU OPB`

*Zahtevnost: srednja.*

### 📊 Anketa
**Tu moram biti odkrit o mejah.** Classroomscreenova anketa pusti učencem glasovati
s svojih naprav — za to je potreben strežnik. Ta aplikacija je ena statična datoteka
brez zaledja in tudi deluje brez interneta.

Predlagam **ročno anketo**: vprašanje + odgovori, učitelj tapka števce,
stolpci rastejo v živo. Pošteno, uporabno, brez zaledja.

Prava anketa z napravami učencev bi zahtevala strežnik in premislek o zasebnosti —
predlagam, da je zaenkrat ne delamo. *Zahtevnost: srednja.*

### 🧠 Miselni vzorec
Največji kos — to je majhna aplikacija zase: vozlišča, povezave, vlečenje,
urejanje besedila, barve, brisanje, shranjevanje.
Priporočam **zadnjo fazo**, da prej dobiš vse ostalo v roke. *Zahtevnost: visoka.*

### Česa **ne** predlagam
**Merilnik hrupa** (na tvoji sliki „sound level"). Zahteva dostop do mikrofona,
kar v šoli pomeni pojasnilo staršem in privolitve. Nisi ga naštel — omenjam le,
da veš, da sem ga namenoma izpustil. Če ga hočeš, ga načrtujemo posebej.

---

## 4. Vrstni red izvedbe

Razvrščeno po **vrednosti na enoto dela**, ne po tvojem seznamu:

| Faza | Vsebina | Stanje |
|---|---|---|
| **0** | Lupina: trak + platno + dok | ✅ izvedeno |
| **1** | Semafor · Simboli dela · Kocka · Besedilo | ✅ izvedeno |
| **2** | Ozadje · Žreb · Slika | ✅ izvedeno |
| **3** | Urnik | ⬜ naslednje |
| **4** | Anketa (ročna) | ⬜ |
| **5** | Miselni vzorec | ⬜ |

### Nove datoteke

```
zaslon.html          · razredni zaslon
css/zaslon.css       · slog
js/razredi.js        · šifrirani seznami (izluščeno — ena kopija za obe strani)
js/jedro.js          · stanje, shramba, zvonec, ikone, ogrodje platna
js/skupine.js        · razporejevalnik (logika prenesena iz index.html)
js/pripomocki.js     · semafor, simboli, časovnik, žreb, besedilo, kocka, slika
js/zagon.js          · povezave
```

`index.html` deluje nespremenjeno in ima zdaj povezavo „Razredni zaslon".
`sw.js` je posodobljen na `zaslon-v2` z vsemi novimi datotekami.

### Kaj je preverjeno v brskalniku

| Test | Rezultat |
|---|---|
| Odklep z geslom | 16 razredov ✓ |
| Nalaganje 7. A | 19 učencev, 2 odsotna → 17 aktivnih ✓ |
| Skupine po 3 | 6 skupin, vsi razporejeni, brez podvojitev ✓ |
| Semafor / simbol / časovnik v traku | ✓ |
| Kocka | met 5 → 5 pik ✓ |
| Besedilo | vpis shranjen ✓ |
| Žreb brez ponavljanja | vsak natanko enkrat na krog ✓ |
| Vlečenje pripomočka | premik točno 120×60 px ✓ |
| Sprememba velikosti | +70×50 px ✓ |
| Obstojnost čez osvežitev | razred, odsotni, platno, besedilo ✓ |
| index.html po izluščenju podatkov | nalaganje razreda dela ✓ |

### Dva hrošča, najdena in odpravljena med izvedbo
1. **Ploščice so se zlagale v stolpec** — `auto-fit` mreža se v stolpčnem flexu
   z `align-items:center` sesede; rešeno z eksplicitno širino.
2. **`Platno.dodaj` z izrecnim položajem ni shranil pripomočka** v stanje,
   zato pozdrav ni izginil in stvar ne bi preživela osvežitve.

### Vizualni jezik (po referenci Classroomscreen)

Funkcije so ostale nespremenjene — prenovljen je videz:

| Prej | Zdaj |
|---|---|
| Polni rumeni pas čez vrh | Lebdeči kartici: logotip levo, ura + zvonec desno |
| Svetlo enobarvno ozadje | **Polno ozadje** čez cel zaslon, privzeto vesolje |
| Trak kot bel pas | Lebdeče zaobljene kartice nad ozadjem |
| Dok čez vso širino | **Plavajoč dok na sredini spodaj**, okrogle ikone z napisi |
| Pripomočki z naslovno vrstico | Čiste kartice; kromiranje se pokaže ob prehodu miške |
| — | **Značka ×** na vklopljenem orodju v doku, kot v referenci |
| — | Semafor v pravem ohišju, luči žarijo |

Ozadja: Vesolje (privzeto, zvezde so narisane s CSS — brez zunanje slike),
Globina, Gozd, Zarja, Temno sivo, Šolsko rumeno, Svetlo, Belo + lastna slika.
Barva besedila nad ozadjem se samodejno preklopi med belo in temno, da ostane berljivo.

Na dotik je kromiranje pripomočkov **vedno vidno** (`@media (pointer:coarse)`),
ker na interaktivni tabli ni prehoda z miško.

### Past, ki jo je vredno poznati
Service worker predpomni CSS in JS. Med razvojem popravki **ne pridejo skozi**,
dokler ne odregistriraš SW in počistiš predpomnilnika. Ob vsaki spremembi
datotek je treba dvigniti različico v `sw.js` (`zaslon-v2` → `v3`).

Vsaka faza je svoj commit in aplikacija po vsaki deluje. Lahko se ustaviš kjerkoli.

---

## 5. Kar je treba rešiti pri lupini (faza 0)

**Delitev datoteke — zdaj je nujna.** `index.html` ima 2090 vrstic / 103 KB.
Z desetimi pripomočki bi zrasel na 5000+. Predlagam:

```
index.html      · ogrodje
css/zaslon.css
js/jedro.js     · stanje, shramba, zvonec
js/skupine.js   · obstoječi razporejevalnik
js/pripomocki/  · semafor.js, kocka.js, urnik.js …
```

`sw.js` mora naštevati nove datoteke, sicer PWA brez interneta ne bo delal — to je
tiha past, ki jo je lahko spregledati.

**Shramba.** Nov imenski prostor `zaslon_*`, da se ne zaleti z obstoječimi `gm_*`.
Slike v IndexedDB, ostalo v `localStorage`.

**Dotik.** Interaktivna tabla je zaslon na dotik. Obstoječa koda za vlečenje skupin
že uporablja `pointer` dogodke, torej imamo osnovo — a vsak nov pripomoček je treba
preizkusiti s prstom, ne le z miško.

---

## 6. Trije pomisleki, ki jih ne bom skrival

1. **Obseg.** To je 10 pripomočkov + platno — bistveno več kot vse dosedanje delo skupaj.
   Faze 0–2 so realne in dajo večino vrednosti. Fazi 4 in 5 sta vsaka svoj projekt.
2. **Anketa in miselni vzorec** sta edina, kjer obljuba in izvedljivost nista poravnani.
   Predlog zgoraj je iskren približek, ne enakovredna zamenjava.
3. **Varnost seznamov še ni rešena** (A/B/C v `NACRT-zaslon.md`, repozitorij je javen).
   Ni blokада za to delo, a raste število datotek, kjer je to laže spregledati.

---

## 7. Kaj potrebujem od tebe

1. **Model: kombinirano (trak + platno + prevzem), ali čisto platno?** ← ključno
2. **Nabor simbolov dela** — je zgornjih osem pravi, kaj manjka?
3. **Kje naj se ustavim?** Predlagam potrditev faz 0–2, ostalo po ogledu.
4. **Anketa brez zaledja (ročno tapkanje)** — je to sprejemljivo?
