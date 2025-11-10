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
          :items="FUNCTIONS"
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
          :items="SPACES"
          label="Tér"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
        ></v-select>
      </v-col>

      <!-- Csoportdinamikai fázis -->
      <v-col cols="6" sm="4" md>
        <v-select
          v-model="selectedGroupPhases"
          :items="GROUP_PHASES"
          label="Csoport"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
        ></v-select>
      </v-col>

      <!-- Korosztály -->
      <v-col cols="6" sm="4" md>
        <v-select
          v-model="selectedAgeGroups"
          :items="AGE_GROUPS"
          label="Korosztály"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
        ></v-select>
      </v-col>

      <!-- Létszám -->
      <v-col cols="6" sm="4" md>
        <v-select
          v-model="selectedGroupSizes"
          :items="GROUP_SIZES"
          label="Létszám"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
        ></v-select>
      </v-col>

      <!-- Időtartam -->
      <v-col cols="6" sm="4" md>
        <v-select
          v-model="selectedDurations"
          :items="DURATIONS"
          label="Időtartam"
          multiple
          chips
          closable-chips
          variant="outlined"
          density="compact"
          hide-details
        ></v-select>
      </v-col>

      <!-- Szűrő törlése gomb -->
      <v-col cols="6" sm="4" md>
        <v-btn
          @click="clearFilters"
          color="error"
          variant="outlined"
          density="compact"
          prepend-icon="mdi-filter-remove"
          block
          height="40"
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
  FUNCTIONS,
  SPACES,
  GROUP_PHASES,
  AGE_GROUPS,
  GROUP_SIZES,
  DURATIONS
} from '@/types/Game'

const props = defineProps<{
  modelValue: GameFilterState
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GameFilterState]
  'clear': []
}>()

const clearFilters = () => {
  emit('clear')
}

const advancedSearchText = computed({
  get: () => props.modelValue.advancedSearch,
  set: (value) => emit('update:modelValue', { ...props.modelValue, advancedSearch: value || '' })
})

const selectedFunctions = computed({
  get: () => props.modelValue.functions,
  set: (value) => emit('update:modelValue', { ...props.modelValue, functions: value })
})

const selectedSpaces = computed({
  get: () => props.modelValue.spaces,
  set: (value) => emit('update:modelValue', { ...props.modelValue, spaces: value })
})

const selectedGroupPhases = computed({
  get: () => props.modelValue.groupPhases,
  set: (value) => emit('update:modelValue', { ...props.modelValue, groupPhases: value })
})

const selectedAgeGroups = computed({
  get: () => props.modelValue.ageGroups,
  set: (value) => emit('update:modelValue', { ...props.modelValue, ageGroups: value })
})

const selectedGroupSizes = computed({
  get: () => props.modelValue.groupSizes,
  set: (value) => emit('update:modelValue', { ...props.modelValue, groupSizes: value })
})

const selectedDurations = computed({
  get: () => props.modelValue.durations,
  set: (value) => emit('update:modelValue', { ...props.modelValue, durations: value })
})
</script>
