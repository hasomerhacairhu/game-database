<template>
  <v-card class="mb-4" elevation="1">
    <!-- Mobile: Collapsible Filter -->
    <v-expansion-panels v-if="isMobile" variant="accordion">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <div class="d-flex align-center">
            <v-icon start>mdi-filter</v-icon>
            <span>Szűrők</span>
            <v-chip v-if="activeFilterCount > 0" size="small" color="primary" class="ml-2">
              {{ activeFilterCount }}
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <AdvancedFilter 
            ref="filterComponent"
            v-model="filterState"
            :show-favorites-only="showFavoritesOnly"
            @clear="emit('clear')"
            @toggle-favorites="emit('toggle-favorites')"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    
    <!-- Desktop/Tablet: Normal View -->
    <v-card-text v-else class="pb-2">
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
import { useDisplay } from 'vuetify'
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

const { xs, sm } = useDisplay()
const isMobile = computed(() => xs.value || sm.value)

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
