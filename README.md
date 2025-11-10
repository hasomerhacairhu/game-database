# Somer Játékadatbázis

Egy Vue 3 + Vuetify 3 alapú egyoldalas alkalmazás ifjúsági vezetők számára készített játékok böngészésére és szűrésére.

## 🎯 Jellemzők

- **Vue 3** Composition API TypeScript-tel
- **Vuetify 3** Material Design komponens library
- **CSV adatforrás** Google Sheets-ből, 2 órás cache-sel
- **Szűrési lehetőségek:**
  - Egyszerű szöveges keresés
  - Összetett szűrés funkció, tér, csoport, korosztály, létszám és időtartam szerint
- **Reszponzív design** - mobil, tablet és desktop nézethez optimalizálva
- **Automatikus deployment** Cloudflare Pages-re GitHub Actions-szel

## 🚀 Gyors kezdés

### Előfeltételek

- Node.js 18+ és npm

### Telepítés

```bash
# Függőségek telepítése
npm install
```

### Fejlesztési környezet

```bash
# Dev szerver indítása
npm run dev
```

Az alkalmazás elérhető lesz a `http://localhost:5173` címen.

### Build

```bash
# Production build
npm run build

# Build előnézet
npm run preview
```

## 📁 Projekt struktúra

```
src/
├── components/          # Vue komponensek
│   ├── AppHeader.vue
│   ├── AppFooter.vue
│   ├── SimpleFilter.vue
│   ├── AdvancedFilter.vue
│   ├── FilterPanel.vue
│   ├── GameTable.vue
│   └── GameDetailsDialog.vue
├── composables/         # Újrafelhasználható logika
│   ├── useGameData.ts   # CSV betöltés és cache
│   └── useGameFilter.ts # Szűrési logika
├── types/               # TypeScript típusok
│   └── Game.ts
├── utils/               # Segédfüggvények
│   └── gameDisplayHelpers.ts
├── plugins/             # Vuetify konfiguráció
│   └── vuetify.ts
├── styles/              # Globális stílusok
│   ├── main.scss
│   └── settings.scss
├── App.vue              # Fő komponens
└── main.ts              # Alkalmazás belépési pont
```

## 🔧 Konfiguráció

### Adatforrás

Az alkalmazás a következő Google Sheets CSV-t használja adatforrásként:
```
https://docs.google.com/spreadsheets/d/e/2PACX-1vRcx1YPhoi6kUVe36T4T2162AhCdBwuVSX0ou2u-Vlicjf2So3VL3E2MDzrNYIbkgckP4n8p18_UOGP/pub?gid=0&single=true&output=csv
```

### Cache

Az adatok 2 órára cachelődnek a localStorage-ban a Google Sheets API limitek figyelembevételével.

## 🚢 Deployment

### Cloudflare Pages

A projekt automatikusan deployal a `main` és `vue-standalon` branch-ekre push esetén.

#### Cloudflare beállítások:

1. Hozz létre egy Cloudflare Pages projektet
2. Állítsd be a GitHub Secrets-et:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. A projekt neve: `somer-game-database`

#### Manuális deploy:

```bash
npm run build
# A dist/ mappa tartalmát töltsd fel Cloudflare Pages-re
```

### DigitalOcean App Platform (alternatíva)

1. Csatlakoztasd a GitHub repót
2. Build beállítások:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Deploy

## 📊 Táblázat oszlopok

Az alkalmazás az alábbi adatokat jeleníti meg a játékokról:

- **Játék neve**
- **Cél** (rövidített)
- **Tér** (Kültér/Beltér)
- **Csoportdinamikai fázis** (Alakulás, Viharzás, Normázás, Működés)
- **Korosztály** (0-5, 6-10, 11-13, 14-16, 17+)
- **Létszám** (3-5, 6-15, 16-30, 30+ fő)
- **Időtartam** (3-10p, 11-20p, 21-30p, 30+p)

Részletes információk (szabályok, kellékek, funkciók, stb.) a sor kattintásával érhetők el.

## 🎨 Testreszabás

### Színséma

A Somer branding színei a `src/plugins/vuetify.ts` fájlban találhatók:
- Elsődleges szín: Somer zöld (`#2E7D32`)

### Lapozási beállítások

A táblázat lapozási opciói (25, 50, 100) a `src/components/GameTable.vue` fájlban módosíthatók.

## 🐛 Hibák jelentése

Ha hibát vagy pontatlanságot találsz az adatbázisban, kérjük jelezd az [info@somer.hu](mailto:info@somer.hu) e-mail címen.

## 📝 Licensz

© Magyarországi Somer Hacair Egyesület

## 🤝 Közreműködés

A projekt a Somer Hacair Egyesület tulajdona. Fejlesztési javaslatok és pull request-ek üdvözöltek!
