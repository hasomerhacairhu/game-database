<template>
  <v-btn
    :icon="isFav ? 'mdi-star' : 'mdi-star-outline'"
    :color="isFav ? 'yellow-darken-2' : 'grey'"
    variant="text"
    size="small"
    @click="handleToggle"
    :loading="toggling"
  >
    <v-tooltip activator="parent" location="top">
      {{ isFav ? 'Eltávolítás a kedvencek közül' : 'Hozzáadás a kedvencekhez' }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFavorites } from '@/composables/useFavorites'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{
  gameName: string
}>()

const emit = defineEmits<{
  'auth-required': []
}>()

const { isAuthenticated } = useAuth()
const { isFavorite, toggleFavorite, loadFavorites } = useFavorites()

const toggling = ref(false)
const isFav = isFavorite(props.gameName)

// Kedvencek betöltése komponens mountolásakor
onMounted(async () => {
  if (isAuthenticated.value) {
    await loadFavorites()
  }
})

const handleToggle = async () => {
  // Ha nincs bejelentkezve, jelezzük
  if (!isAuthenticated.value) {
    emit('auth-required')
    return
  }

  try {
    toggling.value = true
    await toggleFavorite(props.gameName)
  } catch (err) {
    console.error('Kedvenc toggle hiba:', err)
  } finally {
    toggling.value = false
  }
}
</script>
