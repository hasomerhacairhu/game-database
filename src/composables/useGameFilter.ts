import { ref, computed, type Ref, type DeepReadonly } from 'vue'
import type { Game, GameFilterState } from '@/types/Game'

/**
 * useGameFilter - Wrapper for useGameData filterGames method
 * Manages filter state and computes filtered games using array-based Game model
 * 
 * @param games - Ref to all games from useGameData (can be readonly)
 * @param filterGames - filterGames function from useGameData
 */
export function useGameFilter(
  games: Ref<readonly Game[]> | Readonly<Ref<readonly Game[]>> | Ref<DeepReadonly<Game[]>>, 
  filterGames: (filters: Partial<GameFilterState>) => Game[]
) {
  // Filter state (array-based fields matching new Game model)
  const filterState = ref<GameFilterState>({
    simpleSearch: '',
    advancedSearch: '',
    gameFunction: [],      // Array field
    location: [],          // Array field
    groupPhase: [],        // Array field
    age: [],               // Array field
    groupSize: [],         // Array field
    length: []             // Array field
  })

  /**
   * Check if any advanced filter is active
   */
  const isAdvancedFilterActive = computed(() => {
    return (
      filterState.value.advancedSearch.trim() !== '' ||
      filterState.value.gameFunction.length > 0 ||
      filterState.value.location.length > 0 ||
      filterState.value.groupPhase.length > 0 ||
      filterState.value.age.length > 0 ||
      filterState.value.groupSize.length > 0 ||
      filterState.value.length.length > 0
    )
  })

  /**
   * Filtered games using useGameData filterGames method
   */
  const filteredGames = computed(() => {
    // If no filters active, return all games (already randomized in useGameData)
    if (!isAdvancedFilterActive.value && !filterState.value.simpleSearch) {
      return games.value
    }

    // Use filterGames from useGameData (array-based filtering)
    return filterGames(filterState.value)
  })

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    filterState.value = {
      simpleSearch: '',
      advancedSearch: '',
      gameFunction: [],
      location: [],
      groupPhase: [],
      age: [],
      groupSize: [],
      length: []
    }
  }

  /**
   * Filter count (how many filters are active)
   */
  const activeFilterCount = computed(() => {
    let count = 0
    if (filterState.value.advancedSearch.trim()) count++
    if (filterState.value.gameFunction.length > 0) count++
    if (filterState.value.location.length > 0) count++
    if (filterState.value.groupPhase.length > 0) count++
    if (filterState.value.age.length > 0) count++
    if (filterState.value.groupSize.length > 0) count++
    if (filterState.value.length.length > 0) count++
    return count
  })

  return {
    filterState,
    filteredGames,
    clearFilters,
    isAdvancedFilterActive,
    activeFilterCount
  }
}
