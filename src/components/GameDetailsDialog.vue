<template>
  <v-dialog v-model="dialogOpen" max-width="800" scrollable>
    <v-card v-if="game">
      <v-card-title class="text-h5 bg-primary">
        <span class="text-white">{{ game.name }}</span>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pt-4">
        <!-- További elnevezések -->
        <div v-if="game.altNames" class="mb-4">
          <div class="text-subtitle-2 text-medium-emphasis mb-1">További elnevezések:</div>
          <div class="text-body-1">{{ game.altNames }}</div>
        </div>

        <!-- Játék célja -->
        <div v-if="game.goal" class="mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-1">🎯 Játék célja</div>
          <div class="text-body-1">{{ game.goal }}</div>
        </div>

        <!-- Szabályok -->
        <div v-if="game.rules" class="mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-1">📋 Szabályok</div>
          <div class="text-body-1" style="white-space: pre-wrap;">{{ game.rules }}</div>
        </div>

        <!-- Kellékek -->
        <div v-if="game.materials" class="mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-1">🛠️ Kellékek</div>
          <div class="text-body-1">{{ game.materials }}</div>
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Chipek -->
        <v-row dense>
          <!-- Tér -->
          <v-col cols="12" v-if="spaceChips.length > 0">
            <div class="text-subtitle-2 mb-2">Tér:</div>
            <v-chip
              v-for="chip in spaceChips"
              :key="chip"
              class="mr-2 mb-2"
              color="blue"
              variant="flat"
            >
              {{ chip }}
            </v-chip>
          </v-col>

          <!-- Csoportdinamikai fázis -->
          <v-col cols="12" v-if="groupPhaseChips.length > 0">
            <div class="text-subtitle-2 mb-2">Csoportdinamikai fázis:</div>
            <v-chip
              v-for="chip in groupPhaseChips"
              :key="chip"
              class="mr-2 mb-2"
              color="purple"
              variant="flat"
            >
              {{ chip }}
            </v-chip>
          </v-col>

          <!-- Korosztály -->
          <v-col cols="12" v-if="ageGroupChips.length > 0">
            <div class="text-subtitle-2 mb-2">Korosztály:</div>
            <v-chip
              v-for="chip in ageGroupChips"
              :key="chip"
              class="mr-2 mb-2"
              color="orange"
              variant="flat"
            >
              {{ chip }}
            </v-chip>
          </v-col>

          <!-- Létszám -->
          <v-col cols="12" v-if="groupSizeChips.length > 0">
            <div class="text-subtitle-2 mb-2">Létszám:</div>
            <v-chip
              v-for="chip in groupSizeChips"
              :key="chip"
              class="mr-2 mb-2"
              color="green"
              variant="flat"
            >
              {{ chip }}
            </v-chip>
          </v-col>

          <!-- Időtartam -->
          <v-col cols="12" v-if="durationChips.length > 0">
            <div class="text-subtitle-2 mb-2">Időtartam:</div>
            <v-chip
              v-for="chip in durationChips"
              :key="chip"
              class="mr-2 mb-2"
              color="teal"
              variant="flat"
            >
              {{ chip }}
            </v-chip>
          </v-col>

          <!-- Funkció -->
          <v-col cols="12" v-if="functionChips.length > 0">
            <div class="text-subtitle-2 mb-2">Funkció:</div>
            <v-chip
              v-for="chip in functionChips"
              :key="chip"
              class="mr-2 mb-2"
              color="indigo"
              variant="flat"
            >
              {{ chip }}
            </v-chip>
          </v-col>
        </v-row>

        <!-- Forrás -->
        <div v-if="game.source" class="mt-4">
          <v-btn
            :href="game.source"
            target="_blank"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-link"
          >
            🔗 Forrás megtekintése
          </v-btn>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="dialogOpen = false">
          Bezárás
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Game } from '@/types/Game'

const props = defineProps<{
  modelValue: boolean
  game: Game | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Chipek generálása
const spaceChips = computed(() => {
  const chips: string[] = []
  if (props.game?.outdoorSpace) chips.push('Kültéren játszható')
  if (props.game?.indoorSpace) chips.push('Beltéren játszható')
  return chips
})

const groupPhaseChips = computed(() => {
  const chips: string[] = []
  if (props.game?.groupPhaseForming) chips.push('Alakulás')
  if (props.game?.groupPhaseStorming) chips.push('Viharzás')
  if (props.game?.groupPhaseNorming) chips.push('Normázás')
  if (props.game?.groupPhasePerforming) chips.push('Működés')
  return chips
})

const ageGroupChips = computed(() => {
  const chips: string[] = []
  if (props.game?.age0to5) chips.push('0-5')
  if (props.game?.age6to10) chips.push('6-10')
  if (props.game?.age11to13) chips.push('11-13')
  if (props.game?.age14to16) chips.push('14-16')
  if (props.game?.age17plus) chips.push('17+')
  return chips
})

const groupSizeChips = computed(() => {
  const chips: string[] = []
  if (props.game?.groupSizeSmall) chips.push('Kis csoport (3-5 fő)')
  if (props.game?.groupSizeMedium) chips.push('Közepes csoport (6-15 fő)')
  if (props.game?.groupSizeLarge) chips.push('Nagy csoport (16-30 fő)')
  if (props.game?.groupSizeCommunity) chips.push('Közösség (30+ fő)')
  return chips
})

const durationChips = computed(() => {
  const chips: string[] = []
  if (props.game?.duration3to10) chips.push('3-10 perc')
  if (props.game?.duration11to20) chips.push('11-20 perc')
  if (props.game?.duration21to30) chips.push('21-30 perc')
  if (props.game?.duration30plus) chips.push('30+ perc')
  return chips
})

const functionChips = computed(() => {
  const chips: string[] = []
  if (props.game?.function1) chips.push(props.game.function1)
  if (props.game?.function2) chips.push(props.game.function2)
  if (props.game?.function3) chips.push(props.game.function3)
  return chips
})
</script>
