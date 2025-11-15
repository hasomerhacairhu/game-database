<template>
  <v-app>
    <!-- Header -->
    <AppHeader @show-favorites="showOnlyFavorites" />

    <!-- Main Content -->
    <v-main class="bg-grey-lighten-4">
      <!-- Loading Overlay -->
      <v-overlay
        :model-value="loading"
        class="loading-overlay d-flex align-center justify-center"
        persistent
      >
        <v-card
          class="loading-card pa-8"
          elevation="8"
        >
          <div class="text-center">
            <v-progress-circular
              color="primary"
              indeterminate
              size="64"
              width="6"
            ></v-progress-circular>
            <div class="text-h6 mt-6 text-grey-darken-2">Játékok betöltése...</div>
          </div>
        </v-card>
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
    <AppFooter 
      @auth-required="notification.showAuthRequired()"
      @report-inaccuracy="openEmptyReportDialog"
    />

    <!-- Game Details Dialog -->
    <GameDetailsDialog
      v-model="showDetailsDialog"
      :game="selectedGame"
      @report-inaccuracy="openReportDialog"
      @auth-required="notification.showAuthRequired()"
      @open-login-dialog="openLoginDialog"
    />

    <!-- Report Inaccuracy Dialog -->
    <ReportInaccuracyDialog
      v-model="showReportDialog"
      :game-name="reportGameName"
    />

    <!-- Login Dialog -->
    <LoginDialog v-model="showLoginDialog" />

    <!-- Global Notification Snackbar -->
    <v-snackbar
      v-model="notification.show.value"
      location="bottom center"
      :timeout="notification.timeout.value"
      color="grey-lighten-4"
      elevation="8"
      rounded="lg"
      class="notification-snackbar"
    >
      <div class="d-flex align-center">
        <div :class="`notification-border notification-border-${notification.type.value}`"></div>
        <v-icon
          :color="notification.iconColor.value"
          size="20"
          class="mr-3"
        >
          {{ notification.icon.value }}
        </v-icon>
        <span class="text-grey-darken-3">{{ notification.message.value }}</span>
      </div>
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="grey-darken-1"
          @click="notification.hideNotification()"
        >
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
import { useFavorites } from '@/composables/useFavorites'
import { useTriedGames } from '@/composables/useTriedGames'
import type { Game } from '@/types/Game'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import GameTable from '@/components/GameTable.vue'
import GameDetailsDialog from '@/components/GameDetailsDialog.vue'
import ReportInaccuracyDialog from '@/components/ReportInaccuracyDialog.vue'
import LoginDialog from '@/components/LoginDialog.vue'

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

// Favorites
const { favorites } = useFavorites()

// Tried games
const { triedGames } = useTriedGames()
console.log('🎮 App.vue: useTriedGames initialized')

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
const { filterState, filteredGames: allFilteredGames, clearFilters: clearGameFilters } = useGameFilter(games, filterGames)

// Favorites filter state
const showFavoritesOnly = ref(false)

// Toggle favorites filter
const toggleFavoritesFilter = () => {
  // Check if user is authenticated
  if (!isAuthenticated.value) {
    notification.showInfo('Jelentkezz be a kedvencek használatához!')
    return
  }
  
  showFavoritesOnly.value = !showFavoritesOnly.value
}

// Clear all filters including favorites
const clearFilters = () => {
  clearGameFilters()
  showFavoritesOnly.value = false
}

// Show only favorites - clear all filters and activate favorites filter
const showOnlyFavorites = () => {
  clearGameFilters()
  showFavoritesOnly.value = true
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
    
    // Filter by favorite game IDs
    if (favorites.value && favorites.value.length > 0) {
      result = result.filter(game => favorites.value.includes(game.id || ''))
    } else {
      // No favorites yet - show empty list
      return []
    }
  }
  
  // Return a shallow copy to avoid readonly issues
  return [...result]
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

const openEmptyReportDialog = () => {
  reportGameName.value = ''
  showReportDialog.value = true
}

// Login dialog kezelése
const showLoginDialog = ref(false)

const openLoginDialog = () => {
  showLoginDialog.value = true
}
</script>

<style scoped>
.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading overlay styles */
.loading-overlay {
  backdrop-filter: blur(8px);
  background-color: rgba(130, 205, 233, 0.3) !important;
}

.loading-card {
  background-color: white !important;
  min-width: 300px;
  border-radius: 10px !important;
}

/* Notification styles */
:deep(.notification-snackbar .v-snackbar__wrapper) {
  position: relative;
  padding-left: 0 !important;
}

.notification-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 8px 0 0 8px;
}

.notification-border-success {
  background-color: #4CAF50;
}

.notification-border-error {
  background-color: #F44336;
}

.notification-border-warning {
  background-color: #FF9800;
}

.notification-border-info {
  background-color: #2196F3;
}

:deep(.notification-snackbar .v-snackbar__content) {
  padding-left: 16px !important;
}
</style>
