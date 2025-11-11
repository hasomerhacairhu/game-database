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
import { ref } from 'vue'
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

// Szűrés
const { filterState, filteredGames, clearFilters } = useGameFilter(games)

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
