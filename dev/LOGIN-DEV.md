# Firebase Social Login - Fejlesztési TODO Lista

## 🎯 Projekt Cél
Firebase alapú social login implementálása a Somer Játékadatbázis alkalmazásba, user-specifikus funkciókkal és korlátozott hozzáféréssel nem bejelentkezett felhasználóknak.

---

## 📋 1. Firebase Setup & Konfiguráció

### 1.1 Firebase Projekt Létrehozása
- [ ] Firebase Console-ban új projekt létrehozása (`somer-game-database`)
- [ ] Firebase Authentication engedélyezése
- [ ] Google Sign-In provider bekapcsolása
- [ ] (Opcionális) Facebook, GitHub Sign-In providerek bekapcsolása
- [ ] Firestore Database létrehozása (production mode)
- [ ] Firebase projektkonfig adatok beszerzése (apiKey, authDomain, projectId, stb.)

### 1.2 Függőségek Telepítése
```bash
npm install firebase
```
- [x] Firebase SDK telepítve

### 1.3 Firebase Konfiguráció Fájlok
- [x] `src/firebase/config.ts` - Firebase inicializálás és konfiguráció
- [x] `.env.local` - Environment variables Firebase config-hoz
- [x] `.env.example` - Environment variables sablon dokumentációval

### 1.4 Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User dokumentumok - csak saját adatát olvashatja/írhatja
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Kedvencek - csak bejelentkezett userek
    match /favorites/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Hibabejelentések - mindenki olvashatja, csak auth user írhat
    match /reports/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false; // Csak admin
    }
  }
}
```

---

## 🗄️ 2. Adatstruktúra & TypeScript Típusok

### 2.1 User Adatmodell (Firestore)
```typescript
interface UserProfile {
  uid: string              // Firebase Auth UID
  email: string            // Email cím (kötelező)
  displayName: string      // Teljes név (kötelező)
  phoneNumber?: string     // Telefonszám (opcionális)
  birthDate: string        // Születési dátum (YYYY-MM-DD)
  photoURL?: string        // Profil kép URL (social login-ból)
  provider: 'google' | 'facebook' | 'github'
  createdAt: Timestamp
  lastLogin: Timestamp
}
```

### 2.2 Kedvencek Adatmodell
```typescript
interface UserFavorites {
  uid: string              // User ID
  games: string[]          // Játék nevek tömbje (nincs más azonosító)
  updatedAt: Timestamp
}
```

### 2.3 Hibabejelentés Adatmodell
```typescript
interface GameReport {
  id?: string
  userId: string           // Bejelentő user ID
  userName: string         // Bejelentő neve (kitöltve)
  userEmail: string        // Bejelentő emailje (kitöltve)
  gameName: string         // Játék neve
  description: string      // Pontatlanság leírása
  status: 'pending' | 'reviewed' | 'resolved'
  createdAt: Timestamp
}
```

### 2.4 TypeScript Típusok Létrehozása
- [x] `src/types/User.ts` - UserProfile, UserFavorites, GameReport interfészek

---

## 🔐 3. Authentication Composables

### 3.1 useAuth Composable
**Fájl**: `src/composables/useAuth.ts`

**Funkciók**:
- [x] `signInWithGoogle()` - Google bejelentkezés popup-pal
- [x] `signOut()` - Kijelentkezés
- [x] `user` - Reactive ref a current user-re
- [x] `isAuthenticated` - Computed boolean (van-e bejelentkezve)
- [x] `loading` - Auth állapot betöltése
- [x] `onAuthStateChanged()` listener - User állapot figyelése
- [x] `updateUserProfile()` - User profil frissítése (név, telefon, születési dátum)
- [x] `loadUserProfile()` - User profil betöltése Firestore-ból
- [x] Auto user profil létrehozása első bejelentkezéskor

### 3.2 useFavorites Composable
**Fájl**: `src/composables/useFavorites.ts`

**Funkciók**:
- [x] `favorites` - Reactive ref a user kedvenceihez
- [x] `toggleFavorite(gameName: string)` - Kedvenc hozzáadása/törlése
- [x] `isFavorite(gameName: string)` - Ellenőrzi, hogy kedvenc-e
- [x] `loadFavorites()` - Kedvencek betöltése Firestore-ból
- [x] Firestore sync minden toggle-nél

### 3.3 useReports Composable
**Fájl**: `src/composables/useReports.ts`

**Funkciók**:
- [x] `submitReport(gameName, description)` - Hibabejelentés beküldése
- [x] `getUserReports()` - User saját bejelentései
- [x] Auto-fill user név és email a bejelentkezési adatokból

### 3.4 useNotification Composable
**Fájl**: `src/composables/useNotification.ts`

**Funkciók**:
- [x] `showNotification()` - Általános notification megjelenítés
- [x] `showAuthRequired()` - "🔒 Jelentkezz be a funkció használatához!" üzenet
- [x] Globális Snackbar kezelés

---

## 🎨 4. UI Komponensek - Login & Auth

### 4.1 LoginDialog Komponens
**Fájl**: `src/components/LoginDialog.vue`

**Funkciók**:
- [x] Modal dialog (v-dialog, max-width: 500px)
- [x] Fejléc: "Bejelentkezés" + X bezárás gomb
- [x] Üdvözlő szöveg és funkció lista
- [x] Kiemelt info: "**Díjmentesen használható**" üzenet
- [x] Felsorolás a funkciókról (6 funkció ikonokkal)
- [x] Google bejelentkezés gomb (primary color, Google ikon)
- [x] Loading állapot kezelése
- [x] Hibaüzenet megjelenítése

### 4.2 UserProfileDialog Komponens
**Fájl**: `src/components/UserProfileDialog.vue`

**Funkciók**:
- [x] Modal dialog user profil szerkesztéshez
- [x] Mezők:
  - [x] Teljes név (text field, kötelező)
  - [x] Email (readonly display, Firebase-ből)
  - [x] Telefonszám (text field, opcionális)
  - [x] Születési dátum (date input, kötelező)
- [x] Validáció (required rule)
- [x] Mentés gomb + Mégse gomb
- [x] Sikeres mentés notification
- [x] Avatar megjelenítés (profil kép vagy ikon)

### 4.3 UserMenu Komponens
**Fájl**: `src/components/UserMenu.vue`

**Funkciók**:
- [x] Header-ben megjelenik (AppHeader integráció)
- [x] Bejelentkezés gomb ha nincs user
- [x] Avatar + név megjelenítés bejelentkezve
- [x] Dropdown menü:
  - [x] User email megjelenítés
  - [x] "Profilom" menüpont
  - [x] "Kedvenc játékaim" menüpont
  - [x] "Kijelentkezés" menüpont
- [x] LoginDialog és UserProfileDialog integrálva

### 4.4 FavoriteButton Komponens
**Fájl**: `src/components/FavoriteButton.vue`

**Funkciók**:
- [x] Csillag ikon gomb (mdi-star-outline / mdi-star)
- [x] Ha nincs bejelentkezve: auth-required event emit
- [x] Ha bejelentkezve: toggle kedvenc állapot
- [x] Tooltip: "Hozzáadás a kedvencekhez" / "Eltávolítás..."
- [x] Integration a GameDetailsDialog-ba
- [x] Loading state kezelés

---

## 🚫 5. Access Control & Korlátozások

### 5.1 Notification System
**Fájl**: `src/composables/useNotification.ts`
- [x] Global notification composable
- [x] `showAuthRequired()` - "🔒 Jelentkezz be a funkció használatához!"
- [x] Snackbar megjelenítés App.vue-ban

### 5.2 Korlátozott Funkciók Implementálása

#### GameDetailsDialog Korlátozások
**Fájl**: `src/components/GameDetailsDialog.vue`
- [x] Játék szabályok (rules) fölött blur overlay
- [x] Overlay szövege: "🔒 Jelentkezz be a teljes leírás olvasásához"
- [x] Overlay kattintható → auth-required event
- [x] "Forrás megtekintése" gomb:
  - [x] Ha nincs login: disabled + auth-required event
  - [x] Ha van login: működik
- [x] "Pontatlanság bejelentése" gomb:
  - [x] Ha nincs login: disabled + auth-required event
  - [x] Ha van login: működik
- [x] FavoriteButton integrálva

#### GameTable Korlátozások
**Fájl**: `src/components/GameTable.vue`
- [x] Pagination vezérlők:
  - [x] Ha nincs login: disabled + auth-required event
  - [x] Ha van login: működik
- [x] "Sorok/oldal" dropdown:
  - [x] Ha nincs login: disabled + auth-required event
  - [x] Ha van login: működik
- [x] Top és bottom toolbar-ban alkalmazva

#### AppFooter Korlátozások
**Fájl**: `src/components/AppFooter.vue`
- [x] "Teljes adatbázis letöltése (Excel)" gomb:
  - [x] Ha nincs login: disabled + auth-required event
  - [x] Ha van login: működik

#### ReportInaccuracyDialog Korlátozások
**Fájl**: `src/components/ReportInaccuracyDialog.vue`
- [x] Ha bejelentkezve: név mező előre kitöltve és readonly
- [x] Ha bejelentkezve: Firestore-ba mentés
- [x] Ha nincs bejelentkezve: mailto fallback

---

## 🎯 6. AppHeader Integráció

### 6.1 AppHeader Módosítások
**Fájl**: `src/components/AppHeader.vue`

**Változtatások**:
- [x] UserMenu komponens hozzáadva jobb oldalra
- [x] Ha nincs bejelentkezve: "Bejelentkezés" gomb
- [x] Ha bejelentkezve: UserMenu avatar + név
- [x] Responsive layout (Somer.hu gomb mellé helyezve)

---

## 📱 7. Notifications & UX

### 7.1 Notification System
**Fájl**: `src/composables/useNotification.ts` + `src/App.vue`

**Funkciók**:
- [x] `showNotification(message, type)` - Vuetify snackbar
- [x] `showAuthRequired()` - Auth-specific notification
- [x] Pozíció: alul középen (bottom center)
- [x] Auto-hide: 3 másodperc
- [x] Globális Snackbar App.vue-ban

### 7.2 Auth Notifications
**Implementálva a következő helyeken**:
- [x] Pagination nyilak kattintás (GameTable)
- [x] Sorok/oldal dropdown kattintás (GameTable)
- [x] Forrás megtekintése gomb (GameDetailsDialog)
- [x] Pontatlanság bejelentése gomb (GameDetailsDialog)
- [x] Adatbázis letöltése gomb (AppFooter)
- [x] Kedvenc csillag kattintás (FavoriteButton)
- [x] Blur overlay kattintás (GameDetailsDialog)

**Szöveg**: "🔒 Jelentkezz be a funkció használatához!"

---

## 🎨 8. Styling & Design

### 8.1 Login Dialog Design
- [x] Somer primary színek használata
- [x] Google gomb: primary color, Google ikon
- [x] Modal animációk
- [x] Responsive design

### 8.2 Blur Overlay Design (GameDetailsDialog)
- [x] CSS blur filter (filter: blur(5px))
- [x] Colored overlay (rgba(8, 160, 202, 0.9) - Somer blue)
- [x] Központi lock ikon + szöveg + Bejelentkezés gomb
- [x] Kattintható overlay

### 8.3 Disabled State Styling
- [x] Gombok: disabled state Vuetify által kezelve
- [x] Notification kattintáskor

---

## 🧪 9. Tesztelés & Validáció

### 9.1 Auth Flow Tesztelés
- [ ] Google bejelentkezés működik
- [ ] Kijelentkezés működik
- [ ] User profil perzisztencia (page refresh után is bejelentkezve)
- [ ] Firestore user dokumentum létrejön első bejelentkezéskor
- [ ] User profil szerkesztés és mentés működik

### 9.2 Kedvencek Tesztelés
- [ ] Kedvenc hozzáadás működik
- [ ] Kedvenc törlés működik
- [ ] Kedvencek szinkronizálódnak eszközök között
- [ ] Kedvencek perzisztensek (refresh után is megmaradnak)

### 9.3 Korlátozott Funkciók Tesztelés
- [ ] Minden korlátozott funkció notification-t mutat nincs login esetén
- [ ] LoginDialog megnyílik minden korlátozott funkcióból
- [ ] Bejelentkezés után minden funkció működik
- [ ] Blur overlay helyesen jelenik meg és eltűnik

### 9.4 Hibabejelentés Tesztelés
- [ ] Hibabejelentés Firestore-ba mentődik
- [ ] User név és email automatikusan kitöltődik
- [ ] Validáció működik (kötelező mezők)
- [ ] Sikeres beküldés notification

---

## 📚 10. Dokumentáció

### 10.1 README Frissítése
- [ ] Firebase setup lépések dokumentálása
- [ ] Environment variables leírása
- [ ] Social login konfiguráció útmutató
- [ ] Firestore Security Rules telepítése

### 10.2 User Dokumentáció
- [ ] "Miért kell bejelentkeznem?" FAQ szekció
- [ ] Adatvédelmi tájékoztató (GDPR)
- [ ] Felhasználási feltételek

### 10.3 Fejlesztői Dokumentáció
- [ ] Firebase architektúra diagram
- [ ] Composables használati példák
- [ ] Firestore adatstruktúra dokumentáció

---

## 🚀 11. Deployment & Production

### 11.1 Environment Variables
```env
# .env.production
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 11.2 GitHub Actions Frissítése
**Fájl**: `.github/workflows/deploy.yml`
- [ ] Firebase config environment variables hozzáadása
- [ ] Build folyamat frissítése
- [ ] Cloudflare Pages deploy tesztelése

### 11.3 Production Checklist
- [ ] Firebase production mode bekapcsolva
- [ ] Firestore Security Rules élesítve
- [ ] Google OAuth redirect URI-k beállítva (production domain)
- [ ] Analytics bekapcsolva (Firebase Analytics)
- [ ] Error tracking (opcionális: Sentry)

---

## 🎯 12. Opcionális Továbbfejlesztések

### 12.1 Admin Dashboard (Későbbi fázis)
- [ ] Admin szerepkör Firestore-ban
- [ ] Hibabejelentések kezelő felület
- [ ] User lista és kezelés
- [ ] Játék statisztikák (kedvencek száma, nézettség)

### 12.2 Social Features
- [ ] Játék értékelés (1-5 csillag)
- [ ] Kommentek játékokhoz
- [ ] "Ezt is játszd" javaslatok (kedvencek alapján)
- [ ] User public profilok (opcionális)

### 12.3 Email Notifications
- [ ] Üdvözlő email első bejelentkezéskor
- [ ] Hibabejelentés visszajelzés email
- [ ] Új játékok értesítő (opcionális feliratkozás)

---

## 📅 Ütemterv (Becsült időigény)

| Fázis | Feladatok | Időigény |
|-------|-----------|----------|
| **1. Firebase Setup** | Projekt létrehozás, konfiguráció, security rules | 2-3 óra |
| **2. Auth Composables** | useAuth, useFavorites, useReports | 4-5 óra |
| **3. Login UI** | LoginDialog, UserMenu, UserProfileDialog | 3-4 óra |
| **4. Kedvencek** | FavoriteButton, integration | 2-3 óra |
| **5. Korlátozott Funkciók** | Blur overlay, disabled states, notifications | 4-5 óra |
| **6. Hibabejelentés** | Firestore integráció, auto-fill | 2 óra |
| **7. Tesztelés** | Minden funkció tesztelése | 3-4 óra |
| **8. Dokumentáció** | README, GDPR, fejlesztői docs | 2 óra |
| **9. Deployment** | Production setup, GitHub Actions | 2 óra |
| **Teljes becsült idő** | | **24-31 óra** |

---

## ✅ Acceptance Criteria (Kész definíció)

- [ ] **Firebase projekt létrehozva és konfigurálva (.env.local kitöltve)** ⚠️ KRITIKUS
- [ ] User be tud jelentkezni Google fiókkal
- [ ] User profil adatok (név, email, telefon, születési dátum) tárolódnak Firestore-ban
- [x] Kedvencek composable és komponens implementálva
- [x] Minden korlátozott funkció notification-t mutat nem bejelentkezett usernek
- [x] Játék leírás blur overlay implementálva
- [x] Hibabejelentésnél név automatikusan kitöltődik bejelentkezve
- [x] Pagination és sorok/oldal letiltva nem bejelentkezett usernek
- [x] Adatbázis letöltés letiltva nem bejelentkezett usernek
- [x] LoginDialog minden korlátozott funkcióból elérhető
- [x] UserMenu, UserProfileDialog, FavoriteButton komponensek kész
- [x] Globális notification rendszer (Snackbar)
- [ ] Éles tesztelés Firebase-zel (Firebase setup után)
- [ ] Production deployment

---

## 🔗 Hasznos Linkek

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Vuetify Components](https://vuetifyjs.com/en/components/all/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

---

**Megjegyzés**: Ez egy élő dokumentum, frissítsd a checkboxokat ahogy haladsz a fejlesztéssel! 🚀
