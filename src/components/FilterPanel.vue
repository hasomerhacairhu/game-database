<template>
  <v-card class="mb-4" elevation="1">
    <v-card-title class="d-flex align-center pb-0">
      <v-icon class="mr-2" size="small">mdi-filter</v-icon>
      <span>Szűrők</span>
      <v-badge
        v-if="activeFilterCount > 0"
        :content="activeFilterCount"
        color="primary"
        inline
        class="ml-2"
      ></v-badge>
    </v-card-title>
    <v-card-text class="pb-2">
      <!-- Szűrők -->
      <AdvancedFilter 
        ref="filterComponent"
        v-model="filterState"
        @clear="clearAllFilters"
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
}>()

const emit = defineEmits<{
  'update:modelValue': [value: GameFilterState]
  'clear': []
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
