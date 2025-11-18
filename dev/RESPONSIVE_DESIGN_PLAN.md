# Responsive & Mobile-Friendly Design Plan

## Aktuális Állapot

### Meglévő Responsive Elemek
- ✅ **Footer**: Már használ responsive grid-et (`v-row`, `v-col` `cols="12" md="4"`)
- ✅ **Header**: Részben responsive (`$vuetify.display.mdAndUp` használata a gombokhoz)
- ✅ **Vuetify Breakpoints**: `_variables.scss`-ben definiálva vannak a breakpoint-ok
- ⚠️ **GameTable**: `v-data-table` használata, de nincs mobil nézet optimalizálva
- ⚠️ **FilterPanel**: Desktop-orientált, sok input egymás mellett
- ⚠️ **Dialogs**: Fix szélesség, mobil optimalizáció hiányzik

### Főbb Problémák
1. **GameTable**: Desktop-optimalizált táblázat, mobil nézeten túl kicsi és nehezen olvasható
2. **FilterPanel**: Túl sok elem egymás mellett, mobil nézeten összenyomódik
3. **Header**: 
   - Nagy cím és alcím foglal sok helyet
   - Logo mérete nem elég jól alkalmazkodik
   - Subtitle sokáig látható mobil nézeten is
4. **Dialogs**: 
   - GameDetailsDialog túl széles lehet kisebb képernyőkön
   - Form mezők nem optimalizáltak érintésre
5. **Touch targets**: Gombok és interaktív elemek kicsik lehetnek érintőképernyőre

---

## Vuetify Breakpoints

```scss
// Vuetify default breakpoints
xs: 0-600px      // Extra small (phones)
sm: 600-960px    // Small (tablets portrait)
md: 960-1264px   // Medium (tablets landscape, small laptops)
lg: 1264-1904px  // Large (desktops)
xl: 1904px+      // Extra large (large desktops)
```

---

## Sprint 1: Header & Navigation (Mobil Optimalizáció)

### 1.1 AppHeader Mobil Nézet
**Prioritás: MAGAS**

#### Változtatások:
- **Logo méret**: 
  - Desktop (lg+): 80px → 60px scrolled
  - Tablet (md): 60px → 40px scrolled
  - Mobile (sm-): 40px → 30px scrolled

- **Cím méret**:
  - Desktop (lg+): `text-h3` → `text-h5` scrolled
  - Tablet (md): `text-h5` → `text-h6` scrolled
  - Mobile (sm-): `text-h6` → `text-subtitle-1` scrolled

- **Subtitle**:
  - Desktop (lg+): Mindig látható ha nincs scroll
  - Tablet (md): Rövidített verzió
  - Mobile (sm-): Rejtve mindig (túl hosszú)

- **Header magasság**:
  - Desktop: 120px → 70px scrolled
  - Tablet: 100px → 60px scrolled
  - Mobile: 80px → 56px scrolled

- **Gombok**:
  - Mobile: Icon-only gombok kis képernyőn
  - Touch target minimum: 48x48px

#### Implementáció:
```vue
<!-- AppHeader.vue responsive changes -->
<v-app-bar 
  :height="getHeaderHeight"
  :class="['header-bar', { 'header-scrolled': scrolled }]"
>
  <!-- Logo responsive sizing -->
  <v-img
    :width="logoSize"
    :max-width="logoSize"
  />
  
  <!-- Title responsive classes -->
  <div :class="titleClasses">
    JÁTÉKADATBÁZIS
  </div>
  
  <!-- Subtitle - hide on mobile -->
  <Transition name="subtitle">
    <div v-if="!scrolled && !isMobile" class="subtitle">
      <!-- ... -->
    </div>
  </Transition>
</v-app-bar>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const { xs, sm, md, lgAndUp } = useDisplay()

const isMobile = computed(() => xs.value || sm.value)

const getHeaderHeight = computed(() => {
  if (scrolled.value) {
    if (xs.value || sm.value) return 56
    if (md.value) return 60
    return 70
  }
  if (xs.value || sm.value) return 80
  if (md.value) return 100
  return 120
})

const logoSize = computed(() => {
  if (scrolled.value) {
    if (isMobile.value) return 30
    if (md.value) return 40
    return 60
  }
  if (isMobile.value) return 40
  if (md.value) return 60
  return 80
})

const titleClasses = computed(() => {
  const classes = ['main-title']
  
  if (scrolled.value) {
    if (isMobile.value) classes.push('text-subtitle-1')
    else if (md.value) classes.push('text-h6')
    else classes.push('text-h5')
  } else {
    if (isMobile.value) classes.push('text-h6')
    else if (md.value) classes.push('text-h5')
    else classes.push('text-h3')
  }
  
  return classes
})
</script>
```

#### CSS Media Queries:
```scss
// AppHeader.vue styles
.header-content {
  @media (max-width: 600px) {
    padding: 0 8px;
  }
}

.title-container {
  @media (max-width: 960px) {
    min-height: 60px;
    
    &-scrolled {
      min-height: 30px;
    }
  }
  
  @media (max-width: 600px) {
    min-height: 50px;
    
    &-scrolled {
      min-height: 24px;
    }
  }
}

.glass-btn {
  @media (max-width: 600px) {
    min-width: 48px !important;
    padding: 0 12px !important;
    
    // Hide text, keep only icon
    span:not(.v-icon) {
      display: none;
    }
  }
}
```

### 1.2 UserMenu Mobil Nézet
**Prioritás: KÖZEPES**

- Login gomb: Szöveg nélkül icon, csak mobil nézeten
- User avatar: Kicsinyítés 32px-re mobil nézeten
- Dropdown menu: Full width mobil nézeten

---

## Sprint 2: FilterPanel Mobil Optimalizáció

### 2.1 Filter Layout Átstrukturálás
**Prioritás: MAGAS**

#### Desktop Nézet (md+):
- Vízszintes elrendezés megtartása
- Max 3-4 filter egy sorban

#### Tablet Nézet (sm-md):
- 2 filter egy sorban
- Több sor használata

#### Mobil Nézet (xs):
- Minden filter teljes szélességben
- Egyszerűsített nézet: SimpleFilter default
- AdvancedFilter összecsukhato (accordion/expansion panel)

#### Implementáció:
```vue
<!-- FilterPanel.vue -->
<template>
  <v-card class="filter-panel">
    <!-- Mobile: Collapsible advanced filter -->
    <v-expansion-panels v-if="isMobile" variant="accordion">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon start>mdi-filter</v-icon>
          Szűrők
          <v-chip v-if="activeFiltersCount > 0" size="small" class="ml-2">
            {{ activeFiltersCount }}
          </v-chip>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <SimpleFilter v-if="filterMode === 'simple'" />
          <AdvancedFilter v-else />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    
    <!-- Desktop/Tablet: Normal view -->
    <v-card-text v-else>
      <SimpleFilter v-if="filterMode === 'simple'" />
      <AdvancedFilter v-else />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const { xs, sm } = useDisplay()
const isMobile = computed(() => xs.value || sm.value)
</script>
```

#### SimpleFilter Responsive:
```vue
<!-- SimpleFilter.vue -->
<v-row dense>
  <!-- Search - full width on mobile -->
  <v-col cols="12" sm="12" md="8">
    <v-text-field
      v-model="searchQuery"
      label="Keresés..."
      prepend-inner-icon="mdi-magnify"
      clearable
      density="comfortable"
    />
  </v-col>
  
  <!-- Category - full width on mobile -->
  <v-col cols="12" sm="6" md="4">
    <v-select
      v-model="selectedCategory"
      :items="categories"
      label="Kategória"
      density="comfortable"
    />
  </v-col>
  
  <!-- Favorite filter - full width on mobile -->
  <v-col cols="12" sm="6" md="auto">
    <v-switch
      v-model="showOnlyFavorites"
      label="Csak kedvencek"
      color="primary"
      density="comfortable"
    />
  </v-col>
</v-row>
```

#### AdvancedFilter Responsive:
```vue
<!-- AdvancedFilter.vue -->
<v-row dense>
  <!-- Each filter group gets proper responsive breakpoints -->
  <v-col cols="12" sm="6" md="4" lg="3">
    <v-select label="Helyszín" multiple chips />
  </v-col>
  
  <v-col cols="12" sm="6" md="4" lg="3">
    <v-select label="Csoportfázis" multiple chips />
  </v-col>
  
  <!-- Stack vertically on mobile, 2 cols on tablet, 3-4 on desktop -->
</v-row>
```

---

## Sprint 3: GameTable Mobil Optimalizáció

### 3.1 Table Responsive Nézetek
**Prioritás: KRITIKUS**

#### Megoldási Lehetőségek:

**Opció A: v-data-table mobil nézet (Ajánlott)**
- Desktop: Teljes táblázat minden oszloppal
- Tablet: Néhány oszlop elrejtése
- Mobile: Card-alapú lista nézet

**Opció B: Dual Component**
- Desktop/Tablet: `v-data-table`
- Mobile: `v-list` card-alapú megjelenítéssel

#### Implementáció (Opció A):
```vue
<!-- GameTable.vue -->
<template>
  <!-- Desktop/Tablet: Data Table -->
  <v-data-table
    v-if="!isMobile"
    :headers="responsiveHeaders"
    :items="enrichedGames"
    class="game-table"
  >
    <!-- ... existing slots ... -->
  </v-data-table>
  
  <!-- Mobile: Card List -->
  <div v-else class="game-list-mobile">
    <v-card
      v-for="game in paginatedGames"
      :key="game.id"
      class="game-card-mobile mb-3"
      @click="handleRowClick(game)"
    >
      <v-card-title class="d-flex align-center">
        <FavoriteButton
          :game-id="game.id"
          :game-name="game.name"
          size="small"
        />
        <span class="ml-2 text-body-1">{{ game.name }}</span>
      </v-card-title>
      
      <v-card-text>
        <div class="text-caption text-medium-emphasis mb-2">
          {{ truncateText(game.goal, 100) }}
        </div>
        
        <v-chip-group>
          <v-chip
            v-for="loc in game.location?.slice(0, 2)"
            :key="loc"
            size="small"
            color="somer-green-light"
          >
            {{ shortLocation(loc) }}
          </v-chip>
        </v-chip-group>
        
        <div class="mt-2 d-flex gap-2">
          <v-chip
            v-for="phase in game.groupPhase?.slice(0, 2)"
            :key="phase"
            size="small"
            color="somer-cyan-light"
          >
            {{ phase }}
          </v-chip>
        </div>
      </v-card-text>
      
      <v-card-actions>
        <v-btn
          size="small"
          variant="text"
          color="primary"
        >
          Részletek
          <v-icon end>mdi-chevron-right</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
    
    <!-- Mobile Pagination -->
    <v-pagination
      v-model="page"
      :length="pageCount"
      :total-visible="3"
      density="compact"
      class="mt-4"
    />
  </div>
</template>

<script setup>
const { xs, sm } = useDisplay()
const isMobile = computed(() => xs.value || sm.value)

// Hide certain columns on tablet
const responsiveHeaders = computed(() => {
  if (md.value) {
    // Hide some columns on tablet
    return headers.filter(h => 
      !['materials', 'duration', 'groupSize'].includes(h.key)
    )
  }
  return headers // Desktop: all columns
})
</script>

<style scoped>
.game-card-mobile {
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.game-list-mobile {
  padding: 8px;
}
</style>
```

#### Desktop Table Columns Visibility:
```javascript
const columnVisibility = {
  xs: ['favorite', 'name'], // Mobile: Only essentials
  sm: ['favorite', 'name', 'goal', 'location'], // Tablet: More info
  md: ['favorite', 'name', 'goal', 'location', 'groupPhase', 'age'], // Small desktop
  lg: headers // All columns
}
```

---

## Sprint 4: Dialogs Mobil Optimalizáció

### 4.1 GameDetailsDialog Responsive
**Prioritás: MAGAS**

#### Változtatások:
- **Max-width**: 
  - Desktop: 900px
  - Tablet: 700px
  - Mobile: 95vw (majdnem teljes szélesség)
- **Full-screen mobil nézeten**: `fullscreen` prop használata xs breakpointon
- **Padding**: Csökkentés mobil nézeten

```vue
<!-- GameDetailsDialog.vue -->
<v-dialog
  v-model="dialogOpen"
  :max-width="dialogMaxWidth"
  :fullscreen="isMobile"
  scrollable
>
  <v-card>
    <v-toolbar
      v-if="isMobile"
      color="primary"
      dark
      dense
    >
      <v-btn icon @click="closeDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>{{ game?.name }}</v-toolbar-title>
    </v-toolbar>
    
    <v-card-title v-else>
      <!-- Desktop title -->
    </v-card-title>
    
    <v-card-text :class="{ 'pa-2': isMobile, 'pa-6': !isMobile }">
      <!-- ... content ... -->
    </v-card-text>
  </v-card>
</v-dialog>

<script setup>
const dialogMaxWidth = computed(() => {
  if (xs.value) return '95vw'
  if (sm.value) return '90vw'
  if (md.value) return 700
  return 900
})
</script>
```

### 4.2 LoginDialog & UserProfileDialog
**Prioritás: KÖZEPES**

- Hasonló full-screen megközelítés mobil nézeten
- Form mezők: `density="comfortable"` minden breakpointon
- Touch-friendly input méret (min 44px magasság)

```vue
<v-dialog
  v-model="show"
  :max-width="isMobile ? '100vw' : 500"
  :fullscreen="isMobile"
>
  <!-- ... -->
</v-dialog>
```

### 4.3 ReportInaccuracyDialog
**Prioritás: ALACSONY**

- Fullscreen mobil nézeten
- Textarea magasság adaptálása

---

## Sprint 5: Touch & Interaction Optimalizáció

### 5.1 Touch Targets
**Prioritás: MAGAS**

#### Minimum méretek (WCAG AA szabvány):
- Gombok: 44x44px minimum
- Linkek: 44x44px minimum
- Checkbox/Radio: 44x44px minimum
- Icon buttons: 48x48px ajánlott

#### Implementáció:
```scss
// _mixins.scss - új mixin
@mixin touch-target($size: 44px) {
  min-width: $size;
  min-height: $size;
  padding: 8px;
  
  @media (hover: hover) {
    // Mouse support: smaller targets OK
    min-width: auto;
    min-height: auto;
  }
}

// Usage in components
.mobile-touch-btn {
  @include touch-target(48px);
}
```

### 5.2 FavoriteButton & TriedGameButton
**Prioritás: KÖZEPES**

```vue
<!-- FavoriteButton.vue -->
<v-btn
  :icon="isFavorite ? 'mdi-heart' : 'mdi-heart-outline'"
  :size="buttonSize"
  :class="{ 'touch-target': isMobile }"
  @click.stop="toggleFavorite"
/>

<script setup>
const buttonSize = computed(() => isMobile.value ? 'default' : 'small')
</script>

<style>
.touch-target {
  min-width: 48px !important;
  min-height: 48px !important;
}
</style>
```

### 5.3 Scroll Behavior
**Prioritás: ALACSONY**

- Smooth scroll behavior
- Touch-friendly scroll bars (ha szükséges)
- Pull-to-refresh támogatás megfontolása (PWA esetén)

---

## Sprint 6: Performance & Optimization

### 6.1 Image Optimization
**Prioritás: KÖZEPES**

- Lazy loading háttérképekhez
- Responsive images (srcset) használata
- WebP formátum támogatása fallback-kel

```vue
<!-- AppHeader.vue -->
<style>
.header-bar {
  background-image: 
    url('image-small.jpg');
    
  @media (min-width: 960px) {
    background-image: 
      url('image-large.jpg');
  }
}
</style>
```

### 6.2 CSS Optimization
**Prioritás: ALACSONY**

- Critical CSS inline-olása
- Nem használt Vuetify komponensek kiszűrése
- CSS purge production buildhez

### 6.3 JavaScript Optimization
**Prioritás: ALACSONY**

- Code splitting route-okra
- Lazy load dialogs
- Virtual scrolling nagy listákhoz (1000+ játék esetén)

---

## Sprint 7: Testing & Validation

### 7.1 Device Testing
**Prioritás: MAGAS**

#### Test Devices:
- **Mobile**:
  - iPhone SE (375x667) - Legkisebb modern mobil
  - iPhone 12/13 (390x844)
  - Android Pixel (412x915)
  - Samsung Galaxy S21 (360x800)

- **Tablet**:
  - iPad (768x1024)
  - iPad Pro (1024x1366)
  - Android Tablet (800x1280)

- **Desktop**:
  - Small laptop (1366x768)
  - Desktop (1920x1080)
  - Large desktop (2560x1440)

#### Test Checklist:
- [ ] Header megfelelően skálázódik
- [ ] Logo és cím olvasható minden méreten
- [ ] Subtitle elrejt/megjelenít megfelelően
- [ ] Filterek használhatók mobil nézeten
- [ ] GameTable/List olvasható és kattintható
- [ ] Dialogs megfelelően megjelennek
- [ ] Gombok minimum 44x44px
- [ ] Touch gesture-ök működnek
- [ ] Pagination működik mobil nézeten
- [ ] Form mezők könnyen kitölthetők
- [ ] Nincs vízszintes scroll (overflow)

### 7.2 Browser Testing
**Prioritás: KÖZEPES**

- Chrome Android
- Safari iOS
- Samsung Internet
- Firefox Android
- Desktop browsers

### 7.3 Accessibility Testing
**Prioritás: KÖZEPES**

- WCAG AA megfelelőség
- Screen reader kompatibilitás
- Keyboard navigation
- Color contrast ratio (4.5:1 minimum)
- Focus indicators láthatósága

---

## Sprint 8: PWA Enhancement (Opcionális)

### 8.1 Progressive Web App Features
**Prioritás: ALACSONY**

- Manifest.json létrehozása
- Service Worker offline support
- Add to Home Screen prompt
- App-like experience mobil nézeten
- Splash screen
- Icon készlet (több méret)

### 8.2 Mobile-Specific Features
**Prioritás: ALACSONY**

- Pull-to-refresh
- Swipe gestures (pl. kedvenc hozzáadás)
- Bottom sheet navigation (iOS-szerű)
- Native-like transitions

---

## Implementációs Prioritások

### 🔴 KRITIKUS (Első 1-2 hét):
1. GameTable mobil nézet (card-based list)
2. FilterPanel összecsuklápítható mobil nézeten
3. Header responsive méretezés
4. Touch targets minimum méret
5. Dialogs fullscreen mobil nézeten

### 🟡 FONTOS (3-4. hét):
6. UserMenu mobil optimalizáció
7. Footer responsive finomhangolás
8. Form mezők érintésre optimalizálva
9. Pagination mobil nézet
10. Image optimization

### 🟢 KÍVÁNATOS (5-6. hét):
11. Performance optimalizáció
12. Scroll behavior finomítás
13. Animation optimalizáció mobilra
14. Testing minden device-on
15. Accessibility audit

### 🔵 OPCIONÁLIS (Későbbi fejlesztés):
16. PWA features
17. Advanced gestures
18. Offline support
19. Native-like UX
20. Dark mode responsive behavior

---

## CSS Framework Stratégia

### Vuetify Display Breakpoints Használata
```javascript
// Minden komponensben elérhető
import { useDisplay } from 'vuetify'

const { xs, sm, md, lg, xl, mobile, mdAndUp, lgAndUp } = useDisplay()

// Computed properties:
const isMobile = computed(() => mobile.value) // xs || sm
const isTablet = computed(() => md.value)
const isDesktop = computed(() => lgAndUp.value)
```

### SCSS Media Queries
```scss
// _mixins.scss - responsive mixins
@mixin mobile {
  @media (max-width: 959px) { @content; }
}

@mixin tablet {
  @media (min-width: 960px) and (max-width: 1263px) { @content; }
}

@mixin desktop {
  @media (min-width: 1264px) { @content; }
}

// Usage
.component {
  padding: 24px;
  
  @include mobile {
    padding: 12px;
  }
}
```

---

## Befejezés és Karbantartás

### Definition of Done (DoD):
- ✅ Működik minden fő breakpointon (xs, sm, md, lg, xl)
- ✅ Touch targets minimum 44x44px
- ✅ Nincs horizontal scroll
- ✅ Dialogs mobilon használhatók
- ✅ GameTable/List olvasható mobilon
- ✅ Filterek elérhetők és használhatók
- ✅ Tesztelt valódi eszközökön
- ✅ Lighthouse Mobile score > 90
- ✅ WCAG AA accessibility

### Karbantartási Feladatok:
- Rendszeres device testing új böngésző verziókkal
- Breakpoint finomhangolás user feedback alapján
- Performance monitoring
- Accessibility audit évente

---

## Eszközök és Segédletek

### Development Tools:
- Chrome DevTools Device Mode
- Firefox Responsive Design Mode
- BrowserStack / Sauce Labs (valódi eszköz tesztelés)
- Lighthouse (performance & accessibility audit)

### Vuetify Helpers:
- `v-responsive` - responsive container
- `useDisplay()` - breakpoint detection
- Display helpers: `.d-none`, `.d-sm-block`, `.d-md-flex`
- Spacing helpers: `.pa-2`, `.pa-sm-4`, `.pa-md-6`

### Testing Sites:
- https://www.responsinator.com/
- https://ami.responsivedesign.is/
- https://material.io/resources/resizer/

---

**Utolsó frissítés**: 2025-11-18  
**Készítette**: AI Assistant  
**Státusz**: Tervezés alatt, implementáció még nem kezdődött
