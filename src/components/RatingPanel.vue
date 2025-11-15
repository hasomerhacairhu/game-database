<template>
  <v-card class="rating-panel mb-4" elevation="0" variant="outlined">
    <v-card-text class="pa-4">
      <!-- Átlagértékelés és közvetlen csillagozó -->
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-star" color="amber-darken-2" size="28"></v-icon>
          <div>
            <div class="text-h6">
              {{ averageRating > 0 ? averageRating.toFixed(1) : '–' }}
              <span class="text-body-2 text-medium-emphasis">/ 5.0</span>
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ ratingCount }} értékelés
            </div>
          </div>
        </div>

        <!-- Közvetlen csillagozó -->
        <div>
          <v-rating
            :model-value="userRating?.stars || 0"
            :length="5"
            :size="32"
            color="amber-darken-2"
            active-color="amber-darken-2"
            hover
            :disabled="!isAuthenticated"
            @update:model-value="handleStarClick"
          ></v-rating>
          <div v-if="!isAuthenticated" class="text-caption text-medium-emphasis text-center mt-1">
            Jelentkezz be az értékeléshez
          </div>
        </div>
      </div>

      <!-- Értékelő dialog -->
      <v-dialog v-model="dialogOpen" max-width="500">
        <v-card>
          <v-card-title class="bg-primary text-white d-flex align-center">
            <span>{{ userRating ? 'Értékelés szerkesztése' : 'Játék értékelése' }}</span>
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              size="small"
              @click="closeDialog"
            ></v-btn>
          </v-card-title>

          <v-card-text class="pt-6">
            <div class="text-center mb-4">
              <div class="text-h6 mb-3">{{ gameName }}</div>
              <v-rating
                v-model="selectedStars"
                :length="5"
                :size="48"
                color="amber-darken-2"
                active-color="amber-darken-2"
                hover
              ></v-rating>
              <div class="text-caption text-medium-emphasis mt-2">
                {{ ratingLabels[selectedStars - 1] || 'Válassz értékelést' }}
              </div>
            </div>

            <v-textarea
              v-model="comment"
              label="Megjegyzés (opcionális)"
              placeholder="Írd le a tapasztalataidat..."
              rows="4"
              variant="outlined"
              counter="500"
              :rules="[rules.maxLength]"
            ></v-textarea>

            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-0"
            >
              {{ error }}
            </v-alert>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn
              v-if="userRating"
              color="error"
              variant="text"
              prepend-icon="mdi-delete"
              @click="handleDelete"
              :loading="deleting"
            >
              Törlés
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              @click="closeDialog"
            >
              Mégse
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-check"
              @click="handleSubmit"
              :loading="saving"
              :disabled="selectedStars === 0"
            >
              {{ userRating ? 'Mentés' : 'Értékelés' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRatings } from '@/composables/useRatings'
import { useNotification } from '@/composables/useNotification'

interface Props {
  gameId: string
  gameName: string
}

const props = defineProps<Props>()

const { isAuthenticated } = useAuth()
const { 
  userRating, 
  averageRating, 
  ratingCount, 
  addRating, 
  updateRating, 
  deleteRating,
  startRatingsListener,
  stopRatingsListener
} = useRatings()

const { showSuccess, showError, showAuthRequired } = useNotification()

// Dialog state
const dialogOpen = ref(false)
const selectedStars = ref(0)
const comment = ref('')
const saving = ref(false)
const deleting = ref(false)
const error = ref<string | null>(null)

// Rating labels
const ratingLabels = [
  'Nagyon rossz',
  'Rossz',
  'Közepes',
  'Jó',
  'Kiváló'
]

// Form validation
const rules = {
  maxLength: (v: string) => !v || v.length <= 500 || 'Maximum 500 karakter'
}

// Start listener for this game
watch(() => props.gameId, (newGameId) => {
  if (newGameId) {
    startRatingsListener(newGameId)
  }
}, { immediate: true })

// Cleanup on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  stopRatingsListener()
})

// Handle star click - open dialog with pre-selected stars
const handleStarClick = (stars: string | number) => {
  if (!isAuthenticated.value) {
    showAuthRequired()
    return
  }

  // Előre kiválasztott csillagok beállítása
  selectedStars.value = typeof stars === 'number' ? stars : parseInt(stars)

  // Ha van már értékelés, töltsd be a megjegyzést
  if (userRating.value) {
    comment.value = userRating.value.comment || ''
  } else {
    comment.value = ''
  }

  error.value = null
  dialogOpen.value = true
}

// Close dialog
const closeDialog = () => {
  dialogOpen.value = false
  selectedStars.value = 0
  comment.value = ''
  error.value = null
}

// Submit rating
const handleSubmit = async () => {
  if (selectedStars.value === 0) {
    error.value = 'Válassz csillagot!'
    return
  }

  saving.value = true
  error.value = null

  try {
    if (userRating.value) {
      // Update existing rating
      await updateRating(userRating.value.id!, {
        stars: selectedStars.value,
        comment: comment.value.trim() || undefined
      })
      showSuccess('Értékelés frissítve!')
    } else {
      // Create new rating
      await addRating({
        gameId: props.gameId,
        gameName: props.gameName,
        userId: '',  // A composable fogja kitölteni
        stars: selectedStars.value,
        comment: comment.value.trim() || undefined
      })
      showSuccess('Értékelés mentve!')
    }
    closeDialog()
  } catch (err: any) {
    error.value = err.message || 'Hiba történt a mentés során'
    showError(error.value || 'Hiba történt')
  } finally {
    saving.value = false
  }
}

// Delete rating
const handleDelete = async () => {
  if (!userRating.value) return

  if (!confirm('Biztosan törlöd az értékelésedet?')) {
    return
  }

  deleting.value = true
  error.value = null

  try {
    await deleteRating(userRating.value.id!)
    showSuccess('Értékelés törölve!')
    closeDialog()
  } catch (err: any) {
    error.value = err.message || 'Hiba történt a törlés során'
    showError(error.value || 'Hiba történt')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.rating-panel {
  border-color: rgba(0, 0, 0, 0.12);
}
</style>
