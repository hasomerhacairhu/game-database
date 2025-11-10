<template>
  <v-card class="mb-4" elevation="1">
    <v-card-text class="pb-2">
      <!-- Szűrők -->
      <AdvancedFilter 
        v-model="filterState"
        @clear="clearAllFilters"
      />
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

const clearAllFilters = () => {
  emit('clear')
}
</script>
