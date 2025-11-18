<template>
  <v-card-actions class="pa-4 d-flex ga-2 justify-start">
    <!-- Hibabejelentés gomb -->
    <v-btn
      color="secondary"
      variant="outlined"
      prepend-icon="mdi-alert-circle-outline"
      @click="isAuthenticated ? $emit('report-inaccuracy') : $emit('auth-required')"
    >
      Pontatlanság bejelentése
    </v-btn>
    
    <!-- Forrás megtekintése gomb -->
    <v-btn
      v-if="sourceLink"
      color="secondary"
      variant="outlined"
      :href="isAuthenticated ? sourceLink : undefined"
      :target="isAuthenticated ? '_blank' : undefined"
      :rel="isAuthenticated ? 'noopener noreferrer' : undefined"
      @click="!isAuthenticated && $emit('auth-required')"
    >
      <v-icon start icon="mdi-link-variant"></v-icon>
      Forrás megtekintése
    </v-btn>
  </v-card-actions>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

defineProps<{
  sourceLink?: string
}>()

defineEmits<{
  'report-inaccuracy': []
  'auth-required': []
}>()

const { isAuthenticated } = useAuth()
</script>
