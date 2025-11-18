<template>
  <div v-if="error" class="error-boundary">
    <v-container class="d-flex align-center justify-center" style="min-height: 400px;">
      <v-card max-width="600" class="mx-auto">
        <v-card-title class="text-h5 bg-error text-white d-flex align-center">
          <v-icon start size="large">mdi-alert-circle</v-icon>
          <span>Valami hiba történt</span>
        </v-card-title>
        
        <v-card-text class="pt-6">
          <div class="mb-4">
            <p class="text-body-1 mb-2">
              Sajnáljuk, de egy váratlan hiba lépett fel az alkalmazásban.
            </p>
            <p class="text-body-2 text-medium-emphasis">
              Kérjük, próbáld újra, vagy lépj kapcsolatba az adminisztrátorral, ha a probléma továbbra is fennáll.
            </p>
          </div>

          <v-alert
            v-if="showDetails"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            <div class="text-caption">
              <strong>Hiba részletei:</strong>
              <pre class="mt-2" style="white-space: pre-wrap; font-size: 0.75rem;">{{ error.message }}</pre>
            </div>
          </v-alert>

          <v-btn
            variant="text"
            size="small"
            @click="showDetails = !showDetails"
            class="mb-2"
          >
            {{ showDetails ? 'Részletek elrejtése' : 'Részletek megjelenítése' }}
            <v-icon end>{{ showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-refresh"
            @click="reset"
          >
            Újrapróbálás
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="secondary"
            variant="outlined"
            prepend-icon="mdi-home"
            @click="goHome"
          >
            Kezdőlap
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)
const showDetails = ref(false)

onErrorCaptured((err) => {
  error.value = err as Error
  console.error('ErrorBoundary caught:', err)
  
  // Opcionálisan küldhető error tracking szolgáltatásnak (pl. Sentry)
  // logErrorToService(err)
  
  return false // Megállítja a buborékozást
})

const reset = () => {
  error.value = null
  showDetails.value = false
  window.location.reload()
}

const goHome = () => {
  error.value = null
  showDetails.value = false
  window.location.href = '/'
}
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
