import { ref, computed } from 'vue'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  onSnapshot,
  Unsubscribe,
  orderBy
} from 'firebase/firestore'
import { db } from '@/plugins/firebase'
import { useAuth } from './useAuth'

export interface GameRating {
  id?: string
  gameId: string
  gameName: string
  userId: string
  userName?: string
  userEmail?: string
  stars: number
  comment?: string
  createdAt: Timestamp
  updatedAt?: Timestamp
}

const gameRatings = ref<GameRating[]>([])
const userRating = ref<GameRating | null>(null)
const loading = ref(false)
let unsubscribe: Unsubscribe | null = null

export function useRatings(gameId?: string) {
  const { user } = useAuth()

  // Átlagértékelés számítása
  const averageRating = computed(() => {
    if (gameRatings.value.length === 0) return 0
    const sum = gameRatings.value.reduce((acc, rating) => acc + rating.stars, 0)
    return Math.round((sum / gameRatings.value.length) * 10) / 10
  })

  // Értékelések száma
  const ratingCount = computed(() => gameRatings.value.length)

  // Real-time listener egy játékhoz
  const startRatingsListener = (targetGameId: string) => {
    // Előző listener leállítása
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    loading.value = true
    
    const ratingsRef = collection(db, 'ratings')
    const q = query(
      ratingsRef, 
      where('gameId', '==', targetGameId),
      orderBy('createdAt', 'desc')
    )

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        gameRatings.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as GameRating))
        
        // User saját értékelésének kikeresése
        if (user.value) {
          userRating.value = gameRatings.value.find(
            r => r.userId === user.value!.uid
          ) || null
        } else {
          userRating.value = null
        }
        
        loading.value = false
      },
      (error) => {
        console.error('Értékelések real-time hiba:', error)
        gameRatings.value = []
        userRating.value = null
        loading.value = false
      }
    )
  }

  // Listener leállítása
  const stopRatingsListener = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    gameRatings.value = []
    userRating.value = null
  }

  // Értékelés hozzáadása
  const addRating = async (rating: Omit<GameRating, 'id' | 'createdAt'>) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    try {
      const ratingsRef = collection(db, 'ratings')
      await addDoc(ratingsRef, {
        ...rating,
        userId: user.value.uid,
        userName: user.value.displayName || 'Névtelen',
        userEmail: user.value.email,
        createdAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Értékelés hozzáadási hiba:', error)
      throw error
    }
  }

  // Értékelés frissítése
  const updateRating = async (ratingId: string, data: Partial<GameRating>) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    try {
      const ratingRef = doc(db, 'ratings', ratingId)
      await updateDoc(ratingRef, {
        ...data,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Értékelés frissítési hiba:', error)
      throw error
    }
  }

  // Értékelés törlése
  const deleteRating = async (ratingId: string) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    try {
      const ratingRef = doc(db, 'ratings', ratingId)
      await deleteDoc(ratingRef)
    } catch (error) {
      console.error('Értékelés törlési hiba:', error)
      throw error
    }
  }

  // One-time load (ha nem kell real-time)
  const loadGameRatings = async (targetGameId: string) => {
    loading.value = true
    try {
      const ratingsRef = collection(db, 'ratings')
      const q = query(
        ratingsRef, 
        where('gameId', '==', targetGameId),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      gameRatings.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as GameRating))
      
      // User saját értékelésének kikeresése
      if (user.value) {
        userRating.value = gameRatings.value.find(
          r => r.userId === user.value!.uid
        ) || null
      }
    } catch (error) {
      console.error('Értékelések betöltési hiba:', error)
      gameRatings.value = []
      userRating.value = null
    } finally {
      loading.value = false
    }
  }

  // Auto-start listener ha gameId van
  if (gameId) {
    startRatingsListener(gameId)
  }

  return {
    gameRatings: computed(() => gameRatings.value),
    userRating: computed(() => userRating.value),
    averageRating,
    ratingCount,
    loading: computed(() => loading.value),
    startRatingsListener,
    stopRatingsListener,
    loadGameRatings,
    addRating,
    updateRating,
    deleteRating
  }
}
