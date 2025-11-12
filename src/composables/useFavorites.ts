import { ref, computed } from 'vue'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/plugins/firebase'
import { useAuth } from './useAuth'
import type { UserFavorites } from '@/types/User'

const favorites = ref<string[]>([])
const loading = ref(false)

export function useFavorites() {
  const { user, isAuthenticated } = useAuth()

  // Kedvencek betöltése
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
      console.error('Kedvencek betöltési hiba:', err)
      favorites.value = []
    } finally {
      loading.value = false
    }
  }

  // Kedvenc hozzáadása/eltávolítása
  const toggleFavorite = async (gameName: string) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    try {
      const isFav = favorites.value.includes(gameName)
      
      // Lokális state frissítése
      if (isFav) {
        favorites.value = favorites.value.filter(name => name !== gameName)
      } else {
        favorites.value = [...favorites.value, gameName]
      }

      // Firestore frissítése
      const favDocRef = doc(db, 'favorites', user.value.uid)
      const updatedFavorites: UserFavorites = {
        uid: user.value.uid,
        games: favorites.value,
        updatedAt: Timestamp.now()
      }

      await setDoc(favDocRef, updatedFavorites)
    } catch (err) {
      console.error('Kedvenc mentési hiba:', err)
      // Rollback lokális state-et hiba esetén
      await loadFavorites()
      throw err
    }
  }

  // Ellenőrzi, hogy egy játék kedvenc-e
  const isFavorite = (gameName: string) => {
    return computed(() => favorites.value.includes(gameName))
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
    toggleFavorite,
    isFavorite
  }
}
