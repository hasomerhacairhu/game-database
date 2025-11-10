<template>
  <v-app>
    <!-- Header -->
    <AppHeader />

    <!-- Main Content -->
    <v-main>
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
          @clear="clearFilters"
        />

        <!-- Game Table -->
        <GameTable
          v-if="!loading && !error"
          :games="filteredGames"
          @game-selected="openGameDetails"
        />
      </v-container>
    </v-main>

    <!-- Footer -->
    <AppFooter />

    <!-- Game Details Dialog -->
    <GameDetailsDialog
      v-model="showDetailsDialog"
      :game="selectedGame"
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGameData } from '@/composables/useGameData'
import { useGameFilter } from '@/composables/useGameFilter'
import type { Game } from '@/types/Game'

import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import GameTable from '@/components/GameTable.vue'
import GameDetailsDialog from '@/components/GameDetailsDialog.vue'

// Adatok betöltése
const { games, loading, error, refetch } = useGameData()

// Debug: games változás figyelése
watch(games, (newGames) => {
  console.log('App.vue - games változott, új hossz:', newGames.length)
}, { immediate: true })

watch(loading, (newLoading) => {
  console.log('App.vue - loading:', newLoading)
}, { immediate: true })

watch(error, (newError) => {
  console.log('App.vue - error:', newError)
}, { immediate: true })

// Szűrés
const { filterState, filteredGames, clearFilters } = useGameFilter(games)

// Debug: filteredGames változás figyelése
watch(filteredGames, (newFiltered) => {
  console.log('App.vue - filteredGames változott, új hossz:', newFiltered.length)
}, { immediate: true })

// Dialog kezelése
const showDetailsDialog = ref(false)
const selectedGame = ref<Game | null>(null)

const openGameDetails = (game: Game) => {
  selectedGame.value = game
  showDetailsDialog.value = true
}
</script>

<style scoped>
.content-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
