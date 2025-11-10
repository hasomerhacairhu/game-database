Egy egyoldalas appletet készítünk.

Technologia:
- vuetify component library
- vue keretrendszer, egy fileos komponensekkel.

Környezet
Prod: github CI legyen hozzá ami buildel, utána meg cloudflaren vagy digitalocean appleten fogom futtatni.
legyen egy developer környezet is hogy tudjam tesztelni.

Funkció:
Rendelkezem google driveban egy 1200 soros tablélazattal, ami ifjúsági vezetők számára összegyűjtött játékokat tartalmaz. Ezt nyilvánosságra hozom driveból CSV formátumban.
Az applet ezt a táblázatot tölti be, cacheli pár órára. 
Az appleten megjelenik egy ergonomikus szűrő űrlap, alatta egy táblázat, lapozó.

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


Készíts