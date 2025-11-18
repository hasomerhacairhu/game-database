import { ref, computed, watch } from 'vue'
import { doc, getDoc, setDoc, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore'
import { db } from '@/plugins/firebase'
import { useAuth } from './useAuth'
import type { UserFavorites } from '@/types/User'
import { handleFirebaseError, logError } from '@/utils/errorHandler'

const favorites = ref<string[]>([])
const loading = ref(false)
let unsubscribe: Unsubscribe | null = null

export function useFavorites() {
  const { user } = useAuth()

  // Kedvencek betöltése (one-time)
  const loadFavorites = async () => {
    if (!user.value) {
      favorites.value = []
      return
    }

    try {
      loading.value = true
      const favDocRef = doc(db, 'favorites', user.value.uid)
      const favDoc = await getDoc(favDocRef)

      if (favDoc.exists()) {
        const data = favDoc.data() as UserFavorites
        favorites.value = data.games || []
      } else {
        favorites.value = []
      }
    } catch (err) {
      logError('loadFavorites', err)
      favorites.value = []
    } finally {
      loading.value = false
    }
  }

  // Real-time kedvencek listener (automatikus szinkronizálás)
  const startFavoritesListener = () => {
    // Előző listener leállítása
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    if (!user.value) {
      favorites.value = []
      return
    }

    loading.value = true
    const favDocRef = doc(db, 'favorites', user.value.uid)

    unsubscribe = onSnapshot(
      favDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserFavorites
          favorites.value = data.games || []
        } else {
          favorites.value = []
        }
        loading.value = false
      },
      (error) => {
        logError('startFavoritesListener', error)
        favorites.value = []
        loading.value = false
      }
    )
  }

  // Listener leállítása
  const stopFavoritesListener = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // User változás figyelése - automatikus listener indítás/leállítás
  watch(user, (newUser) => {
    if (newUser) {
      startFavoritesListener()
    } else {
      stopFavoritesListener()
      favorites.value = []
    }
  }, { immediate: true })

  // Kedvenc hozzáadása
  const addFavorite = async (gameId: string) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    if (favorites.value.includes(gameId)) {
      return // Már kedvenc
    }

    const previousFavorites = [...favorites.value]

    try {
      // Optimistic update
      favorites.value = [...favorites.value, gameId]

      // Firestore frissítése
      const favDocRef = doc(db, 'favorites', user.value.uid)
      const updatedFavorites: UserFavorites = {
        uid: user.value.uid,
        games: favorites.value,
        updatedAt: Timestamp.now()
      }

      await setDoc(favDocRef, updatedFavorites)
    } catch (err) {
      logError('addFavorite', err)
      // Rollback hiba esetén
      favorites.value = previousFavorites
      throw new Error(handleFirebaseError(err))
    }
  }

  // Kedvenc eltávolítása
  const removeFavorite = async (gameId: string) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    if (!favorites.value.includes(gameId)) {
      return // Nem kedvenc
    }

    const previousFavorites = [...favorites.value]

    try {
      // Optimistic update
      favorites.value = favorites.value.filter(id => id !== gameId)

      // Firestore frissítése
      const favDocRef = doc(db, 'favorites', user.value.uid)
      const updatedFavorites: UserFavorites = {
        uid: user.value.uid,
        games: favorites.value,
        updatedAt: Timestamp.now()
      }

      await setDoc(favDocRef, updatedFavorites)
    } catch (err) {
      logError('removeFavorite', err)
      // Rollback hiba esetén
      favorites.value = previousFavorites
      throw new Error(handleFirebaseError(err))
    }
  }

  // Kedvenc hozzáadása/eltávolítása (toggle)
  const toggleFavorite = async (gameId: string) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    const isFav = favorites.value.includes(gameId)
    
    if (isFav) {
      await removeFavorite(gameId)
    } else {
      await addFavorite(gameId)
    }
  }

  // Ellenőrzi, hogy egy játék kedvenc-e
  const isFavorite = (gameId: string) => {
    return computed(() => favorites.value.includes(gameId))
  }

  // Összes kedvenc lekérése
  const getFavorites = computed(() => favorites.value)

  // Kedvencek száma
  const favoritesCount = computed(() => favorites.value.length)

  return {
    favorites: getFavorites,
    favoritesCount,
    loading: computed(() => loading.value),
    loadFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    startFavoritesListener,
    stopFavoritesListener
  }
}
