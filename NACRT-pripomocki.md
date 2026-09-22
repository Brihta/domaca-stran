# Načrt: pripomočki na razrednem zaslonu

**Status: vse faze (0–5) izvedene in preverjene.**
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
- **Prevzem** — skupine, miselni vzorec, urnik. Lebdeča okna: premakljiva in
  raztegljiva kot pripomočki na platnu, `Esc` zapre. Velikost se shrani za vsako orodje posebej.

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
| **3** | Urnik | ✅ izvedeno |
| **4** | Anketa (ročna) | ✅ izvedeno |
| **5** | Miselni vzorec | ✅ izvedeno |

### Nove datoteke

```
zaslon.html          · razredni zaslon
css/zaslon.css       · slog
js/razredi.js        · šifrirani seznami (izluščeno — ena kopija za obe strani)
js/jedro.js          · stanje, shramba, zvonec, ikone, ogrodje platna
js/skupine.js        · razporejevalnik (logika prenesena iz index.html)
js/pripomocki.js     · semafor, simboli, časovnik, žreb, besedilo, kocka, slika
js/orodja.js         · urnik, anketa, miselni vzorec
js/zagon.js          · povezave
```

### Domača stran je zdaj res domača stran

Vlogi datotek sta zamenjani, da `./` odpre zaslon in ne razporejevalnika:

| Prej | Zdaj |
|---|---|
| `index.html` = razporejevalnik | `index.html` = **razredni zaslon** |
| `zaslon.html` = zaslon | `skupine.html` = razporejevalnik |

Obe strani se povezujeta: zaslon → „Napredni razporejevalnik…", razporejevalnik → „Domača stran".
Zgodovina datotek je ohranjena (`git mv`).

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

### Faze 3–5 — kaj je nastalo

**Urnik.** Devet vrstic iz šolskega zvonca (Predura + 1.–8. ura) × pet dni.
Vpišeš le predmet iz spustnega seznama s slovenskimi kraticami
(`SLJ MAT TJA TJN LUM GUM SPO DRU NAR NIT GOS TIT ZGO GEO BIO KEM FIZ ŠPO DKE RU OPB ISP DOD DOP RaP`).
Vsak predmet ima svojo barvo, da se urnik bere na pogled. Trenutni dan in ura sta označena;
med odmorom je označen dan, ne pa ura — ker takrat pouka ni.

**Anketa (ročna).** Vprašanje in do šest odgovorov, oboje urejaš na mestu.
Klik kamorkoli po vrstici prišteje (hitro med uro), majhen − odšteje, `0` ponastavi štetje.
Brez zaledja, kot dogovorjeno.

**Miselni vzorec.** Vozlišča z besedilom, vlečenje, povezave. „Poveži" označi izbrano
vozlišče, klik na drugo potegne črto; ponovni klik na isto povezavo jo odstrani.
Brisanje vozlišča počisti tudi njegove povezave.

### Prevzemi so postali okna

Sprva so semafor, simbol in skupine zavzeli cel zaslon in jih ni bilo mogoče raztegniti.
Zdaj imajo vsi prevzemi enako obnašanje kot besedilo:

- **premik** — vlečenje za naslovno vrstico (gumbi in žetoni v njej ostanejo klikljivi),
- **velikost** — ročaj v desnem spodnjem kotu,
- **⤢** v glavi vrne privzeto velikost, če okvir zgubiš,
- geometrija se shrani **za vsako orodje posebej** in preživi osvežitev.

Vsebina se meri po oknu, ne po zaslonu (`container-type:size` + `cqh`): pri majhnem
oknu se semafor in simbol skrčita, namesto da bi ušla čez rob. Kjer je vsebine preveč
(skupine, urnik), ta drsi.

Vlečenje in raztegovanje sta zdaj en sam skupni del kode (`Vleci`), ki ga uporabljata
platno in prevzemi — prej je bilo podvojeno.

### Popravljeno med izvedbo
- **Dok je prekrival dno prevzema** — dodan spodnji odmik 104 px.
- **Novi pripomočki so se zlagali na kup** — zdaj se razporejajo kaskadno.
- **`sw.js` vrnjen na strategijo „najprej mreža"** za kodo, „najprej predpomnilnik" za slike.
  To odpravi past, opisano spodaj.

### Past, ki jo je vredno poznati
Service worker predpomni CSS in JS. S staro strategijo popravki **niso prišli skozi**,
dokler nisi odregistriral SW in počistil predpomnilnika. Zdaj gre koda najprej na mrežo,
zato to odpade — a različico v `sw.js` je ob spremembi datotek vseeno vredno dvigniti.

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

---

## 9. Razredna pustolovščina (Classroom Quest)

Učenec izbere svojo pot; **ena točka je en nivo**, največ šest.
(Prvotno je bilo 0/10/25/50/100/150; ob prehodu se stari napredek samodejno pretvori
— 100 točk je postalo nivo 5, ne nivo 1.)

### Devet poti
Vodni zmaj · Ognjeni feniks · Škratji bojevnik · Alkimist · Varuh narave ·
Senčni tat · Vitez · Lokostrelec · Čarovnik

Vsaka ima šest slovenskih nazivov nivojev in svojo barvo, ki obarva kartico,
napredno črto in okvir ob slavju.

### Slike
Devet plakatov, na vsakem šest nivojev v vrsti — ne 54 ločenih datotek,
kot predpostavlja izvirni poziv. Razrezani so v
`assets/junaki/<pot>/nivo_1..6.jpg` (54 slik, 1,3 MB).

**Izvor:** `GitHub/Pustolovščina/Gemini_Generated_Image_*.jpeg` — originali
z manj stiskanja kot priloge v pogovoru. Plakate sem razvrstil po poteh tako,
da sem izrezal njihove naslovne vrstice in jih prebral (na vsaki piše
„Path of the …"), ne po ugibanju iz barv.

Umeritev je bila za vsak plakat svoja: nekateri imajo naslov panela znotraj okvirja,
drugi nad njim, tretji so prostostoječi liki z napisi zgoraj in spodaj. Prvi izrezi
so zajeli besedilo, zato sem jih pri petih poteh popravil.
**Posamezno sliko lahko kadarkoli zamenjaš** — dovolj je, da prepišeš datoteko.

### Kaj zna
- Mreža kartic za prisotne učence: junak, nivo, naziv, točke, napredna črta
- Učenec brez poti ima kartico „Izberi junaka" z izbirnikom vseh devetih poti
- Na kartici so **− , +1 in ⤾** (zamenjaj junaka); gumba se sama onemogočita
  na nivoju 1 oziroma 6
- Šest stopničk namesto črte — nivo se vidi na prvi pogled
- Prikazani so **samo učenci, ki junaka že imajo**; ostali kartic ne zasedajo
- **„Dodeli junaka (N)"** v glavi odpre seznam tistih brez junaka —
  brez tega gumba junaka po skritju praznih kartic ne bi bilo mogoče nikomur dati
- „Ponastavi" vrne cel razred na nivo 1
- Točke so shranjene **po razredu in imenu**, zato se razredi ne mešajo

### Slavje ob napredovanju
Ob prehodu nivoja se kartica „popne in zažari" (`transform: scale` + `drop-shadow`),
čez zaslon pa se odpre slavje z velikim junakom, imenom učenca in novim nazivom.
Zraven gre kratka fanfara. Samodejno izgine po ~4 s ali ob kliku.
Ob `prefers-reduced-motion` so animacije izklopljene.

### Hrošč, ki ga je bilo vredno najti
`container-type: size` na oknih prevzema (dodan prej za skaliranje vsebine) je
povzročil, da so se **okna izrisovala prosojno** — belo ozadje se je videlo kot
poltransparentno. Sprva sem to pripisal časovnici posnetkov; ni bilo to.
Zamenjal sem ga z višino okna, ki jo JS zapiše v `--okno-h`, vsebina pa se meri
po njej. Enak učinek, brez napake pri izrisu.

### Okence za lika je visok portret

Prva kompaktna različica je imela skoraj kvadratno okence (104 px) z `object-fit: cover`
in `object-position: top center` — pokazala je le glavo. Izvorne slike so namreč
**visoki portreti** (razmerja 0,44–0,57, torej do 1:2,2).

Zdaj ima okence `aspect-ratio: 1/2` in `object-fit: contain`, zato je lik **vedno cel**,
ne glede na to, kako visoka je izvorna slika. Enako velja za izbirnik poti in za slavje.
Kartice so ožje (104 px), ker so visoke — v vrsto jih gre osem do devet,
razred s 17 junaki gre na dve vrsti.

### Liki brez ozadja

Štiri poti imajo izrezane like s prozornim ozadjem (`nivo_N.png`):
**zmaj, feniks, skrat, alkimist**. Izluščeni so iz lista, ki ga je pripravil učitelj
(`ChatGPT Image … .png`, 1698×926 z alfa kanalom).

Preostalih pet poti (**narava, tat, vitez, lokostrelka, carovnik**) ima še vedno
celotne slike z ozadjem (`nivo_N.jpg`). Videz je zato mešan.

V kodi to ureja zastavica `brezOzadja: true` pri poti; `slikaPoti()` glede nanjo
vrne `.png` ali `.jpg`. Ko bodo na voljo izrezi še za ostale poti, je dovolj
odložiti datoteke in dodati zastavico — drugih sprememb ni.

Izrezan lik dobi nežno podlago v barvi poti, da ne lebdi v praznem,
ob slavju pa žari brez okvirja (`drop-shadow` namesto `box-shadow`).

**Opomba o velikosti:** okence je visok portret (1/2), izrezi pa so širši
(~0,74), zato lik ne zapolni vse višine. Ko bo izrezov devet od devetih,
se splača razmerje okenca enkrat uskladiti z njimi.

### Celozaslonski način

Pustolovščina potrebuje več prostora kot ostala orodja, zato se **privzeto odpre
čez celo stran**. Kartic gre v vrsto enajst namesto osem, razred se vidi naenkrat.

Gumb **⛶ / ❐** v glavi preklaplja med celim zaslonom in oknom; izbira se shrani
za vsako orodje posebej. V celozaslonskem načinu vlečenje in ročaj za velikost
odpadeta (nimata pomena), dok pa ostane nad vsebino — spodaj je zanj pripravljen
prostor, da ne prekriva kartic.

Ostala orodja se še naprej odprejo kot okna; če katero od njih potrebuje ves
prostor, se doda v `Prevzem.celZaslonPrivzeto`.
