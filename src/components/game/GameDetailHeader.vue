<template>
  <div>
    <!-- Játék neve -->
    <div class="mb-1">
      <span class="text-h5 font-weight-bold">{{ game.name }}</span>
    </div>
    
    <!-- További néven is ismert -->
    <div v-if="game.otherNames" class="mb-3">
      <span class="text-caption text-medium-emphasis">További néven is ismert: </span>
      <span class="text-body-2">{{ game.otherNames }}</span>
    </div>

    <!-- Játék célja -->
    <div v-if="game.goal" class="mt-4">
      <div class="text-subtitle-1 font-weight-bold mb-1">🎯 Játék célja</div>
      <div class="text-body-1">{{ game.goal }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Game } from '@/types/Game'

defineProps<{
  game: Game
}>()
</script>
