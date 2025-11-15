<template>
  <v-tooltip :text="tooltipText" location="top" :open-delay="1500">
    <template v-slot:activator="{ props: tooltipProps }">
      <!-- Small icon-only button -->
      <v-btn
        v-if="size === 'small'"
        v-bind="tooltipProps"
        :icon="isFav ? 'mdi-heart' : 'mdi-heart-outline'"
        :color="isFav ? 'somer-orange' : 'grey-lighten-1'"
        :loading="isLoading"
        :disabled="isLoading"
        size="small"
        variant="text"
        @click.stop="handleToggle"
      />
      
      <!-- Large button with text -->
      <v-btn
        v-else
        v-bind="tooltipProps"
        :prepend-icon="isFav ? 'mdi-heart' : 'mdi-heart-outline'"
        :color="isFav ? 'somer-orange' : 'grey-lighten-1'"
        :loading="isLoading"
        :disabled="isLoading"
        size="large"
        variant="tonal"
        @click.stop="handleToggle"
      >
        {{ isFav ? 'Kedvenc' : 'Kedvenc' }}
      </v-btn>
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
  size?: 'small' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small'
})

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
      showSuccess(`"${props.gameName}" hozzáadva a kedvencekhez. ❤️`)
    } else {
      showSuccess(`"${props.gameName}" eltávolítva a kedvencek közül. 💔`)
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
