<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="games"
      v-model:page="page"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      class="elevation-1"
      item-value="name"
      @click:row="handleRowClick"
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
          <v-pagination
            v-model="page"
            :length="pageCount"
            :total-visible="5"
            density="compact"
            class="mx-4"
          ></v-pagination>
          
          <v-spacer></v-spacer>
          <div class="d-flex align-center ga-2">
            <span class="text-caption text-medium-emphasis">Sorok/oldal:</span>
            <v-select
              v-model="itemsPerPage"
              :items="itemsPerPageOptions"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 100px;"
            ></v-select>
          </div>
        </v-toolbar>
      </template>

      <!-- Sorok -->
      <template v-slot:item="{ item }">
        <tr class="cursor-pointer" @click="handleRowClick(null, { item })">
          <td>{{ item.name }}</td>
          <td>{{ truncateText(item.goal, 100) }}</td>
          <td>{{ getSpaceDisplay(item) }}</td>
          <td>{{ getGroupPhaseDisplay(item) }}</td>
          <td>{{ getAgeGroupDisplay(item) }}</td>
          <td>{{ getGroupSizeDisplay(item) }}</td>
          <td>{{ getDurationDisplay(item) }}</td>
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
          <v-pagination
            v-model="page"
            :length="pageCount"
            :total-visible="5"
            density="compact"
            class="mx-4"
          ></v-pagination>
          
          <v-spacer></v-spacer>
          <div class="d-flex align-center ga-2">
            <span class="text-caption text-medium-emphasis">Sorok/oldal:</span>
            <v-select
              v-model="itemsPerPage"
              :items="itemsPerPageOptions"
              density="compact"
              variant="outlined"
              hide-details
              style="max-width: 100px;"
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
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Game } from '@/types/Game'
import {
  getSpaceDisplay,
  getGroupPhaseDisplay,
  getAgeGroupDisplay,
  getGroupSizeDisplay,
  getDurationDisplay
} from '@/utils/gameDisplayHelpers'

const props = defineProps<{
  games: Game[]
}>()

const emit = defineEmits<{
  'game-selected': [game: Game]
}>()

const page = ref(1)
const itemsPerPage = ref(25)
const itemsPerPageOptions = [
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
  { value: -1, title: 'Összes' }
]

const pageCount = computed(() => {
  if (itemsPerPage.value === -1) return 1
  return Math.ceil(props.games.length / itemsPerPage.value)
})

const headers = [
  { title: 'Játék neve', key: 'name', align: 'start' as const, sortable: true },
  { title: 'Cél', key: 'goal', align: 'start' as const, sortable: false },
  { title: 'Tér', key: 'space', align: 'start' as const, sortable: false },
  { title: 'Csoportdinamikai fázis', key: 'groupPhase', align: 'start' as const, sortable: false },
  { title: 'Korosztály', key: 'ageGroup', align: 'start' as const, sortable: false },
  { title: 'Létszám (fő)', key: 'groupSize', align: 'start' as const, sortable: false },
  { title: 'Időtartam', key: 'duration', align: 'start' as const, sortable: false }
]

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const handleRowClick = (_: any, { item }: { item: Game }) => {
  emit('game-selected', item)
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
