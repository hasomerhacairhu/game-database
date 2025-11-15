<template>
  <v-tooltip :text="tooltipText" location="top" :open-delay="1500">
    <template v-slot:activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        :prepend-icon="isTried ? 'mdi-thumb-up' : 'mdi-thumb-up-outline'"
        :color="isTried ? 'success' : 'grey-lighten-1'"
        :loading="isLoading"
        :disabled="isLoading"
        size="large"
        variant="tonal"
        @click.stop="handleToggle"
      >
        {{ isTried ? 'Már kipróbáltam' : 'Kipróbáltam' }}
      </v-btn>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTriedGames } from '@/composables/useTriedGames'
import { useAuth } from '@/composables/useAuth'
import { useNotification } from '@/composables/useNotification'

interface Props {
  gameId: string
  gameName: string
}

const props = defineProps<Props>()

const { isGameTried, toggleTriedGame } = useTriedGames()
const { isAuthenticated } = useAuth()
const { showSuccess, showError, showInfo } = useNotification()

const isLoading = ref(false)

// Computed property a kipróbált állapothoz
const isTried = isGameTried(props.gameId)

// Tooltip szöveg
const tooltipText = computed(() => {
  if (!isAuthenticated.value) {
    return 'Jelentkezz be a funkció használatához'
  }
  return isTried.value 
    ? 'Mégsem próbáltam ki' 
    : 'Megjelölés kipróbáltként'
})

// Toggle kezelés
const handleToggle = async () => {
  // Auth gate - login szükséges
  if (!isAuthenticated.value) {
    showInfo('Jelentkezz be a funkció használatához!')
    return
  }

  isLoading.value = true
  
  // Aktuális állapot mentése a megfelelő üzenethez
  const wasAlreadyTried = isTried.value

  try {
    await toggleTriedGame(props.gameId)
    
    // Sikeres visszajelzés (fordított logika, mert már togglelve van)
    if (!wasAlreadyTried) {
      showSuccess(`"${props.gameName}" megjelölve kipróbáltként`)
    } else {
      showSuccess(`"${props.gameName}" eltávolítva a kipróbált játékok közül`)
    }
  } catch (error) {
    console.error('Kipróbált toggle hiba:', error)
    showError('Hiba történt a művelet során')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Nincs custom styling - natúr Vuetify megjelenes */
</style>
