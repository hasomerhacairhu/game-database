<template>
  <v-dialog v-model="dialogOpen" max-width="800" scrollable>
    <v-card v-if="game">
      <v-card-title class="text-h5 bg-primary text-white d-flex align-center">
        <span>Játék adatlap</span>
        <v-spacer></v-spacer>
        
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-close"
              variant="text"
              color="white"
              @click="closeDialog"
              size="small"
            ></v-btn>
          </template>
          <span>Bezárás (ESC)</span>
        </v-tooltip>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pt-4">
        <!-- Játék neve és akció gombok -->
        <div class="mb-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div class="d-flex align-center flex-wrap ga-2">
              <span class="text-h5 font-weight-bold">{{ game.name }}</span>
              <span v-if="game.altNames" class="text-body-1 text-medium-emphasis">
                ({{ game.altNames }})
              </span>
            </div>
            
            <!-- Akció gombok -->
            <div class="d-flex ga-2">
              <TriedGameButton
                v-if="game"
                :game-id="game.id || game.name"
                :game-name="game.name"
              />
              
              <FavoriteButton
                v-if="game"
                :game-id="game.id || game.name"
                :game-name="game.name"
                size="large"
              />
            </div>
          </div>
        </div>

        <!-- Értékelési panel -->
        <RatingPanel
          v-if="game"
          :game-id="game.id || game.name"
          :game-name="game.name"
        />

        <!-- Játék célja -->
        <div v-if="game.goal" class="mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-1">🎯 Játék célja</div>
          <div class="text-body-1">{{ game.goal }}</div>
        </div>

        <!-- Szabályok és Kellékek (blurred content) -->
        <div class="mb-4 description-container">
          <div :class="{ 'description-blurred': !isAuthenticated }">
            <!-- Szabályok -->
            <div v-if="game.rules" class="mb-4">
              <div class="text-subtitle-1 font-weight-bold mb-1">📋 Szabályok</div>
              <div 
                class="text-body-1" 
                style="white-space: pre-wrap;"
              >
                {{ game.rules }}
              </div>
            </div>

            <!-- Kellékek -->
            <div v-if="game.materials">
              <div class="text-subtitle-1 font-weight-bold mb-1">🛠️ Kellékek</div>
              <div class="text-body-1">{{ game.materials }}</div>
            </div>
          </div>
          
          <!-- Blur overlay with login prompt -->
          <div v-if="!isAuthenticated" class="blur-overlay" @click="$emit('auth-required')">
            <v-icon size="48" color="white" class="mb-3">mdi-lock</v-icon>
            <div class="text-h6 text-white font-weight-bold mb-2">Jelentkezz be a teljes leírás olvasásához!</div>
            <div class="text-subtitle-1 text-white mb-3" style="opacity: 0.9;">Díjmentesen használható.</div>
            <v-btn color="white" variant="elevated" prepend-icon="mdi-login" @click.stop="$emit('open-login-dialog')">
              Bejelentkezés
            </v-btn>
          </div>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Chipek -->
        <v-row dense>
          <!-- Bal oldali oszlop -->
          <v-col cols="12" md="6">
            <!-- Tér -->
            <div v-if="spaceChips.length > 0" class="mb-3">
              <div class="text-subtitle-2 mb-2">Tér:</div>
              <v-chip
                v-for="chip in spaceChips"
                :key="chip"
                class="mr-2 mb-2"
                size="small"
                color="somer-green-light"
                variant="flat"
              >
                {{ chip }}
              </v-chip>
            </div>

            <!-- Csoportdinamikai fázis -->
            <div v-if="groupPhaseChips.length > 0" class="mb-3">
              <div class="text-subtitle-2 mb-2">Csoportdinamikai fázis:</div>
              <v-chip
                v-for="chip in groupPhaseChips"
                :key="chip"
                class="mr-2 mb-2"
                size="small"
                color="somer-cyan-light"
                variant="flat"
              >
                {{ chip }}
              </v-chip>
            </div>

            <!-- Korosztály -->
            <div v-if="ageGroupChips.length > 0" class="mb-3">
              <div class="text-subtitle-2 mb-2">Korosztály:</div>
              <v-chip
                v-for="chip in ageGroupChips"
                :key="chip"
                class="mr-2 mb-2"
                size="small"
                color="somer-blue-light"
                variant="flat"
              >
                {{ chip }}
              </v-chip>
            </div>
          </v-col>

          <!-- Jobb oldali oszlop -->
          <v-col cols="12" md="6">
            <!-- Létszám -->
            <div v-if="groupSizeChips.length > 0" class="mb-3">
              <div class="text-subtitle-2 mb-2">Létszám:</div>
              <v-chip
                v-for="chip in groupSizeChips"
                :key="chip"
                class="mr-2 mb-2"
                size="small"
                color="somer-yellow-light"
                variant="flat"
              >
                {{ chip }}
              </v-chip>
            </div>

            <!-- Időtartam -->
            <div v-if="durationChips.length > 0" class="mb-3">
              <div class="text-subtitle-2 mb-2">Időtartam:</div>
              <v-chip
                v-for="chip in durationChips"
                :key="chip"
                class="mr-2 mb-2"
                size="small"
                color="somer-lime-light"
                variant="flat"
              >
                {{ chip }}
              </v-chip>
            </div>

            <!-- Funkció -->
            <div v-if="functionChips.length > 0" class="mb-3">
              <div class="text-subtitle-2 mb-2">Funkció:</div>
              <v-chip
                v-for="chip in functionChips"
                :key="chip"
                class="mr-2 mb-2"
                size="small"
                color="somer-orange-light"
                variant="flat"
              >
                {{ chip }}
              </v-chip>
            </div>
          </v-col>
        </v-row>

      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions at bottom of dialog -->
      <v-card-actions class="pa-4 d-flex ga-2">
        <!-- Hibabejelentés gomb -->
        <v-btn
          color="warning"
          variant="outlined"
          prepend-icon="mdi-alert-circle-outline"
          @click="isAuthenticated ? openReportDialog() : $emit('auth-required')"
        >
          Pontatlanság bejelentése
        </v-btn>
        
        <!-- Forrás megtekintése gomb -->
        <v-btn
          v-if="game?.sourceLink"
          variant="outlined"
          :href="isAuthenticated ? game.sourceLink : undefined"
          :target="isAuthenticated ? '_blank' : undefined"
          :rel="isAuthenticated ? 'noopener noreferrer' : undefined"
          @click="!isAuthenticated && $emit('auth-required')"
        >
          <v-icon start icon="mdi-link-variant"></v-icon>
          Forrás megtekintése
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { Game } from '@/types/Game'
import FavoriteButton from './FavoriteButton.vue'
import TriedGameButton from './TriedGameButton.vue'
import RatingPanel from './RatingPanel.vue'

const props = defineProps<{
  modelValue: boolean
  game: Game | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'report-inaccuracy': [gameName: string]
  'auth-required': []
  'open-login-dialog': []
}>()

const { isAuthenticated } = useAuth()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const closeDialog = () => {
  dialogOpen.value = false
}

const openReportDialog = () => {
  if (props.game) {
    emit('report-inaccuracy', props.game.name)
    closeDialog()
  }
}

// Chipek generálása
const spaceChips = computed(() => {
  return props.game?.location || []
})

const groupPhaseChips = computed(() => {
  return props.game?.groupPhase || []
})

const ageGroupChips = computed(() => {
  return props.game?.age || []
})

const groupSizeChips = computed(() => {
  return props.game?.groupSize || []
})

const durationChips = computed(() => {
  return props.game?.length || []
})

const functionChips = computed(() => {
  return props.game?.gameFunction || []
})
</script>

<style scoped lang="scss">
.description-container {
  position: relative;
  min-height: 200px;
}

.description-blurred {
  filter: blur(5px);
  user-select: none;
  pointer-events: none;
}

.blur-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(130, 205, 233, 0.45) 0%, rgba(130, 205, 233, 0.95) 100%);
  cursor: pointer;
  border-radius: 8px;
  padding: 40px 32px;
  text-align: center;
}
</style>
