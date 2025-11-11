<template>
  <v-app-bar 
    color="primary" 
    elevation="2" 
    :prominent="!scrolled"
    :height="scrolled ? 64 : undefined"
    scroll-behavior="elevate"
    class="header-bar"
  >
    <v-container class="header-content d-flex align-center">
      <v-img
        :src="logoUrl"
        alt="Somer Logo"
        :max-width="scrolled ? 40 : 50"
        class="mr-3"
        style="transition: all 0.3s ease;"
      ></v-img>
      
      <v-toolbar-title :class="scrolled ? 'text-h6' : 'text-h5'" class="font-weight-bold" style="transition: all 0.3s ease;">
        Somer Játékadatbázis
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        href="https://somer.hu"
        target="_blank"
        color="white"
        variant="outlined"
        :size="scrolled ? 'small' : 'default'"
      >
        <v-icon start>mdi-open-in-new</v-icon>
        <span v-if="!scrolled || $vuetify.display.mdAndUp">Ugrás a somer.hu-ra</span>
        <span v-else>Somer.hu</span>
      </v-btn>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import logoSvg from '@/assets/somer-semel-white-with-transparent-bg.svg'

const logoUrl = logoSvg
const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.v-toolbar-title {
  color: white;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}
</style>
