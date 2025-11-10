import { ref, computed, type Ref } from 'vue'
import type { Game, GameFilterState } from '@/types/Game'
import {
  SPACES,
  GROUP_PHASES,
  AGE_GROUPS,
  GROUP_SIZES,
  DURATIONS
} from '@/types/Game'

export function useGameFilter(games: Ref<Game[]>) {
  const filterState = ref<GameFilterState>({
    simpleSearch: '',
    advancedSearch: '',
    functions: [],
    spaces: [],
    groupPhases: [],
    ageGroups: [],
    groupSizes: [],
    durations: []
  })

  const isAdvancedFilterActive = computed(() => {
    return (
      filterState.value.advancedSearch.trim() !== '' ||
      filterState.value.functions.length > 0 ||
      filterState.value.spaces.length > 0 ||
      filterState.value.groupPhases.length > 0 ||
      filterState.value.ageGroups.length > 0 ||
      filterState.value.groupSizes.length > 0 ||
      filterState.value.durations.length > 0
    )
  })

  const normalizeText = (text: string): string => {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  const matchesSimpleSearch = (game: Game, searchTerm: string): boolean => {
    const normalized = normalizeText(searchTerm)
    
    const searchableFields = [
      game.name,
      game.altNames,
      game.goal,
      game.rules,
      game.materials,
      game.function1,
      game.function2,
      game.function3
    ]

    return searchableFields.some(field => 
      normalizeText(field || '').includes(normalized)
    )
  }

  const matchesAdvancedSearch = (game: Game): boolean => {
    // Szöveges keresés
    if (filterState.value.advancedSearch.trim() !== '') {
      if (!matchesSimpleSearch(game, filterState.value.advancedSearch)) {
        return false
      }
    }

    // Funkciók szűrése (OR logika - legalább egy megfelel)
    if (filterState.value.functions.length > 0) {
      const gameFunctions = [game.function1, game.function2, game.function3].filter(f => f)
      const hasMatchingFunction = filterState.value.functions.some(selectedFunc =>
        gameFunctions.some(gameFunc => gameFunc === selectedFunc)
      )
      if (!hasMatchingFunction) return false
    }

    // Tér szűrése (OR logika)
    if (filterState.value.spaces.length > 0) {
      const hasMatchingSpace = filterState.value.spaces.some(space => {
        if (space === SPACES[0]) return game.outdoorSpace
        if (space === SPACES[1]) return game.indoorSpace
        return false
      })
      if (!hasMatchingSpace) return false
    }

    // Csoportdinamikai fázis (OR logika)
    if (filterState.value.groupPhases.length > 0) {
      const hasMatchingPhase = filterState.value.groupPhases.some(phase => {
        if (phase === GROUP_PHASES[0]) return game.groupPhaseForming
        if (phase === GROUP_PHASES[1]) return game.groupPhaseStorming
        if (phase === GROUP_PHASES[2]) return game.groupPhaseNorming
        if (phase === GROUP_PHASES[3]) return game.groupPhasePerforming
        return false
      })
      if (!hasMatchingPhase) return false
    }

    // Korosztály (OR logika)
    if (filterState.value.ageGroups.length > 0) {
      const hasMatchingAge = filterState.value.ageGroups.some(age => {
        if (age === AGE_GROUPS[0]) return game.age0to5
        if (age === AGE_GROUPS[1]) return game.age6to10
        if (age === AGE_GROUPS[2]) return game.age11to13
        if (age === AGE_GROUPS[3]) return game.age14to16
        if (age === AGE_GROUPS[4]) return game.age17plus
        return false
      })
      if (!hasMatchingAge) return false
    }

    // Létszám (OR logika)
    if (filterState.value.groupSizes.length > 0) {
      const hasMatchingSize = filterState.value.groupSizes.some(size => {
        if (size === GROUP_SIZES[0]) return game.groupSizeSmall
        if (size === GROUP_SIZES[1]) return game.groupSizeMedium
        if (size === GROUP_SIZES[2]) return game.groupSizeLarge
        if (size === GROUP_SIZES[3]) return game.groupSizeCommunity
        return false
      })
      if (!hasMatchingSize) return false
    }

    // Időtartam (OR logika)
    if (filterState.value.durations.length > 0) {
      const hasMatchingDuration = filterState.value.durations.some(duration => {
        if (duration === DURATIONS[0]) return game.duration3to10
        if (duration === DURATIONS[1]) return game.duration11to20
        if (duration === DURATIONS[2]) return game.duration21to30
        if (duration === DURATIONS[3]) return game.duration30plus
        return false
      })
      if (!hasMatchingDuration) return false
    }

    return true
  }

  const filteredGames = computed(() => {
    let result = games.value

    // Szűrés
    if (isAdvancedFilterActive.value) {
      result = result.filter(matchesAdvancedSearch)
    }

    return result
  })

  const clearFilters = () => {
    filterState.value = {
      simpleSearch: '',
      advancedSearch: '',
      functions: [],
      spaces: [],
      groupPhases: [],
      ageGroups: [],
      groupSizes: [],
      durations: []
    }
  }

  return {
    filterState,
    filteredGames,
    clearFilters,
    isAdvancedFilterActive
  }
}
