# Szókincs

A szavakat tartalmazó technikai leíró fájlok, YAML formátumban.

## Hogyan adhatod hozzá a saját szavaidat?

Ha vannak kész szószedeteid pontos magyar fordításokkal, amelyek közül jópár nem szerepel még
a szótárban, akkor küldd el a szerkesztőnek az alábbi módon előkészítve.

1-1 feldolgozott témakör, cikk, novella, mese, könyv fejezet, stb. szavait írd be egy sima
szövegfájlba vagy dokumentumba. A betűformázás nem számít. Minden különálló szó vagy kifejezés 1 sor
vagy bekezdés legyen. A sorok szerkezete így nézzen ki:

címszó;kifejezés:nyelvtan:forrásnyelv:alakváltozatok=fordítás

Ahol:
- címszó: az az egyetlen szó, ami a szótári bejegyzést meghatározza. Ez kötelező.
- kifejezés: ha nem egyetlen szónak, hanem egy szófordulatnak a fordításáról van szó,
  akkor írd ki a ;-t a címszó után, majd a kifejezést. A tetszőlegesen behelyettesíthető szavakat
  *-gal jelöld. A fordításban ezek helyett vmi vagy vki álljon a megfelelő ragokkal, a csillagokkal
  azonos sorrendben. Ha nincs kifejezés, csak egy egyszerű szó, akkor ne írd ki a ;-t.
- a címszót és a kifejezást dévanágarí unicode vagy KTRANS formátumban írd le. Más típusú,
  régi fontok esetén keress a neten olyan eszközt, ami annak a fontnak a szövegét átfordítja
  unicode-ba (amire gyakran Mangal fontként is hivatkoznak)
- nyelvtan: a szófaj vagy más nyelvtani jellemző, a Vinódban szereplő szószedetekkel azonos módon
  és azonos rövidítésekkel, csak szóközökkel elválasztva. Az egész elé egyetlen :-t kell
  írni. Használható rövidítések: hn nn t tl mn szn nv nt elölj kt ht 1sz tbsz nvált
- forrásnyelv: a Vinóddal azonos módon és azonos, nagybetűs rövidítésekkel, azzal a különbséggel,
  hogy a nyelvtan után írandó : bevezető karakterrel. Ha a nyelvtan nincs megadva, akkor :: kell,
  ami jelzi annak üres voltát. példák: H A P AP H+P E Pt M
- alakváltozatok: ha van a címszónak alternatív helyesírása, akkor azokat : bevezető karakter
  után szóközzel elválasztva fel lehet sorolni. Ha előtte üres részek vannak, ugyanúgy több
  : kell elé. Ha nincs ilyen, a : sem kell.
- fordítás: a kifejezés magyar megfelelői vesszővel elválasztva. Ha több szófajhoz tartozó
  jelentések vannak, akkor azokat külön sorban, külön bejegyzésként add meg, hogy elkülönítsd
  az egyes nyelvtani meghatározásokat.

Ha KTRANS-ot használsz, akkor ellenőrizd le, hogy helyesen jelenik meg dévanágaríban:
[[KTRANS]](https://hindihun.appspot.com/ktrans) Ha dévanágarít, akkor ugyanott,
a Unicode rádiógomb kiválasztása után ellenőrizd, hogy helyesen jelenik meg KTRANS-ban.

Példák:
- kur'sii:nn:A:kursii=szék
- कुरसी:nn:A:कुर्सी=szék
- paricay;* se * kA paricay karAnA:hn:S=bemutat vkinek vkit
- darSan:hn tbsz:S=megtekintés, a templomi istenképmás rituális megtekintése
- darSan;darSan kar'nA:t:S=templomba megy, imádkozik
