# "Kipróbáltam" és Értékelés Funkció - Fejlesztési Terv

## Áttekintés

A felhasználók megjelölhetik, hogy kipróbáltak egy játékot, és ezt követően értékelhetik is azt. Ez segíti a közösséget a játékok kiválasztásában és visszajelzést ad a játékok minőségéről.

## Funkcionális Követelmények

### 1. "Kipróbáltam" Megjelölés
- Bejelentkezett felhasználó megjelölheti, hogy kipróbált egy játékot
- A gomb a játék címe mellett jobbra igazítva jelenik meg
- Thumbs up ikon jelzi az állapotot
- Animált kibontás mutatja a teljes szöveget: "Már kipróbáltam"
- Toggle működés: újra kattintva visszavonja a megjelölést
- Az állapot mentődik Firestore-ba
- Real-time szinkronizálás több eszköz között

### 2. Értékelési Funkció
- Csak kipróbált játékokat lehet értékelni
- 1-5 csillagos értékelési rendszer
- Opcionális szöveges megjegyzés
- Az értékelés megjelenik a játék adatlapján
- Átlagértékelés számítás és megjelenítés

## Adatmodell

### Firestore Struktúra

#### `tried` Collection
```typescript
interface UserTriedGames {
  uid: string                    // User ID
  games: string[]                // Array of game IDs
  updatedAt: Timestamp
}
```

#### `ratings` Collection
```typescript
interface GameRating {
  id?: string                    // Firestore auto ID
  gameId: string                 // A játék ID-ja
  gameName: string               // A játék neve (denormalizált)
  userId: string                 // Ki értékelte
  userName?: string              // Felhasználó neve (opcionális)
  stars: number                  // 1-5 csillag
  comment?: string               // Opcionális szöveges megjegyzés
  createdAt: Timestamp
  updatedAt?: Timestamp
}
```

#### `games` Collection - kiegészítés
```typescript
interface Game {
  // ... meglévő mezők
  averageRating?: number         // Átlagértékelés (számított)
  ratingCount?: number           // Értékelések száma (számított)
}
```

## Technikai Implementáció

### 1. Backend (Firestore)

#### Firestore Rules
```javascript
// tried collection
match /tried/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
}

// ratings collection
match /ratings/{ratingId} {
  allow read: if true;
  allow create: if request.auth != null 
    && request.resource.data.userId == request.auth.uid;
  allow update, delete: if request.auth != null 
    && resource.data.userId == request.auth.uid;
}
```

### 2. Frontend Composables

#### `useTriedGames.ts`
```typescript
- loadTriedGames(): Promise<void>
- startTriedGamesListener(): void
- stopTriedGamesListener(): void
- addTriedGame(gameId: string): Promise<void>
- removeTriedGame(gameId: string): Promise<void>
- toggleTriedGame(gameId: string): Promise<void>
- isGameTried(gameId: string): ComputedRef<boolean>
- triedGames: Ref<string[]>
- triedGamesCount: ComputedRef<number>
- loading: ComputedRef<boolean>
```

#### `useRatings.ts`
```typescript
- loadGameRatings(gameId: string): Promise<GameRating[]>
- loadUserRating(gameId: string): Promise<GameRating | null>
- addRating(rating: Omit<GameRating, 'id'>): Promise<void>
- updateRating(ratingId: string, data: Partial<GameRating>): Promise<void>
- deleteRating(ratingId: string): Promise<void>
- calculateAverageRating(ratings: GameRating[]): number
- gameRatings: Ref<GameRating[]>
- userRating: Ref<GameRating | null>
- averageRating: ComputedRef<number>
- loading: ComputedRef<boolean>
```

### 3. UI Komponensek

#### `TriedGameButton.vue`
- Compact és expanded állapot
- Smooth animáció
- Thumbs up/down ikon
- Tooltip bejelentkezésre ösztönzés
- Optimistic UI update

#### `RatingDialog.vue`
- Csak kipróbált játékoknál aktív
- 5 csillagos értékelés (v-rating)
- Szöveges megjegyzés (textarea)
- Mentés/Mégse gombok
- Validáció

#### `RatingDisplay.vue`
- Átlagértékelés megjelenítése
- Értékelések száma
- Részletes értékelések listája
- Saját értékelés kiemelése

### 4. Integráció

#### `GameDetailsDialog.vue`
- TriedGameButton hozzáadása a címsor mellé (jobbra igazítva)
- RatingDialog megjelenítése "Értékelés" gombbal
- RatingDisplay megjelenítése a játék adatai alatt
- Kondicionális megjelenítés (csak kipróbált játékoknál értékelés)

#### `GameTable.vue`
- Opcionális: Átlagértékelés oszlop hozzáadása
- Csillagok megjelenítése kompakt formában

## UI/UX Terv

### TriedGameButton Állapotok

**Compact (alapállapot):**
```
[👍] (csak ikon, 40px széles)
```

**Expanded (hover/aktív):**
```
[👍 Már kipróbáltam] (140px széles, animált átmenet)
```

**Elhelyezés:**
```
┌─────────────────────────────────────────────────┐
│ Játék adatlap: Játék neve          [👍] [❤] [✕] │
└─────────────────────────────────────────────────┘
```

### Értékelési Panel

```
┌────────────────────────────────────────────┐
│ Értékelések (átlag: ⭐⭐⭐⭐☆ 4.2 / 12 db)  │
├────────────────────────────────────────────┤
│ [Értékelés írása] gomb (csak kipróbált)   │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ Felhasználó1: ⭐⭐⭐⭐⭐               │    │
│ │ "Nagyon jó játék, gyerekek imádták" │    │
│ │ 2024.11.14                          │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ Felhasználó2: ⭐⭐⭐⭐☆               │    │
│ │ "Jó, de hosszú"                     │    │
│ │ 2024.11.10                          │    │
│ └─────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

## Animációk

### TriedGameButton Animáció
- Width: 40px → 140px (0.3s ease)
- Text opacity: 0 → 1 (0.2s ease, delay 0.1s)
- Icon scale: 1.0 → 1.1 (click: scale pulse)

### Rating Dialog
- Fade in (0.3s)
- Stars hover: scale 1.2
- Submit: loading spinner

## Színek és Ikonok

### Tried Button
- Nem kipróbált: `grey-lighten-1` / thumbs-up-outline
- Kipróbált: `somer-green` / thumbs-up (solid)

### Rating
- Csillagok: `yellow-darken-2` (⭐)
- Üres csillag: `grey-lighten-2` (☆)

## Fejlesztési Lépések

### Phase 1: Backend - Tried Games ✅
- [ ] Firestore `tried` collection létrehozása
- [ ] Firestore rules beállítása
- [ ] `useTriedGames.ts` composable implementálása
- [ ] Real-time listener implementálása
- [ ] Tesztelés: add/remove/toggle műveletek

### Phase 2: UI - Tried Button ✅
- [ ] `TriedGameButton.vue` komponens létrehozása
- [ ] Compact/expanded állapotok
- [ ] Animációk implementálása
- [ ] Integráció `GameDetailsDialog.vue`-ba
- [ ] Auth gate (bejelentkezésre ösztönzés)
- [ ] Notification feedback

### Phase 3: Backend - Ratings ⭐
- [ ] Firestore `ratings` collection létrehozása
- [ ] Firestore rules beállítása
- [ ] `useRatings.ts` composable implementálása
- [ ] Átlagértékelés számítási logika
- [ ] Query optimalizálás (indexek)

### Phase 4: UI - Rating System ⭐
- [ ] `RatingDialog.vue` komponens létrehozása
- [ ] 5 csillagos értékelő widget (v-rating)
- [ ] Textarea megjegyzéshez
- [ ] Form validáció
- [ ] `RatingDisplay.vue` komponens létrehozása
- [ ] Értékelések listájának megjelenítése
- [ ] Átlagértékelés komponens

### Phase 5: Integráció ⭐
- [ ] Rating gomb hozzáadása `GameDetailsDialog`-hoz
- [ ] Kondicionális megjelenítés (csak kipróbált játékoknál)
- [ ] Saját értékelés szerkesztése/törlése
- [ ] Átlagértékelés megjelenítése `GameTable`-ben (opcionális)

### Phase 6: Optimalizálás és Polish 🎨
- [ ] Loading states finomhangolása
- [ ] Error handling
- [ ] Offline support (optimistic updates)
- [ ] Performance optimalizálás (lazy loading)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Mobile responsiveness
- [ ] Analytics events (tried, rated stb.)

### Phase 7: Testing és Deploy 🚀
- [ ] Unit tesztek (composables)
- [ ] Integration tesztek
- [ ] E2E tesztek (Cypress/Playwright)
- [ ] User acceptance testing
- [ ] Production deploy
- [ ] Monitoring és logging

## Későbbi Fejlesztési Lehetőségek

### v2 Features
- [ ] Értékelések szűrése és rendezése
- [ ] "Hasznos volt" szavazás értékelésekre
- [ ] Játékok rangsorolása értékelés alapján
- [ ] Kipróbált játékok szűrő a táblázatban
- [ ] Statisztikák: hány játékot próbáltam ki
- [ ] Játék ajánlások értékelések alapján
- [ ] Értékelési értesítések (új értékelés saját játékon)
- [ ] Moderáció (nem megfelelő értékelések jelentése)

### v3 Features
- [ ] Képek feltöltése értékeléshez
- [ ] Videó beágyazás
- [ ] Játékvariációk megosztása
- [ ] Közösségi feed (ki mit próbált ki)

## Technikai Megfontolások

### Performance
- Indexek a Firestore-ban (userId, gameId, stars)
- Pagination nagy értékelésszám esetén
- Cache strategy (localStorage + memory)

### Security
- Rate limiting (Cloud Functions)
- Spam védelem (max. 1 értékelés/játék/user)
- XSS védelem (sanitize HTML comments)

### Scalability
- Cloud Functions aggregate rating számításhoz
- Batch updates nagy adatmennyiségnél
- CDN cache átlagértékelésekhez

## Metrikák és Analytics

### Követendő Események
- `tried_game_added`
- `tried_game_removed`
- `rating_created`
- `rating_updated`
- `rating_deleted`
- `rating_dialog_opened`

### KPI-k
- Kipróbált játékok száma / felhasználó
- Értékelések száma / kipróbált játék
- Átlagos csillagszám
- Értékelési ráta (hány % ír értékelést)

## Időbecslés

- **Phase 1-2 (Tried Games):** 6-8 óra
- **Phase 3-4 (Ratings Backend+UI):** 12-16 óra
- **Phase 5 (Integráció):** 4-6 óra
- **Phase 6 (Polish):** 8-10 óra
- **Phase 7 (Testing):** 6-8 óra

**Teljes becsült idő:** 36-48 óra (4-6 nap full-time)

## Priorizálás

**Must Have (MVP):**
- ✅ Tried games basic functionality
- ✅ Tried button UI
- ⭐ Basic rating (stars only)
- ⭐ Average rating display

**Should Have:**
- Szöveges megjegyzés értékelésnél
- Értékelések listája
- Saját értékelés szerkesztése

**Nice to Have:**
- Átlagértékelés a táblázatban
- Kipróbált játékok szűrő
- Statisztikák

---

**Készítette:** GitHub Copilot  
**Dátum:** 2025-11-14  
**Verzió:** 1.0
