"""Enoten kvadratni kader okoli lika. Ozadje ostane nedotaknjeno —
maska služi SAMO za to, da najdemo, kje v sliki lik je."""
from PIL import Image

def _maska(im, nasic=0.22, temno=0.45):
    """Studijsko ozadje je bledo in nenasičeno; lik je barvit ali temen.
    Vinjete to ne zmoti, ker gledamo nasičenost, ne razdalje do ene barve."""
    W,H = im.size
    m = im.resize((W//4, H//4)); px = m.load()
    w,h = m.size
    def jeLik(c):
        mx, mn = max(c), min(c)
        s = 0 if mx == 0 else (mx-mn)/mx
        return s > nasic or mx/255 < temno
    return [[1 if jeLik(px[x,y]) else 0 for y in range(h)] for x in range(w)], w, h

def _najvecji_sklop(mask, w, h):
    """Obdrži le največji povezan sklop. Vodni žigi in okraski v kotih
    so ločeni od lika in bi sicer raztegnili okvir do roba slike."""
    from collections import deque
    oznaka = [[0]*h for _ in range(w)]
    naj, najid, n = 0, 0, 0
    for x in range(w):
        for y in range(h):
            if mask[x][y] and not oznaka[x][y]:
                n += 1; q = deque([(x,y)]); oznaka[x][y] = n; vel = 0
                while q:
                    a,b = q.popleft(); vel += 1
                    for na,nb in ((a+1,b),(a-1,b),(a,b+1),(a,b-1)):
                        if 0<=na<w and 0<=nb<h and mask[na][nb] and not oznaka[na][nb]:
                            oznaka[na][nb] = n; q.append((na,nb))
                if vel > naj: naj, najid = vel, n
    return [[1 if oznaka[x][y] == najid else 0 for y in range(h)] for x in range(w)]


def okvir_lika(im, delez=0.06):
    """Meje lika po gostoti stolpcev in vrstic — senca in vinjeta ne štejeta."""
    mask, w, h = _maska(im)
    mask = _najvecji_sklop(mask, w, h)
    stolpci = [sum(mask[x]) for x in range(w)]
    vrstice = [sum(mask[x][y] for x in range(w)) for y in range(h)]
    def meje(v):
        naj = max(v) or 1
        prag = naj*delez
        i = next((k for k,t in enumerate(v) if t>=prag), 0)
        j = next((k for k in range(len(v)-1,-1,-1) if v[k]>=prag), len(v)-1)
        return i, j+1
    x0,x1 = meje(stolpci); y0,y1 = meje(vrstice)
    s = im.size[0]/w
    return int(x0*s), int(y0*s), int(x1*s), int(y1*s)

def kvadrat(pot, stran=520, zrak=1.18):
    """Kvadraten izrez okoli lika, brez poseganja v slikovne pike."""
    im = Image.open(pot).convert('RGB')
    W,H = im.size
    x0,y0,x1,y1 = okvir_lika(im)
    cx, cy = (x0+x1)/2, (y0+y1)/2
    r = max(x1-x0, y1-y0) * zrak / 2
    r = min(r, min(W,H)/2)                      # ne čez rob slike
    cx = min(max(cx, r), W-r); cy = min(max(cy, r), H-r)
    izrez = im.crop((int(cx-r), int(cy-r), int(cx+r), int(cy+r)))
    return izrez.resize((stran,stran), Image.LANCZOS)
