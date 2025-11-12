<template>
  <v-tooltip :text="tooltipText" location="top">
    <template v-slot:activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        :icon="isFav ? 'mdi-heart' : 'mdi-heart-outline'"
        :color="isFav ? 'error' : 'grey-lighten-1'"
        :loading="isLoading"
        :disabled="isLoading"
        size="small"
        variant="text"
        @click.stop="handleToggle"
      />
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFavorites } from '@/composables/useFavorites'
import { useAuth } from '@/composables/useAuth'
import { useNotification } from '@/composables/useNotification'

interface Props {
  gameId: string
  gameName: string
}

const props = defineProps<Props>()

const { isFavorite, toggleFavorite } = useFavorites()
const { isAuthenticated } = useAuth()
const { showSuccess, showError, showInfo } = useNotification()

const isLoading = ref(false)

// Computed property a kedvenc állapothoz
const isFav = isFavorite(props.gameId)

// Tooltip szöveg
const tooltipText = computed(() => {
  if (!isAuthenticated.value) {
    return 'Jelentkezz be a kedvencek használatához'
  }
  return isFav.value ? 'Eltávolítás a kedvencek közül' : 'Hozzáadás a kedvencekhez'
})

// Toggle kezelés
const handleToggle = async () => {
  // Auth gate - login szükséges
  if (!isAuthenticated.value) {
    showInfo('Jelentkezz be a kedvencek használatához!')
    return
  }

  isLoading.value = true
  
  // Aktuális állapot mentése a megfelelő üzenethez
  const wasAlreadyFavorite = isFav.value

  try {
    await toggleFavorite(props.gameId)
    
    // Sikeres visszajelzés (fordított logika, mert már togglelve van)
    if (!wasAlreadyFavorite) {
      showSuccess(`"${props.gameName}" hozzáadva a kedvencekhez`)
    } else {
      showSuccess(`"${props.gameName}" eltávolítva a kedvencek közül`)
    }
  } catch (error) {
    console.error('Kedvenc toggle hiba:', error)
    showError('Hiba történt a kedvencek frissítése során')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Animált szív effekt */
.v-btn--icon {
  transition: transform 0.2s ease;
}

.v-btn--icon:hover {
  transform: scale(1.15);
}

.v-btn--icon:active {
  transform: scale(0.95);
}
</style>
