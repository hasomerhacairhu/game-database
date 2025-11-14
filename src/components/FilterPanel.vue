<template>
  <v-card class="mb-4" elevation="1">
    <v-card-text class="pb-2">
      <!-- Szűrők -->
      <AdvancedFilter 
        ref="filterComponent"
        v-model="filterState"
        :show-favorites-only="showFavoritesOnly"
        @clear="emit('clear')"
        @toggle-favorites="emit('toggle-favorites')"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GameFilterState } from '@/types/Game'
import AdvancedFilter from './AdvancedFilter.vue'

const props = defineProps<{
  modelValue: GameFilterState
  showFavoritesOnly?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GameFilterState]
  'clear': []
  'toggle-favorites': []
}>()

const filterComponent = ref<InstanceType<typeof AdvancedFilter>>()

const filterState = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeFilterCount = computed(() => {
  return filterComponent.value?.activeFilterCount ?? 0
})

const clearAllFilters = () => {
  emit('clear')
}
</script>
