<template>
  <v-card class="mb-4" elevation="1">
    <v-card-text class="pb-2">
      <!-- Szűrők -->
      <AdvancedFilter v-model="filterState" />

      <!-- Szűrő törlése gomb -->
      <v-row v-if="hasActiveFilters" dense class="mt-3">
        <v-col cols="12">
          <v-btn
            @click="clearAllFilters"
            color="error"
            variant="text"
            size="small"
            prepend-icon="mdi-filter-remove"
          >
            Szűrők törlése
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameFilterState } from '@/types/Game'
import AdvancedFilter from './AdvancedFilter.vue'

const props = defineProps<{
  modelValue: GameFilterState
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GameFilterState]
  'clear': []
}>()

const filterState = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const hasActiveFilters = computed(() => {
  return (
    props.modelValue.advancedSearch.trim() !== '' ||
    props.modelValue.functions.length > 0 ||
    props.modelValue.spaces.length > 0 ||
    props.modelValue.groupPhases.length > 0 ||
    props.modelValue.ageGroups.length > 0 ||
    props.modelValue.groupSizes.length > 0 ||
    props.modelValue.durations.length > 0
  )
})

const clearAllFilters = () => {
  emit('clear')
}
</script>
