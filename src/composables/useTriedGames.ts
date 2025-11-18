import { ref, computed, watch } from 'vue'
import { doc, getDoc, setDoc, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore'
import { db } from '@/plugins/firebase'
import { useAuth } from './useAuth'
import { handleFirebaseError, logError } from '@/utils/errorHandler'

interface UserTriedGames {
  uid: string
  games: string[]
  updatedAt: Timestamp
}

const triedGames = ref<string[]>([])
const loading = ref(false)
let unsubscribe: Unsubscribe | null = null

export function useTriedGames() {
  const { user } = useAuth()

  // Kipróbált játékok betöltése (one-time)
  const loadTriedGames = async () => {
    if (!user.value) {
      triedGames.value = []
      return
    }

    try {
      loading.value = true
      const triedDocRef = doc(db, 'tried', user.value.uid)
      const triedDoc = await getDoc(triedDocRef)

      if (triedDoc.exists()) {
        const data = triedDoc.data() as UserTriedGames
        triedGames.value = data.games || []
      } else {
        triedGames.value = []
      }
    } catch (err) {
      logError('loadTriedGames', err)
      triedGames.value = []
    } finally {
      loading.value = false
    }
  }

  // Real-time listener (automatikus szinkronizálás)
  const startTriedGamesListener = () => {
    // Előző listener leállítása
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    if (!user.value) {
      triedGames.value = []
      return
    }

    loading.value = true
    const triedDocRef = doc(db, 'tried', user.value.uid)

    unsubscribe = onSnapshot(
      triedDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserTriedGames
          triedGames.value = data.games || []
        } else {
          triedGames.value = []
        }
        loading.value = false
      },
      (error) => {
        logError('startTriedGamesListener', error)
        triedGames.value = []
        loading.value = false
      }
    )
  }

  // Listener leállítása
  const stopTriedGamesListener = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  // User változás figyelése - automatikus listener indítás/leállítás
  watch(user, (newUser) => {
    if (newUser) {
      startTriedGamesListener()
    } else {
      stopTriedGamesListener()
      triedGames.value = []
    }
  }, { immediate: true })

  // Kipróbált játék hozzáadása
  const addTriedGame = async (gameId: string) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    if (triedGames.value.includes(gameId)) {
      return // Már kipróbált
    }

    const previousTriedGames = [...triedGames.value]

    try {
      // Optimistic update
      triedGames.value = [...triedGames.value, gameId]

      // Firestore frissítése
      const triedDocRef = doc(db, 'tried', user.value.uid)
      const updatedTriedGames: UserTriedGames = {
        uid: user.value.uid,
        games: triedGames.value,
        updatedAt: Timestamp.now()
      }

      await setDoc(triedDocRef, updatedTriedGames)
    } catch (err) {
      logError('addTriedGame', err)
      // Rollback hiba esetén
      triedGames.value = previousTriedGames
      throw new Error(handleFirebaseError(err))
    }
  }

  // Kipróbált játék eltávolítása
  const removeTriedGame = async (gameId: string) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    if (!triedGames.value.includes(gameId)) {
      return // Nem kipróbált
    }

    const previousTriedGames = [...triedGames.value]

    try {
      // Optimistic update
      triedGames.value = triedGames.value.filter(id => id !== gameId)

      // Firestore frissítése
      const triedDocRef = doc(db, 'tried', user.value.uid)
      const updatedTriedGames: UserTriedGames = {
        uid: user.value.uid,
        games: triedGames.value,
        updatedAt: Timestamp.now()
      }

      await setDoc(triedDocRef, updatedTriedGames)
    } catch (err) {
      logError('removeTriedGame', err)
      // Rollback hiba esetén
      triedGames.value = previousTriedGames
      throw new Error(handleFirebaseError(err))
    }
  }

  // Toggle (hozzáadás/eltávolítás)
  const toggleTriedGame = async (gameId: string) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    const isTried = triedGames.value.includes(gameId)
    
    if (isTried) {
      await removeTriedGame(gameId)
    } else {
      await addTriedGame(gameId)
    }
  }

  // Ellenőrzi, hogy egy játék kipróbált-e
  const isGameTried = (gameId: string) => {
    return computed(() => triedGames.value.includes(gameId))
  }

  // Összes kipróbált játék
  const getTriedGames = computed(() => triedGames.value)

  // Kipróbált játékok száma
  const triedGamesCount = computed(() => triedGames.value.length)

  return {
    triedGames: getTriedGames,
    triedGamesCount,
    loading: computed(() => loading.value),
    loadTriedGames,
    addTriedGame,
    removeTriedGame,
    toggleTriedGame,
    isGameTried,
    startTriedGamesListener,
    stopTriedGamesListener
  }
}
