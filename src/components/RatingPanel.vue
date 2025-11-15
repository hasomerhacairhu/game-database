<template>
  <v-card class="rating-panel mb-4" elevation="0" variant="outlined" :class="{ 'disabled-panel': !isAuthenticated }">
    <v-card-text class="pa-4">
      <!-- Átlagértékelés és közvetlen csillagozó -->
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center ga-2">
          <v-icon icon="mdi-star" :color="isAuthenticated ? 'amber-darken-2' : 'grey-lighten-2'" size="32"></v-icon>
          <div>
            <!-- Ha van értékelés -->
            <template v-if="ratingCount > 0">
              <div class="text-h4 font-weight-bold">
                {{ averageRating.toFixed(1) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ ratingCount }} értékelés
              </div>
            </template>
            
            <!-- Ha még nincs értékelés -->
            <template v-else>
              <div class="text-body-2 text-medium-emphasis">
                Légy te az első,<br>aki értékel!
              </div>
            </template>
          </div>
        </div>

        <!-- Közvetlen csillagozó -->
        <div @click.capture="handleRatingClick">
          <v-rating
            :model-value="userRating?.stars || 0"
            :length="5"
            :size="32"
            :color="isAuthenticated ? 'amber-darken-2' : 'grey-lighten-2'"
            :active-color="isAuthenticated ? 'amber-darken-2' : 'grey-lighten-2'"
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
      <v-dialog v-model="dialogOpen" max-width="450">
        <v-card>
          <v-card-title class="bg-primary text-white d-flex align-center pa-3">
            <span class="text-subtitle-1">{{ userRating ? 'Értékelés szerkesztése' : 'Játék értékelése' }}</span>
            <v-spacer></v-spacer>
            <v-btn
              icon="mdi-close"
              variant="text"
              color="white"
              size="small"
              @click="closeDialog"
            ></v-btn>
          </v-card-title>

          <v-card-text class="pa-4">
            <div class="text-center mb-3">
              <div class="text-subtitle-2 mb-3">{{ gameName }}</div>
              <v-rating
                v-model="selectedStars"
                :length="5"
                :size="56"
                color="amber-darken-2"
                active-color="amber-darken-2"
                hover
              ></v-rating>
              <div class="text-caption text-medium-emphasis mt-2">
                {{ ratingLabels[selectedStars - 1] || 'Válassz értékelést' }}
              </div>
            </div>

            <v-textarea
              ref="commentTextarea"
              v-model="comment"
              label="Megjegyzés (opcionális)"
              placeholder="Írd le a tapasztalataidat..."
              rows="3"
              variant="outlined"
              density="compact"
              counter="500"
              :rules="[rules.maxLength]"
              autofocus
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

          <v-card-actions class="pa-3">
            <v-btn
              v-if="userRating"
              color="error"
              variant="text"
              prepend-icon="mdi-delete"
              size="small"
              @click="handleDelete"
              :loading="deleting"
            >
              Törlés
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              size="small"
              @click="closeDialog"
            >
              Mégse
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-check"
              size="small"
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
import { useTriedGames } from '@/composables/useTriedGames'

interface Props {
  gameId: string
  gameName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'shake-tried-button': []
}>()

const { isAuthenticated } = useAuth()
const { isGameTried } = useTriedGames()
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

const { showSuccess, showWarning, showAuthRequired } = useNotification()

// Dialog state
const dialogOpen = ref(false)
const selectedStars = ref(0)
const comment = ref('')
const saving = ref(false)
const deleting = ref(false)
const error = ref<string | null>(null)
const isDeleting = ref(false) // Flag to prevent dialog opening after delete

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

// Check if game is tried and show error if not
const checkGameTried = (): boolean => {
  const isTried = isGameTried(props.gameId)
  if (!isTried.value) {
    showWarning('Csak kipróbált játékot értékelhetsz! Jelöld meg először a "Kipróbáltam" gombbal.')
    emit('shake-tried-button')
    return false
  }
  return true
}

// Handle clicking on rating area to detect which star was clicked
const handleRatingClick = async (event: MouseEvent) => {
  if (!isAuthenticated.value || isDeleting.value) {
    return
  }

  // Check if game is tried
  if (!checkGameTried()) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  // Find which star was clicked by examining the click target
  const target = event.target as HTMLElement
  const button = target.closest('button')
  
  if (button) {
    // Get the aria-label which contains the star number
    const ariaLabel = button.getAttribute('aria-label')
    if (ariaLabel) {
      const match = ariaLabel.match(/(\d+)/)
      if (match) {
        const clickedStars = parseInt(match[1])
        
        // If clicking the same rating, delete it
        if (userRating.value && userRating.value.stars === clickedStars) {
          event.preventDefault()
          event.stopPropagation()
          
          if (confirm('Biztosan törlöd az értékelésedet?')) {
            isDeleting.value = true
            try {
              await deleteRating(userRating.value.id!)
              showSuccess('Értékelés törölve!')
              await new Promise(resolve => setTimeout(resolve, 500))
            } catch (err: any) {
              showError(err.message || 'Hiba történt a törlés során')
            } finally {
              isDeleting.value = false
            }
          }
        }
      }
    }
  }
}

// Handle star click - open dialog with pre-selected stars or delete if same rating
const handleStarClick = async (stars: string | number) => {
  if (!isAuthenticated.value) {
    showAuthRequired()
    return
  }

  // Skip if currently in the process of deleting
  if (isDeleting.value) {
    return
  }

  // Check if game is tried
  if (!checkGameTried()) {
    return
  }

  const clickedStars = typeof stars === 'number' ? stars : parseInt(stars)

  // Ha van már értékelés és ugyanarra a csillagra kattintott, töröld
  if (userRating.value && userRating.value.stars === clickedStars) {
    if (confirm('Biztosan törlöd az értékelésedet?')) {
      isDeleting.value = true
      try {
        await deleteRating(userRating.value.id!)
        showSuccess('Értékelés törölve!')
        // Wait a bit longer to ensure the rating is cleared before allowing new clicks
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (err: any) {
        showError(err.message || 'Hiba történt a törlés során')
      } finally {
        isDeleting.value = false
      }
    }
    return
  }

  // Előre kiválasztott csillagok beállítása
  selectedStars.value = clickedStars

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

.disabled-panel {
  opacity: 0.6;
  pointer-events: none;
}
</style>
