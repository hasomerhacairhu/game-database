<template>
  <v-app-bar 
    color="primary" 
    elevation="2" 
    :height="scrolled ? 70 : 120"
    scroll-behavior="elevate"
    class="header-bar"
  >
    <v-container class="header-content">
      <div class="d-flex align-center" :style="{ height: scrolled ? '70px' : '120px', transition: 'all 0.4s ease' }">
        <v-img
          :src="logoUrl"
          alt="Somer Logo"
          :max-width="scrolled ? 40 : 60"
          class="mr-4"
          style="transition: all 0.4s ease;"
        ></v-img>
        
        <div class="title-container">
          <div :class="scrolled ? 'text-h5' : 'text-h3'" class="main-title">
            JÁTÉKADATBÁZIS
          </div>
          <div 
            v-show="!scrolled" 
            class="subtitle"
          >
            A Hasomer Hacair nagy játékgyűjteménye ifjúsági vezetők részére.
          </div>
        </div>

        <v-spacer></v-spacer>

        <div class="d-flex align-center gap-3">
          <v-btn
            v-if="!isAuthenticated"
            href="https://somer.hu"
            target="_blank"
            color="white"
            variant="outlined"
            size="default"
            class="header-btn"
          >
            <v-icon start>mdi-open-in-new</v-icon>
            <span v-if="!scrolled || $vuetify.display.mdAndUp">Ugrás a somer.hu-ra</span>
            <span v-else>Somer.hu</span>
          </v-btn>

          <UserMenu />
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import logoSvg from '@/assets/somer-semel-white-with-transparent-bg.svg'
import UserMenu from './UserMenu.vue'

const { isAuthenticated } = useAuth()
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
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.header-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.4s ease;
}

.title-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.4s ease;
}

.main-title {
  color: white;
  font-family: 'Myriad Pro Black Italic', sans-serif !important;
  font-weight: normal !important;
  font-style: normal !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.2;
  transition: all 0.4s ease;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Myriad Pro Regular', sans-serif !important;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  line-height: 1.3;
  max-width: 600px;
  transition: opacity 0.4s ease, transform 0.4s ease;
  opacity: 1;
  transform: translateY(0);
}

.subtitle.v-leave-active {
  opacity: 0;
  transform: translateY(-10px);
}

.gap-3 {
  gap: 12px;
}

.header-btn {
  transition: all 0.3s ease;
  min-height: 40px;
}
</style>
