<template>
  <v-app>
    <!-- Header -->
    <AppHeader />

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">
      <!-- Loading Overlay -->
      <v-overlay
        :model-value="loading"
        class="align-center justify-center"
        persistent
      >
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
        <div class="text-h6 mt-4 text-white">Játékok betöltése...</div>
      </v-overlay>

      <!-- Központosított tartalom max 1200px -->
      <v-container class="content-container pa-4">
        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
        >
          <v-alert-title>Hiba történt</v-alert-title>
          {{ error }}
          <template v-slot:append>
            <v-btn @click="refetch" variant="text" size="small">
              Újrapróbálás
            </v-btn>
          </template>
        </v-alert>

        <!-- Filter Panel -->
        <FilterPanel
          v-if="!loading && !error"
          v-model="filterState"
          :show-favorites-only="showFavoritesOnly"
          @clear="clearFilters"
          @toggle-favorites="toggleFavoritesFilter"
        />

        <!-- Game Table -->
        <GameTable
          v-if="!loading && !error"
          :games="filteredGames"
          @game-selected="openGameDetails"
          @auth-required="notification.showAuthRequired()"
        />
      </v-container>
    </v-main>

    <!-- Footer -->
    <AppFooter @auth-required="notification.showAuthRequired()" />

    <!-- Game Details Dialog -->
    <GameDetailsDialog
      v-model="showDetailsDialog"
      :game="selectedGame"
      @report-inaccuracy="openReportDialog"
      @auth-required="notification.showAuthRequired()"
    />

    <!-- Report Inaccuracy Dialog -->
    <ReportInaccuracyDialog
      v-model="showReportDialog"
      :game-name="reportGameName"
    />

    <!-- Global Notification Snackbar -->
    <v-snackbar
      v-model="notification.show.value"
      :color="notification.type.value"
      location="bottom center"
      :timeout="notification.timeout.value"
    >
      {{ notification.message.value }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="notification.hideNotification()"
        >
          Bezár
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useGameData } from '@/composables/useGameData'
import { useGameFilter } from '@/composables/useGameFilter'
import { useNotification } from '@/composables/useNotification'
import { useAuth } from '@/composables/useAuth'
import type { Game } from '@/types/Game'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import GameTable from '@/components/GameTable.vue'
import GameDetailsDialog from '@/components/GameDetailsDialog.vue'
import ReportInaccuracyDialog from '@/components/ReportInaccuracyDialog.vue'

// Notification rendszer
const notification = useNotification()

// Adatok betöltése (Firestore)
const { 
  games, 
  loading, 
  error, 
  fetchGames, 
  filterGames, 
  totalGames, 
  cacheAge 
} = useGameData()

// Auth
const { isAuthenticated } = useAuth()

// Favorites - TODO: implement proper useFavorites composable
const favoriteGames = ref<Game[]>([])

// Játékok betöltése app induláskor
onMounted(async () => {
  try {
    await fetchGames()
    console.log(`✅ App loaded: ${totalGames.value} games from Firestore`)
    
    // Debug: cache info
    if (cacheAge.value !== null) {
      console.log(`📦 Cache age: ${cacheAge.value} minutes`)
    }
  } catch (err) {
    console.error('❌ Failed to load games:', err)
    notification.showError('Nem sikerült betölteni a játékokat. Próbáld újra később!')
  }
})

// Refetch wrapper with notification
const refetch = async () => {
  try {
    await fetchGames(true) // Force refresh
    notification.showSuccess('Játékok sikeresen frissítve!')
  } catch (err) {
    notification.showError('Nem sikerült frissíteni a játékokat.')
  }
}

// Szűrés - használjuk a useGameFilter-t a filterState kezeléséhez
const { filterState, filteredGames: allFilteredGames, clearFilters } = useGameFilter(games, filterGames)

// Favorites filter state
const showFavoritesOnly = ref(false)

// Toggle favorites filter
const toggleFavoritesFilter = () => {
  showFavoritesOnly.value = !showFavoritesOnly.value
}

// Computed property for filtered games including favorites logic
const filteredGames = computed(() => {
  let result = allFilteredGames.value
  
  // Favorites filter
  if (showFavoritesOnly.value) {
    if (!isAuthenticated.value) {
      // Not authenticated - show empty list
      return []
    }
    
    // Check if favoriteGames exists and has value
    if (favoriteGames && favoriteGames.value && Array.isArray(favoriteGames.value)) {
      const favoriteIds = favoriteGames.value.map((g: Game) => g.id || g.name)
      result = result.filter(game => favoriteIds.includes(game.id || game.name))
    } else {
      // No favorites loaded yet - show empty list
      return []
    }
  }
  
  return result
})

// Dialog kezelése
const showDetailsDialog = ref(false)
const selectedGame = ref<Game | null>(null)

const openGameDetails = (game: Game) => {
  selectedGame.value = game
  showDetailsDialog.value = true
}

// Report dialog kezelése
const showReportDialog = ref(false)
const reportGameName = ref('')

const openReportDialog = (gameName: string) => {
  reportGameName.value = gameName
  showReportDialog.value = true
}
</script>

<style scoped>
.content-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
