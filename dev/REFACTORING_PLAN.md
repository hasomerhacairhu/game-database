# Refaktorálási Terv - Somer Game Database

**Készítve:** 2025-11-15  
**Projekt:** Vue 3 + Firebase játékadatbázis alkalmazás

---

## 📋 Executive Summary

A projekt hosszú AI-asszisztált fejlesztés eredménye, ami működőképes, de több helyen optimalizálható és tisztítható. A főbb problémák:
- **Duplicált kód** több komponensben
- **Túlzottan nagy komponensek** (God components)
- **Nem konzisztens state management**
- **Hiányzó error boundary**-k
- **Nincs egységes loading state kezelés**
- **Type safety javítható** (any típusok)
- **CSS duplicációk**
- **Composable-ök refaktorálhatók**

---

## 🎯 Prioritások

### 🔴 Kritikus (Sürgős)
1. Type safety javítás (any típusok eliminálása)
2. Error handling egységesítése
3. Auth state management centralizálása

### 🟡 Fontos (Rövid távon)
4. Komponens méret redukálása
5. CSS újrafelhasználhatóság
6. Composable-ök optimalizálása

### 🟢 Kívánatos (Hosszú távon)
7. Performance optimalizálás
8. Test coverage növelése
9. Dokumentáció frissítése

---

## 1. 🔴 Type Safety Javítás

### Jelenlegi problémák
```typescript
// useAuth.ts - több helyen
} catch (err: any) {
  error.value = err.message || 'Hiba történt'
}

// useRatings.ts
} catch (err: any) {
  console.error('Rating hiba:', err)
}
```

### Megoldás
```typescript
// utils/errorHandler.ts (ÚJ)
export interface FirebaseError extends Error {
  code?: string
  customData?: any
}

export function handleFirebaseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Ismeretlen hiba történt'
}

// Használat:
} catch (error) {
  const message = handleFirebaseError(error)
  showError(message)
}
```

**Érintett fájlok:**
- `src/composables/useAuth.ts`
- `src/composables/useRatings.ts`
- `src/composables/useFavorites.ts`
- `src/composables/useTriedGames.ts`
- `src/composables/useReports.ts`

---

## 2. 🔴 Auth State Management Centralizálása

### Jelenlegi probléma
Az `useAuth` composable globális state-et használ, de nem Pinia store:
```typescript
const user = ref<User | null>(null)
const userProfile = ref<UserProfile | null>(null)
```

### Megoldás: Pinia Store Bevezetése

```typescript
// stores/auth.ts (ÚJ)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from 'firebase/auth'
import type { UserProfile } from '@/types/User'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isProfileComplete = computed(() => {
    return !!userProfile.value?.birthDate
  })

  // Actions...
  
  return {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated,
    isProfileComplete
  }
})
```

**Előnyök:**
- ✅ Centralizált state
- ✅ DevTools támogatás
- ✅ HMR support
- ✅ TypeScript inferencia

**Szükséges lépések:**
1. Pinia telepítése: `npm install pinia`
2. Store létrehozása
3. `main.ts` frissítése
4. `useAuth` migrálása
5. Komponensek frissítése

---

## 3. 🟡 GameDetailsDialog Komponens Szétbontása

### Jelenlegi probléma
A `GameDetailsDialog.vue` túl nagy (354 sor), túl sok felelősség:
- Game megjelenítés
- Action gombok (favorite, tried)
- Rating panel
- Report dialog
- Footer actions

### Megoldás: Kisebb komponensek

```
GameDetailsDialog.vue (fő container)
├── GameDetailHeader.vue (cím, otherNames)
├── GameDetailActions.vue (favorite, tried buttons)
├── GameDetailRating.vue (rating panel wrapper)
├── GameDetailBody.vue (goal, rules, materials)
│   ├── GameDetailChips.vue (space, group, age, etc.)
│   └── GameDetailContent.vue (blurred content)
└── GameDetailFooter.vue (report, source buttons)
```

**Előnyök:**
- ✅ Kisebb, olvashatóbb komponensek
- ✅ Könnyebb tesztelhetőség
- ✅ Újrafelhasználhatóság
- ✅ Egyszerűbb karbantartás

---

## 4. 🟡 CSS Refaktorálás

### Jelenlegi problémák
- Duplicált vertical button stílus (`TriedGameButton.vue` és `FavoriteButton.vue`)
- Inline style-ok (`GameDetailsDialog.vue`)
- Scoped style-ok ismétlődése

### Megoldás: SCSS változók és mixinek

```scss
// styles/_variables.scss (ÚJ)
$vertical-btn-min-height: 64px;
$vertical-btn-gap: 4px;
$vertical-btn-padding: 8px;

// styles/_mixins.scss (ÚJ)
@mixin vertical-button {
  :deep(.v-btn__content) {
    flex-direction: column;
    gap: $vertical-btn-gap;
  }
  
  height: auto !important;
  min-height: $vertical-btn-min-height;
  padding-top: $vertical-btn-padding;
  padding-bottom: $vertical-btn-padding;
}

// Használat komponensekben:
.vertical-btn {
  @include vertical-button;
}
```

**Érintett fájlok:**
- `src/components/TriedGameButton.vue`
- `src/components/FavoriteButton.vue`
- `src/components/GameDetailsDialog.vue`
- `src/components/UserMenu.vue`

---

## 5. 🟡 Composable-ök Optimalizálása

### A. useFavorites, useTriedGames, useRatings Egységesítése

Ezek a composable-ök nagyon hasonló logikát implementálnak:
- Firestore listener
- CRUD műveletek
- Loading state
- Error handling

**Generikus megoldás:**
```typescript
// composables/useFirestoreCollection.ts (ÚJ)
export function useFirestoreCollection<T>(
  collectionName: string,
  userIdField: string = 'userId'
) {
  const items = ref<Map<string, T>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Generikus CRUD műveletek
  const addItem = async (data: Partial<T>) => { ... }
  const updateItem = async (id: string, data: Partial<T>) => { ... }
  const deleteItem = async (id: string) => { ... }
  
  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem
  }
}

// Használat:
export function useFavorites() {
  const { items, addItem, deleteItem } = useFirestoreCollection<Favorite>('favorites')
  
  const isFavorite = (gameId: string) => items.value.has(gameId)
  const toggleFavorite = async (gameId: string) => {
    if (isFavorite(gameId)) {
      await deleteItem(gameId)
    } else {
      await addItem({ gameId })
    }
  }
  
  return { isFavorite, toggleFavorite }
}
```

**Előnyök:**
- ✅ DRY principle
- ✅ Konzisztens hibakezelés
- ✅ Egyszerűbb karbantartás
- ✅ Type safety

---

## 6. 🟡 Loading State Egységesítése

### Jelenlegi probléma
Minden composable külön kezeli a loading state-et:
```typescript
const loading = ref(false)
loading.value = true
try { ... } finally { loading.value = false }
```

### Megoldás: useAsync Helper

```typescript
// composables/useAsync.ts (ÚJ)
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options?: {
    immediate?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  }
) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(null)
  
  const execute = async () => {
    loading.value = true
    error.value = null
    
    try {
      data.value = await asyncFn()
      options?.onSuccess?.(data.value)
    } catch (err) {
      error.value = handleFirebaseError(err)
      options?.onError?.(err as Error)
    } finally {
      loading.value = false
    }
  }
  
  if (options?.immediate) {
    execute()
  }
  
  return { loading, error, data, execute }
}

// Használat:
const { loading, error, execute: saveFavorite } = useAsync(
  async () => await addDoc(collection(db, 'favorites'), data),
  {
    onSuccess: () => showSuccess('Kedvencekhez adva'),
    onError: () => showError('Hiba történt')
  }
)
```

---

## 7. 🟢 Performance Optimalizálás

### A. Computed Property Memorizálás

**Jelenlegi probléma:**
```typescript
// GameTable.vue
const enrichedGames = computed(() => {
  return props.games.map(game => ({
    ...game,
    _isFavorite: isFavorite(game.id),
    _isTried: isTried(game.id)
  }))
})
```

Ez minden render-nél újraszámolja az összes játékra!

**Megoldás:**
```typescript
// Memoizált verzió
const enrichedGames = computed(() => {
  const favIds = favoriteGameIds.value
  const triedIds = triedGameIds.value
  
  return props.games.map(game => ({
    ...game,
    _isFavorite: favIds.has(game.id),
    _isTried: triedIds.has(game.id)
  }))
})
```

### B. Virtual Scrolling a Táblázatban

Nagy adatmennyiségnél (100+ játék) érdemes virtual scrolling:
```vue
<!-- GameTable.vue -->
<v-virtual-scroll
  :items="filteredGames"
  :item-height="50"
  height="600"
>
  <template v-slot:default="{ item }">
    <GameTableRow :game="item" />
  </template>
</v-virtual-scroll>
```

### C. Lazy Loading a GameDetailsDialog-ban

```typescript
// Csak akkor töltse be a részleteket, amikor megnyílik
const loadGameDetails = async (gameId: string) => {
  if (!gameDetailsCache.has(gameId)) {
    const details = await fetchGameDetails(gameId)
    gameDetailsCache.set(gameId, details)
  }
  return gameDetailsCache.get(gameId)
}
```

---

## 8. 🟢 Error Boundary Implementálás

### Jelenleg hiányzik globális error handling

**Megoldás:**
```vue
<!-- components/ErrorBoundary.vue (ÚJ) -->
<template>
  <div v-if="error" class="error-boundary">
    <v-card class="ma-4 pa-4">
      <v-card-title>Valami hiba történt</v-card-title>
      <v-card-text>
        <p>{{ error.message }}</p>
        <v-btn @click="reset" color="primary">Újrapróbálás</v-btn>
      </v-card-text>
    </v-card>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err as Error
  console.error('ErrorBoundary caught:', err)
  return false // Megállítja a buborékozást
})

const reset = () => {
  error.value = null
}
</script>
```

**Használat App.vue-ban:**
```vue
<ErrorBoundary>
  <RouterView />
</ErrorBoundary>
```

---

## 9. 🔧 Utility Funkciók Kiemelése

### Jelenleg több helyen ismétlődnek

**Érintett területek:**
- Dátum formázás
- Szöveg truncate
- Validation rules

**Megoldás:**
```typescript
// utils/formatters.ts (ÚJ)
export const formatDate = (date: Date | Timestamp): string => {
  // ...
}

export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// utils/validation.ts (ÚJ)
export const validationRules = {
  required: (v: string) => !!v || 'Ez a mező kötelező',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Érvénytelen email cím',
  maxLength: (max: number) => (v: string) => 
    !v || v.length <= max || `Maximum ${max} karakter`,
  minLength: (min: number) => (v: string) =>
    !v || v.length >= min || `Minimum ${min} karakter`
}
```

---

## 10. 📦 Fájlstruktúra Reorganizálás

### Jelenlegi struktúra
```
src/
├── components/      (15 fájl - túl sok)
├── composables/     (8 fájl)
├── plugins/
├── styles/
├── types/
└── utils/
```

### Javasolt struktúra
```
src/
├── components/
│   ├── layout/         (AppHeader, AppFooter)
│   ├── game/           (GameTable, GameDetailsDialog, GameTableRow)
│   ├── auth/           (LoginDialog, UserMenu, UserProfileDialog)
│   ├── filters/        (FilterPanel, AdvancedFilter, SimpleFilter)
│   ├── interactions/   (FavoriteButton, TriedGameButton, RatingPanel)
│   └── shared/         (ErrorBoundary, LoadingOverlay)
├── composables/
│   ├── core/           (useAuth, useNotification)
│   ├── data/           (useGameData, useGameFilter)
│   └── features/       (useFavorites, useRatings, useTriedGames)
├── stores/             (Pinia stores)
├── utils/
│   ├── formatters.ts
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── constants.ts
├── types/
├── plugins/
└── styles/
    ├── _variables.scss
    ├── _mixins.scss
    └── main.scss
```

---

## 📊 Implementálási Ütemterv

### Sprint 1 (1 hét) - Kritikus ✅ KÉSZ
- [x] Type safety javítás (any eliminálás)
- [x] Error handler utility létrehozása
- [x] Validation rules kiemelése
- [x] Formatters utility létrehozása

### Sprint 2 (1 hét) - Fontos ✅ KÉSZ
- [x] Pinia store telepítése és beállítása
- [x] Auth store migrálás
- [x] useAsync helper implementálása
- [x] CSS változók és mixinek létrehozása

### Sprint 3 (1 hét) - Komponens refaktor ✅ KÉSZ
- [x] GameDetailsDialog szétbontása
- [x] Vertical button stílus egységesítése
- [x] Error boundary implementálás
- [x] Fájlstruktúra reorganizálás

### Sprint 4 (1 hét) - Optimalizálás
- [ ] Composable-ök generalizálása (useFirestoreCollection)
- [ ] Performance optimalizálások
- [ ] Virtual scrolling implementálás (ha szükséges)
- [ ] Lazy loading finomítások

### Sprint 5 (1 hét) - Tesztelés és dokumentáció
- [ ] Unit tesztek írása (Vitest)
- [ ] E2E tesztek (Playwright)
- [ ] Komponens dokumentáció (Storybook?)
- [ ] README frissítése

---

## 🎨 Opcionális Fejlesztések

### A. Animációk finomítása
```typescript
// composables/useTransition.ts
export function usePageTransition() {
  return {
    enterActiveClass: 'animate__animated animate__fadeIn',
    leaveActiveClass: 'animate__animated animate__fadeOut'
  }
}
```

### B. Dark mode támogatás
```typescript
// stores/theme.ts
export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)
  const toggleTheme = () => isDark.value = !isDark.value
  
  return { isDark, toggleTheme }
})
```

### C. Offline support (PWA)
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
}
```

---

## 🚨 Breaking Changes

### Pinia migrálás
- Komponensek frissítése: `const { user } = useAuth()` → `const authStore = useAuthStore()`
- Composable API változás lehetséges

### Komponens reorganizálás
- Import útvonalak változnak
- Props/Events átnevezése lehetséges

---

## 📚 Referenciák

- [Vue 3 Best Practices](https://vuejs.org/style-guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vuetify 3 Migration Guide](https://vuetifyjs.com/en/getting-started/upgrade-guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Firebase Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

## ✅ Checklist az Implementálás Előtt

- [ ] Branch létrehozása: `refactor/phase-1-type-safety`
- [ ] Backup készítése jelenlegi kódból
- [ ] Team review a tervről
- [ ] Dependencies frissítése (npm update)
- [ ] Git commit messages convention megállapítása
- [ ] CI/CD pipeline ellenőrzése

---

## 🤝 Közreműködés

Ez a terv élő dokumentum. Frissítsd, ahogy haladsz a refaktorálással!

**Kérdések/Javaslatok:** Nyiss issue-t vagy pull request-et.

---

**Utolsó frissítés:** 2025-11-15  
**Készítette:** AI asszisztencia + Bedő Marci
