<template>
  <v-card>
    <!-- Desktop/Tablet: Data Table -->
    <v-data-table
      v-if="!isMobile"
      :headers="headers"
      :items="enrichedGames"
      v-model:page="page"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      class="elevation-1 game-table"
      item-value="_rowKey"
      @update:items-per-page="(val) => { itemsPerPage = val; page = 1 }"
    >
      <!-- Top toolbar -->
      <template v-slot:top>
        <v-toolbar flat density="compact" class="px-2">
          <v-toolbar-title class="text-body-2">
            Találatok: <strong>{{ games.length }}</strong> játék
          </v-toolbar-title>
          <v-spacer></v-spacer>
          
          <!-- Pagination -->
          <div class="pagination-wrapper" @click="!isAuthenticated && $emit('auth-required')">
            <v-pagination
              v-model="page"
              :length="pageCount"
              :total-visible="5"
              density="compact"
              class="mx-4"
              :class="{ 'pointer-events-none': !isAuthenticated }"
            ></v-pagination>
          </div>
          
          <v-spacer></v-spacer>
          <div class="d-flex align-center ga-2" @click="!isAuthenticated && $emit('auth-required')">
            <span class="text-caption text-medium-emphasis">Sorok/oldal:</span>
            <v-select
              v-model="itemsPerPage"
              :items="itemsPerPageOptions"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 100px;"
              :class="{ 'pointer-events-none': !isAuthenticated }"
            ></v-select>
          </div>
        </v-toolbar>
      </template>

      <!-- Custom row template for tried games -->
      <template v-slot:item="{ item }">
        <tr :class="{ 'tried-game-row': item._isTried }" @click="handleRowClick(item as Game)">
          <td class="text-center">
            <FavoriteButton
              :game-id="item.id || item.name"
              :game-name="item.name"
            />
          </td>
          <td>
            <span class="font-weight-medium">{{ item.name }}</span>
          </td>
          <td>
            {{ truncateText(item.goal, 80) }}
          </td>
          <td>
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="loc in item.location"
                :key="loc"
                size="x-small"
                color="somer-green-light"
                variant="flat"
              >
                {{ shortLocation(loc) }}
              </v-chip>
              <span v-if="!item.location || item.location.length === 0">-</span>
            </div>
          </td>
          <td>
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="phase in item.groupPhase"
                :key="phase"
                size="x-small"
                color="somer-cyan-light"
                variant="flat"
              >
                {{ phase }}
              </v-chip>
              <span v-if="!item.groupPhase || item.groupPhase.length === 0">-</span>
            </div>
          </td>
          <td>
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="ageGroup in item.age"
                :key="ageGroup"
                size="x-small"
                color="somer-blue-light"
                variant="flat"
              >
                {{ ageGroup }}
              </v-chip>
              <span v-if="!item.age || item.age.length === 0">-</span>
            </div>
          </td>
          <td>
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="size in item.groupSize"
                :key="size"
                size="x-small"
                color="somer-yellow-light"
                variant="flat"
              >
                {{ size }}
              </v-chip>
              <span v-if="!item.groupSize || item.groupSize.length === 0">-</span>
            </div>
          </td>
          <td>
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="dur in item.length"
                :key="dur"
                size="x-small"
                color="somer-lime-light"
                variant="flat"
              >
                {{ dur }}
              </v-chip>
              <span v-if="!item.length || item.length.length === 0">-</span>
            </div>
          </td>
        </tr>
      </template>

      <!-- Bottom toolbar -->
      <template v-slot:bottom>
        <v-toolbar flat density="compact" class="px-2">
          <v-toolbar-title class="text-body-2">
            Találatok: <strong>{{ games.length }}</strong> játék
          </v-toolbar-title>
          <v-spacer></v-spacer>
          
          <!-- Pagination -->
          <div class="pagination-wrapper" @click="!isAuthenticated && $emit('auth-required')">
            <v-pagination
              v-model="page"
              :length="pageCount"
              :total-visible="5"
              density="compact"
              class="mx-4"
              :disabled="!isAuthenticated"
            ></v-pagination>
          </div>
          
          <v-spacer></v-spacer>
          <div class="d-flex align-center ga-2" @click="!isAuthenticated && $emit('auth-required')">
            <span class="text-caption text-medium-emphasis">Sorok/oldal:</span>
            <v-select
              v-model="itemsPerPage"
              :items="itemsPerPageOptions"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 100px;"
              :class="{ 'pointer-events-none': !isAuthenticated }"
            ></v-select>
          </div>
        </v-toolbar>
      </template>

      <!-- Nincs adat -->
      <template v-slot:no-data>
        <v-alert type="info" variant="tonal" class="ma-4">
          Nincs találat a megadott szűrési feltételekkel.
        </v-alert>
      </template>
    </v-data-table>
    
    <!-- Mobile: Card List -->
    <div v-else class="game-list-mobile">
      <!-- Mobile Header -->
      <v-toolbar flat density="compact" class="px-2">
        <v-toolbar-title class="text-body-2">
          <strong>{{ games.length }}</strong> játék
        </v-toolbar-title>
      </v-toolbar>
      
      <!-- Game Cards -->
      <div v-if="paginatedGames.length > 0" class="pa-2">
        <v-card
          v-for="game in paginatedGames"
          :key="game.id || game.name"
          class="game-card-mobile mb-3"
          :class="{ 'tried-game-card': game._isTried }"
          @click="handleRowClick(game as Game)"
        >
          <v-card-title class="d-flex align-center py-2 px-3">
            <FavoriteButton
              :game-id="game.id || game.name"
              :game-name="game.name"
              size="small"
            />
            <span class="ml-2 text-body-1 font-weight-medium">{{ game.name }}</span>
          </v-card-title>
          
          <v-card-text class="pt-0 px-3 pb-2">
            <div v-if="game.goal" class="text-caption text-medium-emphasis mb-2">
              {{ truncateText(game.goal, 120) }}
            </div>
            
            <div v-if="game.location && game.location.length > 0" class="mb-2">
              <v-chip-group>
                <v-chip
                  v-for="loc in game.location.slice(0, 2)"
                  :key="loc"
                  size="small"
                  color="somer-green-light"
                  variant="flat"
                >
                  {{ shortLocation(loc) }}
                </v-chip>
                <v-chip
                  v-if="game.location.length > 2"
                  size="small"
                  variant="text"
                >
                  +{{ game.location.length - 2 }}
                </v-chip>
              </v-chip-group>
            </div>
            
            <div class="d-flex flex-wrap gap-2">
              <div v-if="game.groupPhase && game.groupPhase.length > 0">
                <v-chip
                  v-for="phase in game.groupPhase.slice(0, 2)"
                  :key="phase"
                  size="small"
                  color="somer-cyan-light"
                  variant="flat"
                  class="mr-1"
                >
                  {{ phase }}
                </v-chip>
              </div>
              
              <div v-if="game.age && game.age.length > 0">
                <v-chip
                  v-for="ageGroup in game.age.slice(0, 2)"
                  :key="ageGroup"
                  size="small"
                  color="somer-blue-light"
                  variant="flat"
                  class="mr-1"
                >
                  {{ ageGroup }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
          
          <v-card-actions class="px-3 py-2">
            <v-spacer></v-spacer>
            <v-btn
              size="small"
              variant="text"
              color="primary"
            >
              Részletek
              <v-icon end size="small">mdi-chevron-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
      
      <!-- No data -->
      <v-alert v-else type="info" variant="tonal" class="ma-4">
        Nincs találat a megadott szűrési feltételekkel.
      </v-alert>
      
      <!-- Mobile Pagination -->
      <div class="mobile-pagination pa-3">
        <v-pagination
          v-model="page"
          :length="pageCount"
          :total-visible="3"
          density="compact"
          :disabled="!isAuthenticated"
        />
        
        <div class="d-flex justify-center align-center mt-3 gap-2">
          <span class="text-caption text-medium-emphasis">Sorok/oldal:</span>
          <v-select
            v-model="itemsPerPage"
            :items="itemsPerPageOptions"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 80px;"
            :disabled="!isAuthenticated"
          />
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, type DeepReadonly } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuth } from '@/composables/useAuth'
import { useTriedGames } from '@/composables/useTriedGames'
import type { Game } from '@/types/Game'
import FavoriteButton from './interactions/FavoriteButton.vue'

const props = defineProps<{
  games: readonly Game[] | Game[] | DeepReadonly<Game[]>
}>()

const emit = defineEmits<{
  'game-selected': [game: Game]
  'auth-required': []
}>()

const { isAuthenticated } = useAuth()
const { triedGames } = useTriedGames()
const { xs, sm } = useDisplay()

const isMobile = computed(() => xs.value || sm.value)

// Enriched games - hozzáadja a tried flag-et minden játékhoz
const enrichedGames = computed(() => {
  return props.games.map(game => {
    const gameId = game.id || game.name
    const isTried = triedGames.value.includes(gameId)
    
    return {
      ...game,
      _isTried: isTried,
      // Hozzáadjuk a tried- prefix-et a name-hez, amit az item-value használ
      _rowKey: isTried ? `tried-${gameId}` : gameId
    }
  })
})

const page = ref(1)
const itemsPerPage = ref(50)
const itemsPerPageOptions = [
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: 100, title: '100' }
]

const pageCount = computed(() => {
  return Math.ceil(props.games.length / itemsPerPage.value)
})

// Mobile pagination
const paginatedGames = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return enrichedGames.value.slice(start, end)
})

const headers = [
  { title: '', key: 'favorite', align: 'center' as const, sortable: false, width: 'auto' },
  { title: 'Játék neve', key: 'name', align: 'start' as const, sortable: true, width: '15%' },
  { title: 'Cél', key: 'goal', align: 'start' as const, sortable: true, width: '25%' },
  { title: 'Tér', key: 'space', align: 'start' as const, sortable: false, width: '10%' },
  { title: 'Csoport', key: 'groupPhase', align: 'start' as const, sortable: false, width: '10%' },
  { title: 'Kor', key: 'ageGroup', align: 'start' as const, sortable: false, width: '10%' },
  { title: 'Létszám', key: 'groupSize', align: 'start' as const, sortable: false, width: '10%' },
  { title: 'Idő', key: 'duration', align: 'start' as const, sortable: false, width: '10%' }
]

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const shortLocation = (location: string): string => {
  if (location === 'Kültéren játszható') return 'Kültér'
  if (location === 'Beltéren játszható') return 'Beltér'
  return location
}

const handleRowClick = (item: Game) => {
  emit('game-selected', item)
}
</script>

<style scoped>
/* Táblázat fejléc stílus */
:deep(.game-table thead th) {
  background-color: #08A0CA !important;
  color: white !important;
  font-family: 'Myriad Pro Bold', sans-serif !important;
  font-size: 0.95rem !important;
  font-weight: bold !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 10px 3px !important;
  border-bottom: 2px solid #06789A !important;
}

:deep(.game-table thead th .v-data-table-header__content) {
  color: white !important;
  font-weight: bold !important;
}

/* Sorok - minimális padding */
:deep(.game-table tbody tr) {
  cursor: pointer;
}

:deep(.game-table tbody td) {
  padding: 0px 3px !important;
}

:deep(.game-table tbody tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Kipróbált játékok - 3px zöld bal border */
/* Class alapú szelektor */
:deep(.game-table tbody tr.tried-game-row) {
  border-left: 3px solid #66BB6A !important;
}

:deep(.v-table tbody tr.tried-game-row td:first-child),
:deep(.game-table tbody tr.tried-game-row td:first-child),
:deep(tbody tr.tried-game-row td:first-child) {
  border-left: 3px solid #66BB6A !important;
  padding-left: 6px !important;
}



:deep(.game-table tbody tr:hover) {
  background-color: rgba(8, 160, 202, 0.08) !important;
}

.pointer-events-none {
  pointer-events: none;
}

/* Mobile Card List Styles */
.game-list-mobile {
  background-color: transparent;
}

.game-card-mobile {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  }
}

.tried-game-card {
  border-left: 4px solid #66BB6A !important;
}

.mobile-pagination {
  background-color: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.gap-2 {
  gap: 8px;
}
</style>
