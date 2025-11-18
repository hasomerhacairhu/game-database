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
import type { Game } from '@/types/Game'
import GameDetailHeader from './game/GameDetailHeader.vue'
import GameDetailActions from './game/GameDetailActions.vue'
import GameDetailBody from './game/GameDetailBody.vue'
import GameDetailFooter from './game/GameDetailFooter.vue'

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
