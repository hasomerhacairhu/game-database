<template>
  <v-text-field
    v-model="searchText"
    label="Keresés a játékok között"
    prepend-inner-icon="mdi-magnify"
    variant="outlined"
    clearable
    density="comfortable"
    hide-details
    placeholder="Írj be bármit: játék neve, szabályok, kellékek..."
  ></v-text-field>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const searchText = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || '')
})
</script>
