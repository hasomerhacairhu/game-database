import { ref, computed, readonly } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { Game, GameFilterState } from '@/types/Game'

// Cache configuration
const CACHE_KEY = 'somer_games_cache'
const CACHE_TIMESTAMP_KEY = 'somer_games_cache_timestamp'
const CACHE_DURATION = 60 * 60 * 1000 // 1 óra milliszekundumban

// Singleton state (shared across all composable instances)
const games = ref<Game[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const lastFetch = ref<number | null>(null)

/**
 * Fisher-Yates shuffle algorithm - randomize array order
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * useGameData - Firestore-based game data management
 * 
 * Load-once strategy:
 * 1. Betölt minden játékot Firestore-ból
 * 2. Cache-eli localStorage-ban 1 órára
 * 3. Client-side filtering (instant, nincs hálózati kérés)
 */
export function useGameData() {
  
  /**
   * Load from localStorage cache
   */
  const loadFromCache = (): boolean => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      
      if (cachedData && cacheTimestamp) {
        const timestamp = parseInt(cacheTimestamp, 10)
        const now = Date.now()
        
        if (now - timestamp < CACHE_DURATION) {
          const cachedGames = JSON.parse(cachedData)
          games.value = shuffleArray(cachedGames) // Randomize on each load
          lastFetch.value = timestamp
          console.log(`✅ Loaded ${games.value.length} games from cache (randomized)`)
          return true
        } else {
          console.log('⏰ Cache expired, fetching fresh data...')
        }
      }
    } catch (err) {
      console.error('❌ Cache load error:', err)
    }
    return false
  }

  /**
   * Save to localStorage cache
   */
  const saveToCache = (data: Game[]): void => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
      console.log(`💾 Cached ${data.length} games`)
    } catch (err) {
      console.error('❌ Cache save error:', err)
    }
  }

  /**
   * Fetch all games from Firestore 'games' collection
   */
  const fetchGames = async (forceRefresh = false): Promise<Game[]> => {
    // Check if already loaded and cache is valid
    if (!forceRefresh && games.value.length > 0) {
      const cacheAge = lastFetch.value ? Date.now() - lastFetch.value : Infinity
      if (cacheAge < CACHE_DURATION) {
        console.log('✅ Using in-memory cached games')
        return games.value
      }
    }

    // Try loading from localStorage first
    if (!forceRefresh && loadFromCache()) {
      return games.value
    }

    try {
      loading.value = true
      error.value = null
      
      console.log('🔄 Fetching games from Firestore...')
      
      // Firestore query: games collection, ordered by name
      const gamesRef = collection(db, 'games')
      const q = query(gamesRef, orderBy('name', 'asc'))
      const snapshot = await getDocs(q)
      
      // Map Firestore documents to Game objects
      const fetchedGames: Game[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Game))
      
      // Randomize order
      games.value = shuffleArray(fetchedGames)
      lastFetch.value = Date.now()
      
      // Save to cache (randomized order)
      saveToCache(games.value)
      
      console.log(`✅ Loaded ${fetchedGames.length} games from Firestore (randomized)`)
      
      return games.value
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch games'
      error.value = errorMessage
      console.error('❌ Firestore fetch error:', err)
      
      // If Firestore fails, try loading from cache as fallback
      if (loadFromCache()) {
        console.log('⚠️ Using stale cache as fallback')
        return games.value
      }
      
      throw new Error(errorMessage)
      
    } finally {
      loading.value = false
    }
  }

  /**
   * Client-side filtering (instant, no network request)
   * Filters games based on GameFilterState
   */
  const filterGames = (filters: Partial<GameFilterState>): Game[] => {
    let filtered = games.value

    // Simple search (name, goal, rules)
    if (filters.simpleSearch) {
      const searchLower = filters.simpleSearch.toLowerCase()
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchLower) ||
        game.goal?.toLowerCase().includes(searchLower) ||
        game.rules?.toLowerCase().includes(searchLower)
      )
    }

    // Advanced search (all text fields)
    if (filters.advancedSearch) {
      const searchLower = filters.advancedSearch.toLowerCase()
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchLower) ||
        game.goal?.toLowerCase().includes(searchLower) ||
        game.rules?.toLowerCase().includes(searchLower) ||
        game.materials?.toLowerCase().includes(searchLower) ||
        game.sourceName?.toLowerCase().includes(searchLower)
      )
    }

    // Game function filter (multi-select)
    if (filters.gameFunction && filters.gameFunction.length > 0) {
      filtered = filtered.filter(game =>
        game.gameFunction?.some(fn => filters.gameFunction!.includes(fn))
      )
    }

    // Location filter (multi-select)
    if (filters.location && filters.location.length > 0) {
      filtered = filtered.filter(game =>
        game.location?.some(loc => filters.location!.includes(loc))
      )
    }

    // Group phase filter (multi-select)
    if (filters.groupPhase && filters.groupPhase.length > 0) {
      filtered = filtered.filter(game =>
        game.groupPhase?.some(phase => filters.groupPhase!.includes(phase))
      )
    }

    // Age filter (multi-select)
    if (filters.age && filters.age.length > 0) {
      filtered = filtered.filter(game =>
        game.age?.some(ageGroup => filters.age!.includes(ageGroup))
      )
    }

    // Group size filter (multi-select)
    if (filters.groupSize && filters.groupSize.length > 0) {
      filtered = filtered.filter(game =>
        game.groupSize?.some(size => filters.groupSize!.includes(size))
      )
    }

    // Length filter (multi-select)
    if (filters.length && filters.length.length > 0) {
      filtered = filtered.filter(game =>
        game.length?.some(len => filters.length!.includes(len))
      )
    }

    return filtered
  }

  /**
   * Clear cache and refetch
   */
  const clearCache = () => {
    try {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_TIMESTAMP_KEY)
      games.value = []
      lastFetch.value = null
      console.log('🗑️ Cache cleared')
    } catch (err) {
      console.error('❌ Cache clear error:', err)
    }
  }

  /**
   * Computed: Total games count
   */
  const totalGames = computed(() => games.value.length)

  /**
   * Computed: Is data loaded
   */
  const isLoaded = computed(() => games.value.length > 0)

  /**
   * Computed: Cache age in minutes
   */
  const cacheAge = computed(() => {
    if (!lastFetch.value) return null
    return Math.floor((Date.now() - lastFetch.value) / 60000)
  })

  // Return public API
  return {
    // State (readonly to prevent external mutation)
    games: readonly(games),
    loading: readonly(loading),
    error: readonly(error),
    
    // Computed
    totalGames,
    isLoaded,
    cacheAge,
    
    // Methods
    fetchGames,
    filterGames,
    clearCache
  }
}
