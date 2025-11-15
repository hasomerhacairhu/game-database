<template>
  <v-container fluid class="pa-0">
    <!-- 1. sor: Szöveges keresés (1/3) + Funkció (2/3) -->
    <v-row dense>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="advancedSearchText"
          label="Szöveges keresés"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          density="compact"
          hide-details
          placeholder="Keresés..."
        ></v-text-field>
      </v-col>

      <v-col cols="12" md="8">
        <v-select
          v-model="selectedFunctions"
          :items="GAME_FUNCTIONS"
          label="Funkció"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
          placeholder="Válassz funkciót..."
        >
          <template v-slot:prepend-inner>
            <v-icon size="small">mdi-target</v-icon>
          </template>
        </v-select>
      </v-col>
    </v-row>

    <!-- 2. sor: 5 legördülő + törlés gomb -->
    <v-row dense class="mt-2">
      <!-- Tér -->
      <v-col cols="6" sm="4" md>
        <v-select
          v-model="selectedSpaces"
          :items="LOCATION_OPTIONS"
          label="Tér"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
        >
          <template v-slot:prepend-inner>
            <v-icon size="small">mdi-map-marker</v-icon>
          </template>
        </v-select>
      </v-col>

      <!-- Csoportdinamikai fázis -->
      <v-col cols="6" sm="4" md>
        <v-tooltip text="Csoportdinamikai fázis - Tuckman modell" location="top" :open-delay="3000">
          <template v-slot:activator="{ props }">
            <v-select
              v-bind="props"
              v-model="selectedGroupPhases"
              :items="GROUP_PHASE_OPTIONS"
              label="Csoport"
              multiple
              chips
              closable-chips
              variant="outlined"
              density="compact"
              hide-details
            >
              <template v-slot:prepend-inner>
                <v-icon size="small">mdi-account-group</v-icon>
              </template>
            </v-select>
          </template>
        </v-tooltip>
      </v-col>

      <!-- Korosztály -->
      <v-col cols="6" sm="4" md>
        <v-select
          v-model="selectedAgeGroups"
          :items="AGE_OPTIONS"
          label="Korosztály"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
        >
          <template v-slot:prepend-inner>
            <v-icon size="small">mdi-cake-variant</v-icon>
          </template>
        </v-select>
      </v-col>

      <!-- Létszám -->
      <v-col cols="6" sm="4" md>
        <v-select
          v-model="selectedGroupSizes"
          :items="GROUP_SIZE_OPTIONS"
          label="Létszám"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
        >
          <template v-slot:prepend-inner>
            <v-icon size="small">mdi-account-multiple</v-icon>
          </template>
        </v-select>
      </v-col>

      <!-- Időtartam -->
      <v-col cols="6" sm="4" md>
        <v-select
          v-model="selectedDurations"
          :items="LENGTH_OPTIONS"
          label="Időtartam"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
        >
          <template v-slot:prepend-inner>
            <v-icon size="small">mdi-clock-outline</v-icon>
          </template>
        </v-select>
      </v-col>

      <!-- Kedvencek szűrő gomb -->
      <v-col cols="6" sm="4" md="auto">
        <v-btn
          @click="toggleFavorites"
          :color="showFavoritesOnly ? 'somer-orange-light' : 'primary'"
          :variant="showFavoritesOnly ? 'flat' : 'tonal'"
          density="compact"
          height="40"
          block
        >
          <v-icon start :icon="showFavoritesOnly ? 'mdi-heart' : 'mdi-heart-outline'"></v-icon>
          Kedvencek
        </v-btn>
      </v-col>

      <!-- Szűrő törlése gomb -->
      <v-col cols="6" sm="4" md="auto">
        <v-btn
          @click="clearFilters"
          color="primary"
          variant="tonal"
          density="compact"
          prepend-icon="mdi-filter-remove"
          height="40"
          block
        >
          Törlés
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameFilterState } from '@/types/Game'
import {
  GAME_FUNCTIONS,
  LOCATION_OPTIONS,
  GROUP_PHASE_OPTIONS,
  AGE_OPTIONS,
  GROUP_SIZE_OPTIONS,
  LENGTH_OPTIONS
} from '@/types/Game'

const props = defineProps<{
  modelValue: GameFilterState
  showFavoritesOnly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GameFilterState]
  'clear': []
  'toggle-favorites': []
}>()

const clearFilters = () => {
  emit('clear')
}

const toggleFavorites = () => {
  emit('toggle-favorites')
}

const advancedSearchText = computed({
  get: () => props.modelValue.advancedSearch,
  set: (value) => emit('update:modelValue', { ...props.modelValue, advancedSearch: value || '' })
})

const selectedFunctions = computed({
  get: () => props.modelValue.gameFunction,
  set: (value) => emit('update:modelValue', { ...props.modelValue, gameFunction: value })
})

const selectedSpaces = computed({
  get: () => props.modelValue.location,
  set: (value) => emit('update:modelValue', { ...props.modelValue, location: value })
})

const selectedGroupPhases = computed({
  get: () => props.modelValue.groupPhase,
  set: (value) => emit('update:modelValue', { ...props.modelValue, groupPhase: value })
})

const selectedAgeGroups = computed({
  get: () => props.modelValue.age,
  set: (value) => emit('update:modelValue', { ...props.modelValue, age: value })
})

const selectedGroupSizes = computed({
  get: () => props.modelValue.groupSize,
  set: (value) => emit('update:modelValue', { ...props.modelValue, groupSize: value })
})

const selectedDurations = computed({
  get: () => props.modelValue.length,
  set: (value) => emit('update:modelValue', { ...props.modelValue, length: value })
})

// Aktív szűrők száma
const activeFilterCount = computed(() => {
  let count = 0
  if (props.modelValue.advancedSearch) count++
  count += props.modelValue.gameFunction.length
  count += props.modelValue.location.length
  count += props.modelValue.groupPhase.length
  count += props.modelValue.age.length
  count += props.modelValue.groupSize.length
  count += props.modelValue.length.length
  return count
})

defineExpose({
  activeFilterCount
})
</script>
