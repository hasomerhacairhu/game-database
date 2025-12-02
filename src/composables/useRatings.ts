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
import { useGameData } from './useGameData'
import { handleFirebaseError, logError } from '@/utils/errorHandler'

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
  const { updateGameRating } = useGameData()

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
        logError('startRatingsListener', error)
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

  // Helper: Update game document with new rating stats
  const updateGameRatingStats = async (targetGameId: string) => {
    try {
      // Query ratings collection for this game
      const ratingsRef = collection(db, 'ratings')
      const q = query(ratingsRef, where('gameId', '==', targetGameId))
      const snapshot = await getDocs(q)
      
      let averageRating: number | null = null
      let ratingCount = 0
      
      if (snapshot.empty) {
        // No ratings, set to null/0
        const gameRef = doc(db, 'games', targetGameId)
        await updateDoc(gameRef, {
          averageRating: null,
          ratingCount: 0
        })
        console.log(`✅ Updated game ${targetGameId}: no ratings`)
      } else {
        // Calculate average
        const ratings = snapshot.docs.map(doc => doc.data().stars as number)
        const sum = ratings.reduce((acc, rating) => acc + rating, 0)
        const average = sum / ratings.length
        averageRating = Number(average.toFixed(2))
        ratingCount = ratings.length
        
        // Update game document
        const gameRef = doc(db, 'games', targetGameId)
        await updateDoc(gameRef, {
          averageRating,
          ratingCount
        })
        console.log(`✅ Updated game ${targetGameId}: avg ${averageRating}, count ${ratingCount}`)
      }
      
      // Update in-memory cache for reactive UI
      updateGameRating(targetGameId, averageRating, ratingCount)
    } catch (error) {
      logError('updateGameRatingStats', error)
      console.error('❌ Failed to update game rating stats:', error)
      // Don't throw - this is a background update
    }
  }

  // Értékelés hozzáadása
  const addRating = async (rating: Omit<GameRating, 'id' | 'createdAt'>) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    try {
      const ratingsRef = collection(db, 'ratings')
      const data: any = {
        gameId: rating.gameId,
        gameName: rating.gameName,
        userId: user.value.uid,
        userName: user.value.displayName || 'Névtelen',
        userEmail: user.value.email,
        stars: rating.stars,
        createdAt: Timestamp.now()
      }
      
      // Csak akkor add hozzá a comment-et, ha nem undefined
      if (rating.comment) {
        data.comment = rating.comment
      }
      
      await addDoc(ratingsRef, data)
      
      // Update game stats in background
      await updateGameRatingStats(rating.gameId)
    } catch (error) {
      logError('addRating', error)
      throw new Error(handleFirebaseError(error))
    }
  }

  // Értékelés frissítése
  const updateRating = async (ratingId: string, data: Partial<GameRating>) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    try {
      const ratingRef = doc(db, 'ratings', ratingId)
      const updateData: any = {
        updatedAt: Timestamp.now()
      }
      
      // Csak azokat a mezőket add hozzá, amik nem undefined
      if (data.stars !== undefined) {
        updateData.stars = data.stars
      }
      if (data.comment !== undefined) {
        updateData.comment = data.comment
      }
      
      await updateDoc(ratingRef, updateData)
      
      // Update game stats in background if gameId available
      if (data.gameId) {
        await updateGameRatingStats(data.gameId)
      }
    } catch (error) {
      logError('updateRating', error)
      throw new Error(handleFirebaseError(error))
    }
  }

  // Értékelés törlése
  const deleteRating = async (ratingId: string, targetGameId?: string) => {
    if (!user.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    try {
      const ratingRef = doc(db, 'ratings', ratingId)
      await deleteDoc(ratingRef)
      
      // Update game stats in background if gameId available
      if (targetGameId) {
        await updateGameRatingStats(targetGameId)
      }
    } catch (error) {
      logError('deleteRating', error)
      throw new Error(handleFirebaseError(error))
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
      logError('loadGameRatings', error)
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
