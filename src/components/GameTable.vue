<template>
  <v-card>
    <v-data-table
      :headers="headers"
      :items="games"
      v-model:page="page"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      class="elevation-1 game-table"
      item-value="name"
      @click:row="(_, row) => handleRowClick(row.item)"
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

      <!-- Név oszlop -->
      <template v-slot:item.name="{ item }">
        <span class="font-weight-medium">{{ item.name }}</span>
      </template>

      <!-- Cél oszlop -->
      <template v-slot:item.goal="{ item }">
        {{ truncateText(item.goal, 100) }}
      </template>

      <!-- Tér oszlop -->
      <template v-slot:item.space="{ item }">
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-if="item.outdoorSpace"
            size="x-small"
            color="somer-green-light"
            variant="flat"
          >
            Kültér
          </v-chip>
          <v-chip
            v-if="item.indoorSpace"
            size="x-small"
            color="somer-green-light"
            variant="flat"
          >
            Beltér
          </v-chip>
          <span v-if="!item.outdoorSpace && !item.indoorSpace">-</span>
        </div>
      </template>

      <!-- Csoport oszlop -->
      <template v-slot:item.groupPhase="{ item }">
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-if="item.groupPhaseForming"
            size="x-small"
            color="somer-cyan-light"
            variant="flat"
          >
            Alakulás
          </v-chip>
          <v-chip
            v-if="item.groupPhaseStorming"
            size="x-small"
            color="somer-cyan-light"
            variant="flat"
          >
            Viharzás
          </v-chip>
          <v-chip
            v-if="item.groupPhaseNorming"
            size="x-small"
            color="somer-cyan-light"
            variant="flat"
          >
            Normázás
          </v-chip>
          <v-chip
            v-if="item.groupPhasePerforming"
            size="x-small"
            color="somer-cyan-light"
            variant="flat"
          >
            Működés
          </v-chip>
          <span v-if="!item.groupPhaseForming && !item.groupPhaseStorming && !item.groupPhaseNorming && !item.groupPhasePerforming">-</span>
        </div>
      </template>

      <!-- Kor oszlop -->
      <template v-slot:item.ageGroup="{ item }">
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-if="item.age0to5"
            size="x-small"
            color="somer-blue-light"
            variant="flat"
          >
            0-5
          </v-chip>
          <v-chip
            v-if="item.age6to10"
            size="x-small"
            color="somer-blue-light"
            variant="flat"
          >
            6-10
          </v-chip>
          <v-chip
            v-if="item.age11to13"
            size="x-small"
            color="somer-blue-light"
            variant="flat"
          >
            11-13
          </v-chip>
          <v-chip
            v-if="item.age14to16"
            size="x-small"
            color="somer-blue-light"
            variant="flat"
          >
            14-16
          </v-chip>
          <v-chip
            v-if="item.age17plus"
            size="x-small"
            color="somer-blue-light"
            variant="flat"
          >
            17+
          </v-chip>
          <span v-if="!item.age0to5 && !item.age6to10 && !item.age11to13 && !item.age14to16 && !item.age17plus">-</span>
        </div>
      </template>

      <!-- Fő oszlop -->
      <template v-slot:item.groupSize="{ item }">
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-if="item.groupSizeSmall"
            size="x-small"
            color="somer-yellow-light"
            variant="flat"
          >
            3-5
          </v-chip>
          <v-chip
            v-if="item.groupSizeMedium"
            size="x-small"
            color="somer-yellow-light"
            variant="flat"
          >
            6-15
          </v-chip>
          <v-chip
            v-if="item.groupSizeLarge"
            size="x-small"
            color="somer-yellow-light"
            variant="flat"
          >
            16-30
          </v-chip>
          <v-chip
            v-if="item.groupSizeCommunity"
            size="x-small"
            color="somer-yellow-light"
            variant="flat"
          >
            30+
          </v-chip>
          <span v-if="!item.groupSizeSmall && !item.groupSizeMedium && !item.groupSizeLarge && !item.groupSizeCommunity">-</span>
        </div>
      </template>

      <!-- Idő oszlop -->
      <template v-slot:item.duration="{ item }">
        <div class="d-flex flex-wrap ga-1">
          <v-chip
            v-if="item.duration3to10"
            size="x-small"
            color="somer-lime-light"
            variant="flat"
          >
            3-10
          </v-chip>
          <v-chip
            v-if="item.duration11to20"
            size="x-small"
            color="somer-lime-light"
            variant="flat"
          >
            11-20
          </v-chip>
          <v-chip
            v-if="item.duration21to30"
            size="x-small"
            color="somer-lime-light"
            variant="flat"
          >
            21-30
          </v-chip>
          <v-chip
            v-if="item.duration30plus"
            size="x-small"
            color="somer-lime-light"
            variant="flat"
          >
            30+
          </v-chip>
          <span v-if="!item.duration3to10 && !item.duration11to20 && !item.duration21to30 && !item.duration30plus">-</span>
        </div>
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
  { title: 'Játék neve', key: 'name', align: 'start' as const, sortable: true, width: '250px' },
  { title: 'Cél', key: 'goal', align: 'start' as const, sortable: false, width: '300px' },
  { title: 'Tér', key: 'space', align: 'start' as const, sortable: false, width: '120px' },
  { title: 'Csoport', key: 'groupPhase', align: 'start' as const, sortable: false, width: '140px' },
  { title: 'Kor', key: 'ageGroup', align: 'start' as const, sortable: false, width: '140px' },
  { title: 'Fő', key: 'groupSize', align: 'start' as const, sortable: false, width: '120px' },
  { title: 'Idő', key: 'duration', align: 'start' as const, sortable: false, width: '120px' }
]

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const handleRowClick = (item: Game) => {
  emit('game-selected', item)
}
</script>

<style scoped>
:deep(.game-table tbody tr) {
  cursor: pointer;
}

:deep(.game-table tbody tr:nth-child(even)) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.game-table tbody tr:hover) {
  background-color: rgba(8, 160, 202, 0.08) !important;
}
</style>
