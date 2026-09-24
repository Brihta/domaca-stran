#!/usr/bin/env python3
"""
Pripravi slike junaka za Pustolovščino.

Slik NE spreminja — ozadje ostane tako, kot je. Poišče le, kje v sliki je lik,
okoli njega vzame kvadraten izrez z nekaj zraka in ga zmeri na enotno velikost.

Uporaba:
    python3 orodja/kadriraj.py "<izvorna mapa>" <klic-poti> [--obrnjeno]

Primer:
    python3 orodja/kadriraj.py ~/Desktop/Pustolovščina/"Kralj Artur" vitez

--obrnjeno uporabi, kadar je prva datoteka najvišji nivo (tako je bilo pri zmaju).

Po obdelavi je treba v js/pustolovscina.js pri tisti poti dodati:
    svojeOzadje: true, pripona: 'jpg',
"""
import sys, os, glob, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kader import kvadrat

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STRAN = 520

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    obrnjeno = '--obrnjeno' in sys.argv
    if len(args) != 2:
        print(__doc__); sys.exit(1)
    izvor, pot = args

    sl = sorted(glob.glob(os.path.join(os.path.expanduser(izvor), '*.jp*g')))
    if len(sl) != 6:
        print(f"Pričakoval 6 slik, našel {len(sl)} v {izvor}"); sys.exit(1)

    viri = os.path.join(KOREN, 'viri', pot)
    cilj = os.path.join(KOREN, 'assets', 'junaki', pot)
    os.makedirs(viri, exist_ok=True); os.makedirs(cilj, exist_ok=True)
    for f in glob.glob(os.path.join(cilj, '*')): os.remove(f)

    for i, f in enumerate(sl):
        shutil.copy2(f, os.path.join(viri, os.path.basename(f)))
        nivo = (6 - i) if obrnjeno else (i + 1)
        kvadrat(f, stran=STRAN).save(os.path.join(cilj, f'nivo_{nivo}.jpg'),
                                     'JPEG', quality=86, optimize=True)
        print(f"  {os.path.basename(f)} -> nivo_{nivo}.jpg")

    # Zapišemo, od kod slike prihajajo — sicer se ob ponovni obdelavi
    # zlahka zgrabi napačna mapa (enkrat se je to že zgodilo pri zmaju).
    with open(os.path.join(viri, 'IZVOR.txt'), 'w', encoding='utf-8') as f:
        f.write(os.path.abspath(os.path.expanduser(izvor)) + '\n')
        f.write(('obrnjeno' if obrnjeno else 'naravni vrstni red') + '\n')

    kb = sum(os.path.getsize(f) for f in glob.glob(os.path.join(cilj, '*'))
             if not f.endswith('.txt')) // 1024
    print(f"\n{pot}: 6 slik, {kb} kB, vse {STRAN}x{STRAN}")
    print("Ne pozabi dvigniti različice v sw.js.")

if __name__ == '__main__':
    main()
