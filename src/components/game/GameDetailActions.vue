<template>
  <div>
    <!-- Akció gombok -->
    <v-row dense class="mb-3">
      <v-col cols="6">
        <div :class="{ 'shake-animation': isShaking }">
          <TriedGameButton
            :game-id="gameId"
            :game-name="gameName"
            class="w-100"
          />
        </div>
      </v-col>
      <v-col cols="6">
        <FavoriteButton
          :game-id="gameId"
          :game-name="gameName"
          size="large"
          class="w-100"
        />
      </v-col>
    </v-row>

    <!-- Értékelési panel -->
    <RatingPanel
      :game-id="gameId"
      :game-name="gameName"
      @shake-tried-button="handleShakeTriedButton"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FavoriteButton from '../interactions/FavoriteButton.vue'
import TriedGameButton from '../interactions/TriedGameButton.vue'
import RatingPanel from '../interactions/RatingPanel.vue'

defineProps<{
  gameId: string
  gameName: string
}>()

const isShaking = ref(false)

const handleShakeTriedButton = () => {
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 600)
}
</script>

<style scoped lang="scss">
.shake-animation {
  animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-8px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(8px);
  }
}
</style>
