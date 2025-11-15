Egy egyoldalas appletet készítünk.

Technologia:
- vuetify 3 component library
- vue 3 keretrendszer, egy fileos komponensekkel. jól tagolt apró komponensek sokaságából épüljön fel.

Környezet
Prod: github CI legyen hozzá ami buildel, utána meg cloudflaren vagy digitalocean appleten fogom futtatni.
legyen egy developer környezet is hogy tudjam tesztelni lokálisan.

Funkció:
Rendelkezem google driveban egy 1200 soros tablélazattal, ami ifjúsági vezetők számára összegyűjtött játékokat tartalmaz. Ezt nyilvánosságra hozom driveból CSV formátumban.
Az applet ezt a táblázatot tölti be, cacheli pár órára.
A betöltés alatt loadert látunk, ameddig meg nem érkezik az adat.
A listában minden sor kattintható. Kattintásra popup ablak nyílik amiben az alábbi infókat mutatja a játéjkról:
-Játék célja: szöveg
-Szabályok: szöveg
-Kellékek: szöveg
-Tér: chip (https://vuetifyjs.com/en/components/chips/#usage)
-Csoport: chip
-Korosztály: chip
-Létszám: chip
-Időtartam: chip
-Funkció: chip
-Forrás: 🔗 emoji ami a táblázatbból származó urlre mutat.


Layout:
- Felső menüsor címmel, logóvel és egy gombbal "Ugrás a somer.hu-ra"
- egyszerű és összetett űrlap
-- egyszerű szűrő egy midnenben kereső mező
-- összetett szűrő minden mezőre lehet alaposan keresni. a paraméter csoportoknél (pl tér, korosztály), legördülő menüben lehessen többet kiválasztani. több kijelölése esetén bármelyik teljesülése elegendő.
- szűrő törlése gomb
Az appleten megjelenik egy ergonomikus szűrő űrlap, alatta egy táblázat, lapozó.
- Footer: "Az adatbázist a Magyarországi Somer Hacair Egyesület üzemelteti." + legyen egy szöveg arról, hogy ha hibát találnak, akkor küldjék el nekünk.


Adatforrás:
https://docs.google.com/spreadsheets/d/e/2PACX-1vRcx1YPhoi6kUVe36T4T2162AhCdBwuVSX0ou2u-Vlicjf2So3VL3E2MDzrNYIbkgckP4n8p18_UOGP/pub?gid=0&single=true&output=csv

Fejlécek:

A - Játék neve - string
B - Játék további elnevezései - string
C - Gyakorlat célja - string
D - Játékszabály leírása - string
E - Szükséges kellékek - string
F - Forrásmegjelölés - string

Bool:
G Tér - Kültéren játszható
H Tér - Beltéren játszható

Bool:
I - Csoportdinamikai fázis - Alakulás
J - Csoportdinamikai fázis - Viharzás
K - Csoportdinamikai fázis - Normázás
L - Csoportdinamikai fázis - Működés

Bool:
M - Korosztály - 0-5
N - Korosztály - 6-10
O - Korosztály - 11-13
P - Korosztály - 14-16
Q - Korosztály - 17+

Enum:
R - Funkció	- 1.
S - Funkció	- 2.
T - Funkció	- 3.

Bool:
U - Létszám - "kis csoport 3-5 fő"
V - Létszám - "közepes csoport 6-15 fő"
W - Létszám - "nagy csoport 16-30 fő"
X - Létszám - "közösség 30+ fő"

Bool:
Y  - Időtartam - 3-10p
Z  - Időtartam - 11-20p
AA - Időtartam - 21-30p
AB - Időtartam - 30+p


Funkció enum:
Névtanulós gyakorlatok
Ismerkedős gyakorlatok
Közösségfejlesztő gyakorlatok
Testkontaktus gyakorlatok
Bizalomerősítő gyakorlatok
Empátia gyakorlatok/Érzelmi intelligencia fejlesztő gyakorlatok
Önismereti gyakorlatok
Szituációs játékok
Koncentrációs gyakorlatok
Gondolkodtató gyakorlatok
Mozgás-verseny
Időtöltő játékok
Ugratós játékok
Játékok vetélkedőhöz
Feszültségoldó


Tegyél fel pontosító kérdéseket, hogy optimális appletet készíts
Készíts feladatlistát külön MD fileba, ami alapján lépésenként fel lehet építeni az appletet.
