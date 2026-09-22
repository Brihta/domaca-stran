# Domača stran — OŠ Šempeter v Savinjski dolini

### 👉 [brihta.github.io/domaca-stran](https://brihta.github.io/domaca-stran/)

Razredni zaslon za interaktivno tablo: orodja za uro na enem mestu,
v slovenščini in prilagojeno naši šoli.

---

## Kaj zna

| Orodje | Kaj naredi |
|---|---|
| **Skupine** | razdeli razred v pare, trojke ali ekipe |
| **Žreb** | izbere učenca; z možnostjo, da vsak pride na vrsto enkrat na krog |
| **Semafor** | rdeča tišina · rumena šepetanje · zelena pogovor dovoljen |
| **Simbol dela** | samostojno, v paru, v skupini, vprašaj sošolca … |
| **Časovnik** | odštevanje za nalogo, z zvokom ob koncu |
| **Urnik** | ure so že iz šolskega zvonca, vpišeš le predmet |
| **Pustolovščina** | učenci zbirajo točke in razvijajo svojega junaka |
| **Besedilo, Slika, Kocka, Anketa** | lebdijo na platnu, premakljivi in raztegljivi |
| **Miselni vzorec** | vozlišča in povezave |

Zgoraj sta ves čas ura in **šolski zvonec**: zaslon sam ve, katera ura teče
in koliko je še do odmora.

## Kako se uporablja

1. Odpri povezavo zgoraj.
2. **Razred** (desno spodaj) → vpiši geslo → izberi razred.
   Geslo se vpiše enkrat in velja do konca seje.
3. Označi odsotne in izberi orodje v doku spodaj.

Ostala orodja so pod **Več orodij**. Razporejevalnik z naprednimi možnostmi
(zaklepanje skupin, pari „ne skupaj", izvoz CSV) je na `skupine.html`.

### Namestitev na tablo

Stran je PWA — v brskalniku jo lahko namestiš kot aplikacijo in deluje
tudi brez povezave.

## Zasebnost

Seznami učencev so zaščiteni z geslom, ki ga tu ne objavljamo.
Točke, urnik in nastavitve ostanejo **na napravi** (`localStorage`),
nikamor se ne pošiljajo.

> **Opomba za vzdrževanje:** zaščita seznamov je zakrivanje (XOR), ne pravo
> šifriranje. Dokler je repozitorij javen, je to vredno imeti v mislih —
> možnosti so opisane v `NACRT-zaslon.md`.

## Za razvoj

```
index.html      razredni zaslon (domača stran)
skupine.html    razporejevalnik skupin
css/zaslon.css
js/jedro.js         stanje, shramba, šolski zvonec, ogrodje oken
js/skupine.js       razporejanje
js/pripomocki.js    semafor, simboli, časovnik, žreb, besedilo, kocka, slika
js/orodja.js        urnik, anketa, miselni vzorec
js/pustolovscina.js točke in junaki
js/razredi.js       šifrirani seznami
assets/junaki/      10 poti × 6 nivojev
```

Brez orodij za gradnjo — dovolj je statični strežnik.
Ob spremembi datotek je treba dvigniti različico v `sw.js`,
sicer service worker postreže staro.

Načrta: [`NACRT-zaslon.md`](NACRT-zaslon.md) · [`NACRT-pripomocki.md`](NACRT-pripomocki.md)
