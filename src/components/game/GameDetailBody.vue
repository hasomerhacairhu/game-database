<template>
  <div>
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
        <div v-if="game.location && game.location.length > 0" class="mb-3">
          <div class="text-subtitle-2 mb-2">Tér:</div>
          <v-chip
            v-for="chip in game.location"
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
        <div v-if="game.groupPhase && game.groupPhase.length > 0" class="mb-3">
          <div class="text-subtitle-2 mb-2">Csoportdinamikai fázis:</div>
          <v-chip
            v-for="chip in game.groupPhase"
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
        <div v-if="game.age && game.age.length > 0" class="mb-3">
          <div class="text-subtitle-2 mb-2">Korosztály:</div>
          <v-chip
            v-for="chip in game.age"
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
        <div v-if="game.groupSize && game.groupSize.length > 0" class="mb-3">
          <div class="text-subtitle-2 mb-2">Létszám:</div>
          <v-chip
            v-for="chip in game.groupSize"
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
        <div v-if="game.length && game.length.length > 0" class="mb-3">
          <div class="text-subtitle-2 mb-2">Időtartam:</div>
          <v-chip
            v-for="chip in game.length"
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
        <div v-if="game.gameFunction && game.gameFunction.length > 0" class="mb-3">
          <div class="text-subtitle-2 mb-2">Funkció:</div>
          <v-chip
            v-for="chip in game.gameFunction"
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
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import type { Game } from '@/types/Game'

defineProps<{
  game: Game
}>()

defineEmits<{
  'auth-required': []
  'open-login-dialog': []
}>()

const { isAuthenticated } = useAuth()
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
