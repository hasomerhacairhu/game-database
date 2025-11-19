<template>
  <v-dialog 
    v-model="dialogOpen" 
    :max-width="dialogMaxWidth"
    :fullscreen="isMobile"
    scrollable
  >
    <v-card v-if="game">
      <!-- Mobile: Toolbar style header -->
      <v-toolbar
        v-if="isMobile"
        color="primary"
        dark
        density="comfortable"
      >
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="text-subtitle-1">{{ game.name }}</v-toolbar-title>
      </v-toolbar>
      
      <!-- Desktop: Card title -->
      <v-card-title v-else class="text-h5 bg-primary text-white d-flex align-center">
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

      <v-card-text :class="isMobile ? 'pa-3' : 'pt-4'">
        <!-- Két oszlopos layout: Cím+Cél | Gombok+Értékelés -->
        <v-row class="mb-4">
          <!-- Bal oldali oszlop: Cím és Cél -->
          <v-col cols="12" md="6">
            <GameDetailHeader :game="game" />
          </v-col>

          <!-- Jobb oldali oszlop: Akció gombok és Értékelési panel -->
          <v-col cols="12" md="6">
            <GameDetailActions 
              :game-id="game.id || game.name"
              :game-name="game.name"
            />
          </v-col>
        </v-row>

        <!-- Szabályok, Kellékek és Chipek -->
        <GameDetailBody 
          :game="game"
          @auth-required="$emit('auth-required')"
          @open-login-dialog="$emit('open-login-dialog')"
        />
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions at bottom of dialog -->
      <GameDetailFooter
        :source-link="game.sourceLink"
        @report-inaccuracy="openReportDialog"
        @auth-required="$emit('auth-required')"
      />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import type { Game } from '@/types/Game'
import GameDetailHeader from './game/GameDetailHeader.vue'
import GameDetailActions from './game/GameDetailActions.vue'
import GameDetailBody from './game/GameDetailBody.vue'
import GameDetailFooter from './game/GameDetailFooter.vue'

const props = defineProps<{
  modelValue: boolean
  game: Game | null
}>()

const { xs, sm, md } = useDisplay()
const isMobile = computed(() => xs.value || sm.value)

const dialogMaxWidth = computed(() => {
  if (xs.value) return '100vw'
  if (sm.value) return '90vw'
  if (md.value) return 700
  return 800
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'report-inaccuracy': [gameName: string]
  'auth-required': []
  'open-login-dialog': []
}>()

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
</script>
